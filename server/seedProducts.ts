import { getUncachableStripeClient } from './stripeClient.js';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  const products = await stripe.products.search({ query: "name:'ClawNest Pro'" });
  if (products.data.length > 0) {
    console.log('ClawNest Pro product already exists:', products.data[0].id);
    const prices = await stripe.prices.list({ product: products.data[0].id, active: true });
    for (const price of prices.data) {
      console.log(`  Price: ${price.id} - ${price.unit_amount! / 100} ${price.currency}/${price.recurring?.interval || 'one-time'}`);
    }
    return;
  }

  const product = await stripe.products.create({
    name: 'ClawNest Pro',
    description: 'Upgrade to Pro plan - Deploy up to 10 AI agents with Telegram integration',
    metadata: {
      plan: 'Pro',
    },
  });
  console.log('Created product:', product.id);

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 2400,
    currency: 'eur',
    recurring: { interval: 'month' },
    metadata: { plan: 'Pro' },
  });
  console.log('Created monthly price:', monthlyPrice.id, '- €24/month');
}

createProducts().catch(console.error);
