import { motion } from 'motion/react';
import { ArrowRight, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-amber-500/5 blur-[100px] rounded-full" 
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-300 font-medium">Hosted in Sweden (EU)</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
        >
          Deploy Autonomous AI <br />
          <span className="text-white">Without the Headache</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The managed hosting platform for OpenClaw. No Docker. No maintenance. 
          Just bring your API keys and deploy production-ready agents in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/signup" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer">
            Start Deploying
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#pricing" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-medium transition-all hover:scale-105 cursor-pointer">
            View Pricing
          </a>
        </motion.div>

        {/* Mock Interface Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative mx-auto max-w-5xl [perspective:1000px]"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-xl border border-white/10 bg-[#0F0F11] shadow-2xl overflow-hidden relative z-10"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="ml-4 px-3 py-1 rounded bg-black/50 border border-white/5 text-xs font-mono text-gray-500 flex items-center gap-2">
                <Globe className="w-3 h-3" />
                clawnest.eu/dashboard/agent-01
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Sidebar Mock */}
              <div className="hidden md:block col-span-1 space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
                  <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Operational
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</div>
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>CPU</span>
                      <span>12%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[12%] bg-blue-500" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Memory</span>
                      <span>450MB</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[30%] bg-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content Mock */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Agent Configuration</h3>
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20">v2.4.0</span>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-white/10 bg-black/20 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white">Model Provider</span>
                      <span className="text-xs text-gray-500">BYOK</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-4 h-4 rounded bg-green-900/50 flex items-center justify-center text-[10px] text-green-400">AI</div>
                      OpenAI (GPT-4o)
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-white/10 bg-black/20 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white">Personality</span>
                      <span className="text-xs text-gray-500">Custom</span>
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                      "Helpful, concise, and technical..."
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Live Logs</div>
                  <div className="font-mono text-xs text-gray-400 space-y-1">
                    <div className="flex gap-2">
                      <span className="text-gray-600">23:42:10</span>
                      <span className="text-blue-400">[INFO]</span>
                      <span>Connected to Tailscale network</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-600">23:42:12</span>
                      <span className="text-green-400">[SUCCESS]</span>
                      <span>Agent initialized successfully</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-600">23:42:15</span>
                      <span className="text-blue-400">[INFO]</span>
                      <span>Listening for incoming tasks...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Decorative Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-2xl opacity-50 -z-10" />
        </motion.div>
      </div>
    </section>
  );
};
