import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Server, Activity, Cpu, HardDrive, Plus, X, Loader2, CheckCircle, AlertCircle, Terminal, Play, Square, RotateCw, Trash2, AlertTriangle, Settings, MessageSquare, Globe, Code2, BarChart3, Image as ImageIcon, Crown } from 'lucide-react';
import { AgentConnectModal } from '../components/AgentConnectModal';

interface Agent {
  id: number;
  name: string;
  provider: string;
  status: string;
  created_at: string;
  skills?: string[];
  system_prompt?: string;
  telegram_active?: boolean;
  integrations?: {
    telegram?: { botToken: string };
    discord?: { webhookUrl: string };
    twitter?: { apiKey: string; apiSecret: string };
  };
}

const AVAILABLE_SKILLS = [
  { id: 'web_search', name: 'Web Search', icon: Globe, description: 'Access real-time information from the internet' },
  { id: 'code_exec', name: 'Code Execution', icon: Code2, description: 'Run Python/JS code for calculations' },
  { id: 'data_analysis', name: 'Data Analysis', icon: BarChart3, description: 'Analyze and visualize complex datasets' },
  { id: 'image_gen', name: 'Image Generation', icon: ImageIcon, description: 'Create images from text descriptions' },
];

export const Dashboard = () => {
  const { user, logout, upgradeToPro, manageSubscription } = useAuth();
  const plan = (user?.plan as 'Starter' | 'Pro') || 'Starter';
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('OpenAI');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState<{ 
    telegram?: { botToken: string }, 
    discord?: { webhookUrl: string },
    twitter?: { apiKey: string; apiSecret: string }
  }>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [connectingAgent, setConnectingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxAgents = plan === 'Pro' ? 10 : 1;
  const canCreateAgent = agents.length < maxAgents;

  const handleOpenCreate = () => {
    if (!canCreateAgent) {
      setFormError('');
      return;
    }
    setEditingAgent(null);
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setProvider(agent.provider);
    setSystemPrompt(agent.system_prompt || '');
    setSkills(agent.skills || []);
    setIntegrations(agent.integrations || {});
    setFormError('');
    setShowForm(true);
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const url = editingAgent ? `/api/agents/${editingAgent.id}` : '/api/agents';
      const method = editingAgent ? 'PUT' : 'POST';
      
      const body: any = { name, provider, skills, integrations, system_prompt: systemPrompt };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save agent');
      }

      if (editingAgent) {
        setAgents(agents.map(a => a.id === editingAgent.id ? data.agent : a));
      } else {
        setAgents([data.agent, ...agents]);
      }
      
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (agentId: number, newStatus: string) => {
    try {
      setAgents(agents.map(a => a.id === agentId ? { ...a, status: newStatus === 'restarting' ? 'running' : newStatus } : a));

      const res = await fetch(`/api/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        fetchAgents();
        throw new Error('Failed to update status');
      }

      const data = await res.json();
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: data.status, telegram_active: data.telegram_active } : a));
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleDeleteAgent = async () => {
    if (!deleteConfirmationId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/agents/${deleteConfirmationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete agent');
      }

      setAgents(agents.filter(a => a.id !== deleteConfirmationId));
      setDeleteConfirmationId(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setProvider('OpenAI');
    setSystemPrompt('');
    setSkills([]);
    setIntegrations({});
    setFormError('');
  };

  const toggleSkill = (skillId: string) => {
    setSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  return (
    <div className="min-h-screen pt-24 px-6 container mx-auto pb-12 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 flex items-center gap-2">
            Welcome back, {user?.name || user?.email}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              plan === 'Pro' 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}>
              {plan} Plan
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {plan === 'Starter' && (
            <button
              onClick={upgradeToPro}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
          )}
          {plan === 'Pro' && (
             <button
              onClick={manageSubscription}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Manage Subscription
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-[#111] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">Active Agents</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-white">
              {agents.filter(a => a.status === 'running').length}
              <span className="text-lg text-gray-500 font-normal ml-1">
                / {plan === 'Pro' ? '10' : '1'}
              </span>
            </div>
            {plan === 'Starter' && (
              <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                Upgrade for more
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-[#111] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">System Status</span>
          </div>
          <div className="text-3xl font-bold text-green-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            All Systems Operational
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#111] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">Telegram Bots</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {agents.filter(a => a.telegram_active).length}
            <span className="text-lg text-gray-500 font-normal ml-1">active</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-white/10 bg-[#111] p-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingAgent ? 'Edit Agent' : 'Deploy New Agent'}</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveAgent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="e.g., Customer Support Bot"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model Provider</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['OpenAI', 'Anthropic', 'Mistral', 'Google'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        provider === p
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-black/50 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  All providers are powered by our built-in AI runtime. No API key needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt (Optional)</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  placeholder="Define your agent's personality, role, and behavior..."
                  rows={4}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty for a default helpful assistant persona.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capabilities & Skills</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          skills.includes(skill.id)
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-black/50 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-xl"><Icon className="w-5 h-5" /></span>
                        <div className="text-left">
                          <span className={`text-sm font-medium block sm:inline ${skills.includes(skill.id) ? 'text-blue-400' : 'text-gray-300'}`}>
                            {skill.name}
                          </span>
                          <span className="text-xs text-gray-400 block sm:inline sm:ml-2">
                            {skill.description}
                          </span>
                        </div>
                        {skills.includes(skill.id) && (
                          <CheckCircle className="w-4 h-4 text-blue-500 ml-auto flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Integrations</label>
                <div className="space-y-4">
                  <div className="p-4 bg-black/50 border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        <span className="font-medium text-white">Telegram Bot</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={!!integrations.telegram}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setIntegrations({ ...integrations, telegram: { botToken: '' } });
                            } else {
                              const { telegram, ...rest } = integrations;
                              setIntegrations(rest);
                            }
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {integrations.telegram && (
                      <div>
                        <input
                          type="text"
                          value={integrations.telegram.botToken}
                          onChange={(e) => setIntegrations({ ...integrations, telegram: { botToken: e.target.value } })}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="Enter Telegram Bot Token from @BotFather"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Get a token from @BotFather on Telegram. The bot will auto-start when the agent runs.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-transparent hover:bg-white/5 text-gray-300 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingAgent ? 'Save Changes' : 'Deploy Agent')}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="agent-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {agents.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Your Agents</h2>
                  <div className="flex items-center gap-3">
                    {!canCreateAgent && plan === 'Starter' && (
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
                        Upgrade to Pro to create more agents
                      </span>
                    )}
                    <button
                      onClick={canCreateAgent ? handleOpenCreate : upgradeToPro}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                        canCreateAgent
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                      }`}
                    >
                      {canCreateAgent ? (
                        <>
                          <Plus className="w-4 h-4" />
                          New Agent
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4" />
                          Upgrade to Pro
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <div key={agent.id} className="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-colors group relative overflow-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                          <Terminal className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.telegram_active && (
                            <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                              TG
                            </span>
                          )}
                          <div className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                            agent.status === 'running' ? 'bg-green-500/10 text-green-400' : 
                            agent.status === 'restarting' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {agent.status}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">Provider: {agent.provider}</p>
                      
                      {agent.skills && agent.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {agent.skills.map(skillId => {
                            const skill = AVAILABLE_SKILLS.find(s => s.id === skillId);
                            if (!skill) return null;
                            const Icon = skill.icon;
                            return (
                              <span key={skillId} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-300 flex items-center gap-1">
                                <span><Icon className="w-3 h-3" /></span> {skill.name}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {agent.status === 'running' ? (
                            <button 
                              onClick={() => handleStatusChange(agent.id, 'stopped')}
                              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                              title="Stop Agent"
                            >
                              <Square className="w-4 h-4 fill-current" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusChange(agent.id, 'running')}
                              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                              title="Start Agent"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleStatusChange(agent.id, 'restarting')}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                            title="Restart Agent"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setConnectingAgent(agent)}
                            className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 mr-2"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Connect
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(agent)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Edit Agent"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmationId(agent.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Agent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#111] p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HardDrive className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Agents Deployed</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't deployed any AI agents yet. Get started by creating your first agent - no API keys required!
                </p>
                <button 
                  onClick={handleOpenCreate}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Deploy New Agent
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {connectingAgent && (
          <AgentConnectModal 
            agent={connectingAgent} 
            onClose={() => setConnectingAgent(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmationId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Agent?</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this agent? All associated data, Telegram connections, and logs will be permanently removed.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAgent}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Agent'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
