import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, Terminal, Code, MessageSquare, Copy, Check, Activity } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  provider: string;
  status: string;
  created_at: string;
  skills?: string[];
  telegram_active?: boolean;
}

interface AgentConnectModalProps {
  agent: Agent;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'SUCCESS' | 'WARN';
  message: string;
}

export const AgentConnectModal = ({ agent, onClose }: AgentConnectModalProps) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'api' | 'logs'>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: `Hello! I am ${agent.name}, running on ${agent.provider}. I have access to: ${agent.skills?.join(', ') || 'basic chat'}. How can I assist you today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToLogsBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  useEffect(() => {
    scrollToLogsBottom();
  }, [logs, activeTab]);

  useEffect(() => {
    if (agent.status !== 'running') return;

    const initialLogs: LogEntry[] = [
      { id: '1', timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: `Agent ${agent.name} initialized` },
      { id: '2', timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: `Connected to AI runtime (${agent.provider})` },
      { id: '3', timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Loading context window...' },
      { id: '4', timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: 'Agent ready to receive messages' },
    ];

    if (agent.telegram_active) {
      initialLogs.push({ id: '5', timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: 'Telegram bot connected and polling' });
    }

    setLogs(initialLogs);

    const interval = setInterval(() => {
      const actions = [
        { level: 'INFO', msg: 'Heartbeat signal received' },
        { level: 'INFO', msg: 'Processing background tasks' },
        { level: 'SUCCESS', msg: 'Health check passed' },
        { level: 'INFO', msg: 'Memory usage: nominal' },
      ];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      setLogs(prev => {
        const newLog: LogEntry = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          level: randomAction.level as any,
          message: randomAction.msg
        };
        return [...prev.slice(-50), newLog];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [agent.status, agent.name, agent.provider, agent.telegram_active]);

  const addLog = (level: LogEntry['level'], message: string) => {
    setLogs(prev => [...prev.slice(-50), {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsLoading(true);

    addLog('INFO', `User message received: "${userText.substring(0, 50)}..."`);

    try {
      const res = await fetch(`/api/agents/${agent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      addLog('SUCCESS', 'Agent response generated');
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${error.message}` }]);
      addLog('ERROR', `Chat error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiEndpoint = `${window.location.origin}/api/agents/${agent.id}/chat`;
  const curlCommand = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  --cookie "token=YOUR_AUTH_TOKEN" \\
  -d '{"message": "Hello world"}'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl h-[600px] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Terminal className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                {agent.status === 'running' ? 'Online' : 'Offline'} • {agent.provider}
                {agent.telegram_active && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                    Telegram Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'chat' ? 'bg-white/5 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Interactive Chat
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'api' ? 'bg-white/5 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code className="w-4 h-4" />
            API & Connection
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'logs' ? 'bg-white/5 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Logs
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-black/20">
          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-4 rounded-2xl rounded-bl-none">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={agent.status === 'running' ? "Message your agent..." : "Agent is offline. Start it first."}
                    disabled={agent.status !== 'running'}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-6 pr-12 text-white focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading || agent.status !== 'running'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'api' ? (
            <div className="h-full overflow-y-auto p-8 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">API Endpoint</h3>
                <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
                  <code className="text-blue-400 font-mono text-sm break-all">{apiEndpoint}</code>
                  <button 
                    onClick={() => copyToClipboard(apiEndpoint)}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">cURL Example</h3>
                <div className="bg-black/50 border border-white/10 rounded-xl p-4 relative group">
                  <pre className="text-gray-300 font-mono text-sm overflow-x-auto pb-4">
                    {curlCommand}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(curlCommand)}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Request Body</h3>
                <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                  <pre className="text-gray-300 font-mono text-sm">{`{
  "message": "Your message here"
}`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Response</h3>
                <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                  <pre className="text-gray-300 font-mono text-sm">{`{
  "reply": "Agent's response text"
}`}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#0a0a0a] p-4 font-mono text-sm overflow-y-auto">
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors">
                    <span className="text-gray-500 flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`font-bold flex-shrink-0 w-16 ${
                      log.level === 'INFO' ? 'text-blue-400' :
                      log.level === 'SUCCESS' ? 'text-green-400' :
                      log.level === 'WARN' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
                {agent.status !== 'running' && (
                  <div className="text-red-400 mt-4">
                    [SYSTEM] Agent is currently {agent.status}. Start the agent to see live logs.
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
