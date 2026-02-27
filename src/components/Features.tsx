import { motion } from 'motion/react';
import { Shield, Zap, Server, Lock, RefreshCw, Terminal } from 'lucide-react';
import React, { useRef, useState, ReactNode, MouseEvent } from 'react';

const features = [
  {
    icon: <Server className="w-6 h-6 text-blue-400" />,
    title: "Managed Infrastructure",
    description: "Forget Docker and VPS maintenance. We handle the hardware, updates, and patching so you don't have to."
  },
  {
    icon: <Shield className="w-6 h-6 text-green-400" />,
    title: "EU Data Residency",
    description: "Hosted securely in Sweden on enterprise-grade infrastructure using 100% renewable energy. GDPR friendly."
  },
  {
    icon: <Lock className="w-6 h-6 text-amber-400" />,
    title: "Bring Your Own Key",
    description: "Connect OpenAI, Anthropic, or OpenRouter keys directly. No markup on AI tokens, ever."
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-purple-400" />,
    title: "Auto-Backups & Rollbacks",
    description: "Weekly or daily backups with one-click restore. Never lose your agent's configuration or memory."
  },
  {
    icon: <Terminal className="w-6 h-6 text-gray-400" />,
    title: "Shell & VPN Access",
    description: "For power users: get direct shell access and connect securely via Tailscale on Pro/Team plans."
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    title: "Instant Deployment",
    description: "Go from zero to a fully functional, always-on AI assistant in minutes via our intuitive dashboard."
  }
];

const SpotlightCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
        }}
      />
      <div className="relative h-full p-6">{children}</div>
    </motion.div>
  );
};

export const Features = () => {
  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full stroke-white/5 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern
              id="grid-pattern"
              width={40}
              height={40}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 40V.5H40" fill="none" stroke="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Reliability</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to run autonomous agents in production, without the operational burden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="h-full">
              <SpotlightCard className="h-full">
                <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
