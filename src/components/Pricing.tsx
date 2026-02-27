import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: "Starter",
    price: { monthly: "€9.6", annual: "€8" },
    period: "/month",
    description: "Perfect for hobbyists and personal assistants.",
    features: [
      "1 OpenClaw Instance",
      "Weekly Backups",
      "Community Support",
      "Basic GUI Configurator",
      "99.9% Uptime SLA"
    ],
    highlight: false
  },
  {
    name: "Pro",
    price: { monthly: "€24", annual: "€20" },
    period: "/month",
    description: "For professionals automating daily workflows.",
    features: [
      "3 OpenClaw Instances",
      "Daily Backups",
      "Priority Support",
      "Shell Access",
      "Tailscale VPN Integration",
      "Advanced Monitoring"
    ],
    highlight: true
  },
  {
    name: "Team",
    price: { monthly: "€89", annual: "€75" },
    period: "/month",
    description: "Scale your AI workforce with team controls.",
    features: [
      "10 OpenClaw Instances",
      "Hourly Backups",
      "Dedicated Support",
      "Workspace Sharing",
      "SSO / SAML",
      "Custom Retention Policies"
    ],
    highlight: false
  }
];

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Start small and scale as your agent needs grow. No hidden fees for compute or tokens.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-white/10 rounded-full p-1 transition-colors hover:bg-white/20 cursor-pointer"
            >
              <motion.div
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-blue-500 rounded-full shadow-lg"
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
              Yearly <span className="text-blue-400 text-xs ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border ${
                plan.highlight 
                  ? 'bg-white/10 border-blue-500/50 shadow-2xl shadow-blue-500/10' 
                  : 'bg-white/5 border-white/10'
              } flex flex-col`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-400 mt-4">{plan.description}</p>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to="/signup" className={`w-full py-3 rounded-xl font-medium transition-all cursor-pointer block text-center ${
                plan.highlight
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}>
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
