import express, { Request, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatWithAgent, clearAgentHistory, chatSupport } from './server/agentRuntime.js';
import { startTelegramBot, stopTelegramBot, isTelegramBotActive } from './server/telegramManager.js';
import { getUncachableStripeClient, getStripePublishableKey, getStripeSync } from './server/stripeClient.js';
import { WebhookHandlers } from './server/webhookHandlers.js';
import { runMigrations } from 'stripe-replit-sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database('clawnest.db');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    plan TEXT DEFAULT 'Starter',
    stripe_customer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL DEFAULT '',
    status TEXT DEFAULT 'stopped',
    skills TEXT DEFAULT '[]',
    integrations TEXT DEFAULT '{}',
    system_prompt TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

try {
  const usersInfo = db.pragma('table_info(users)');
  const hasPlan = usersInfo.some((col: any) => col.name === 'plan');
  if (!hasPlan) {
    db.prepare("ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'Starter'").run();
  }
  const hasStripeCustomerId = usersInfo.some((col: any) => col.name === 'stripe_customer_id');
  if (!hasStripeCustomerId) {
    db.prepare("ALTER TABLE users ADD COLUMN stripe_customer_id TEXT").run();
    console.log('Added stripe_customer_id column to users table');
  }
} catch (error) {
  console.error('Users migration error:', error);
}

