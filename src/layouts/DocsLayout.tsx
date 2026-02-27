import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Book, Rocket, Key, Shield, Terminal, ChevronRight } from 'lucide-react';

const sidebarLinks = [
  { title: 'Introduction', path: '/docs', icon: <Book className="w-4 h-4" /> },
  { title: 'Getting Started', path: '/docs/getting-started', icon: <Rocket className="w-4 h-4" /> },
  { title: 'API Keys (BYOK)', path: '/docs/api-keys', icon: <Key className="w-4 h-4" /> },
  { title: 'Security & GDPR', path: '/docs/security', icon: <Shield className="w-4 h-4" /> },
  { title: 'Shell Access', path: '/docs/shell-access', icon: <Terminal className="w-4 h-4" /> },
];

export const DocsLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Documentation
              </h3>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.icon}
                      {link.title}
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="ml-auto"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <ChevronRight className="w-3 h-3" />
                        </motion.div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20">
              <h4 className="text-sm font-semibold text-white mb-2">Need help?</h4>
              <p className="text-xs text-gray-400 mb-3">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a 
                href="mailto:support@clawnest.eu"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                Contact Support <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-24">
          <div className="prose prose-invert prose-blue max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