try {
  const tableInfo = db.pragma('table_info(agents)');
  const hasSkills = tableInfo.some((col: any) => col.name === 'skills');
  if (!hasSkills) {
    db.prepare('ALTER TABLE agents ADD COLUMN skills TEXT DEFAULT "[]"').run();
  }
  const hasIntegrations = tableInfo.some((col: any) => col.name === 'integrations');
  if (!hasIntegrations) {
    db.prepare('ALTER TABLE agents ADD COLUMN integrations TEXT DEFAULT "{}"').run();
  }
  const hasSystemPrompt = tableInfo.some((col: any) => col.name === 'system_prompt');
  if (!hasSystemPrompt) {
    db.prepare("ALTER TABLE agents ADD COLUMN system_prompt TEXT DEFAULT ''").run();
  }
} catch (error) {
  console.error('Migration error:', error);
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

function parseAgent(agent: any) {
  return {
    ...agent,
    skills: JSON.parse(agent.skills || '[]'),
    integrations: JSON.parse(agent.integrations || '{}'),
    system_prompt: agent.system_prompt || '',
  };
}

function syncTelegramBot(agent: any) {
  const parsed = parseAgent(agent);
  const telegramToken = parsed.integrations?.telegram?.botToken;

  if (parsed.status === 'running' && telegramToken) {
    startTelegramBot(
      { id: parsed.id, name: parsed.name, provider: parsed.provider, skills: parsed.skills, system_prompt: parsed.system_prompt },
      telegramToken
    );
  } else {
    stopTelegramBot(parsed.id);
  }
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('DATABASE_URL not set, Stripe integration disabled');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl, schema: 'stripe' });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    if (webhookBaseUrl !== 'https://undefined') {
      const result = await stripeSync.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/stripe/webhook`
      );
      console.log('Webhook configured:', result?.webhook?.url || 'managed webhook set up');
    }

    stripeSync.syncBackfill()
      .then(() => console.log('Stripe data synced'))
      .catch((err: any) => console.error('Error syncing Stripe data:', err));
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '5000', 10);

  app.use(cookieParser());

  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;

        if (!Buffer.isBuffer(req.body)) {
          return res.status(500).json({ error: 'Webhook processing error' });
        }

        await WebhookHandlers.processWebhook(req.body as Buffer, sig);

        const bodyStr = req.body.toString();
        const event = JSON.parse(bodyStr);

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const customerId = session.customer;
          if (customerId && session.payment_status === 'paid') {
            const user: any = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?').get(customerId);
            if (user) {
              db.prepare("UPDATE users SET plan = 'Pro' WHERE id = ?").run(user.id);
              console.log(`User ${user.id} upgraded to Pro via Stripe checkout`);
            } else {
              console.warn(`Stripe checkout completed for unknown customer: ${customerId}`);
            }
          }
        }

        if (event.type === 'customer.subscription.deleted') {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          if (customerId) {
            const user: any = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?').get(customerId);
            if (user) {
              db.prepare("UPDATE users SET plan = 'Starter' WHERE id = ?").run(user.id);
              console.log(`User ${user.id} downgraded to Starter (subscription cancelled)`);
            }
          }
        }

        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  app.use(express.json());

  const apiRouter = express.Router();

  apiRouter.post('/auth/signup', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insert = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
      const info = insert.run(email, hashedPassword, name || '');

      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(201).json({ user: { id: info.lastInsertRowid, email, name, plan: 'Starter' } });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  apiRouter.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan || 'Starter' } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  apiRouter.get('/auth/me', (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user: any = db.prepare('SELECT id, email, name, plan FROM users WHERE id = ?').get(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({ user: { ...user, plan: user.plan || 'Starter' } });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  apiRouter.post('/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ message: 'Logged out successfully' });
  });

  apiRouter.post('/stripe/checkout', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.plan === 'Pro') {
        return res.status(400).json({ error: 'You are already on the Pro plan' });
      }

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: String(user.id) },
        });
        customerId = customer.id;
        db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, userId);
      }

      const prices = await stripe.prices.list({ active: true, limit: 100 });
      const proPrice = prices.data.find(p => p.metadata?.plan === 'Pro' && p.recurring);

      if (!proPrice) {
        return res.status(500).json({ error: 'Pro plan price not configured. Please contact support.' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: proPrice.id, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/dashboard?upgraded=true`,
        cancel_url: `${baseUrl}/dashboard?cancelled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  apiRouter.post('/stripe/portal', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user?.stripe_customer_id) {
        return res.status(400).json({ error: 'No subscription found' });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: `${baseUrl}/dashboard`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Portal error:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });

  apiRouter.get('/stripe/pubkey', async (_req: Request, res: Response) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      res.status(500).json({ error: 'Stripe not configured' });
    }
  });

  apiRouter.get('/agents', authenticateToken, (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const agents = db.prepare('SELECT * FROM agents WHERE user_id = ? ORDER BY created_at DESC').all(userId);
      const parsedAgents = agents.map((agent: any) => ({
        ...parseAgent(agent),
        api_key: undefined,
        telegram_active: isTelegramBotActive(agent.id),
      }));
      res.json({ agents: parsedAgents });
    } catch (error) {
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  apiRouter.post('/agents', authenticateToken, (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { name, provider, skills, integrations, system_prompt } = req.body;

      if (!name || !provider) {
        return res.status(400).json({ error: 'Name and provider are required' });
      }

      const user: any = db.prepare('SELECT plan FROM users WHERE id = ?').get(userId);
      const userPlan = user?.plan || 'Starter';
      const maxAgents = userPlan === 'Pro' ? 10 : 1;
      const agentCount: any = db.prepare('SELECT COUNT(*) as count FROM agents WHERE user_id = ?').get(userId);

      if (agentCount.count >= maxAgents) {
        return res.status(403).json({ error: userPlan === 'Starter' ? 'Free plan allows only 1 agent. Upgrade to Pro to create more.' : 'You have reached the maximum number of agents for your plan.' });
      }

      const skillsJson = JSON.stringify(skills || []);
      const integrationsJson = JSON.stringify(integrations || {});

      const insert = db.prepare('INSERT INTO agents (user_id, name, provider, api_key, status, skills, integrations, system_prompt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      const info = insert.run(userId, name, provider, '', 'running', skillsJson, integrationsJson, system_prompt || '');

      const newAgent: any = db.prepare('SELECT * FROM agents WHERE id = ?').get(info.lastInsertRowid);

      syncTelegramBot(newAgent);

      const parsed = parseAgent(newAgent);
      res.status(201).json({ agent: { ...parsed, api_key: undefined, telegram_active: isTelegramBotActive(parsed.id) } });
    } catch (error) {
      console.error('Create agent error:', error);
      res.status(500).json({ error: 'Failed to create agent' });
    }
  });

  apiRouter.put('/agents/:id', authenticateToken, (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const agentId = req.params.id;
      const { name, provider, skills, integrations, system_prompt } = req.body;

      if (!name || !provider) {
        return res.status(400).json({ error: 'Name and provider are required' });
      }

      const skillsJson = JSON.stringify(skills || []);
      const integrationsJson = JSON.stringify(integrations || {});

      const result = db.prepare('UPDATE agents SET name = ?, provider = ?, skills = ?, integrations = ?, system_prompt = ? WHERE id = ? AND user_id = ?')
        .run(name, provider, skillsJson, integrationsJson, system_prompt || '', agentId, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      const updatedAgent: any = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);

      clearAgentHistory(Number(agentId));
      syncTelegramBot(updatedAgent);

      const parsed = parseAgent(updatedAgent);
      res.json({ agent: { ...parsed, api_key: undefined, telegram_active: isTelegramBotActive(parsed.id) } });
    } catch (error) {
      console.error('Update agent error:', error);
      res.status(500).json({ error: 'Failed to update agent' });
    }
  });

  apiRouter.patch('/agents/:id/status', authenticateToken, (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const agentId = req.params.id;
      const { status } = req.body;

      if (!['running', 'stopped', 'restarting'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const finalStatus = status === 'restarting' ? 'running' : status;
      const result = db.prepare('UPDATE agents SET status = ? WHERE id = ? AND user_id = ?').run(finalStatus, agentId, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      if (status === 'restarting') {
        clearAgentHistory(Number(agentId));
      }

      const agent: any = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
      syncTelegramBot(agent);

      res.json({ message: 'Status updated', status: finalStatus, telegram_active: isTelegramBotActive(Number(agentId)) });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  apiRouter.delete('/agents/:id', authenticateToken, (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const agentId = req.params.id;

      stopTelegramBot(Number(agentId));
      clearAgentHistory(Number(agentId));

      const result = db.prepare('DELETE FROM agents WHERE id = ? AND user_id = ?').run(agentId, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({ message: 'Agent deleted' });
    } catch (error) {
      console.error('Delete agent error:', error);
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  });

  apiRouter.post('/agents/:id/chat', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const agentId = req.params.id;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const agent: any = db.prepare('SELECT * FROM agents WHERE id = ? AND user_id = ?').get(agentId, userId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      if (agent.status !== 'running') {
        return res.status(400).json({ error: 'Agent is not running' });
      }

      const parsed = parseAgent(agent);
      const reply = await chatWithAgent(
        parsed.id,
        { name: parsed.name, provider: parsed.provider, skills: parsed.skills, system_prompt: parsed.system_prompt },
        message
      );

      res.json({ reply });
    } catch (error) {
      console.error('Agent chat error:', error);
      res.status(500).json({ error: 'Failed to get response from agent' });
    }
  });

  apiRouter.post('/support/chat', async (req: Request, res: Response) => {
    try {
      const { message, sessionId } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const reply = await chatSupport(message, sessionId || 'default');
      res.json({ reply });
    } catch (error) {
      console.error('Support chat error:', error);
      res.status(500).json({ error: 'Failed to get support response' });
    }
  });

  app.use('/api', apiRouter);

  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  await initStripe();

  const runningAgents = db.prepare("SELECT * FROM agents WHERE status = 'running'").all();
  for (const agent of runningAgents) {
    syncTelegramBot(agent);
  }
  console.log(`Restored ${runningAgents.length} running agent(s)`);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
