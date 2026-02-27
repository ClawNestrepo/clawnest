import { motion } from 'motion/react';

const companies = [
  "Acme Corp", "TechFlow", "DataSystems", "CloudScale", "AI Solutions", 
  "FutureWorks", "NeuralNet", "CyberDyne", "SkyNet", "Massive Dynamic"
];

export const TrustedBy = () => {
  return (
    <section className="py-10 border-y border-white/5 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-gray-500 mb-8 font-medium uppercase tracking-widest">
          Trusted by innovative teams across Europe
        </p>
        
        <div className="relative flex overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
          
          <motion.div 
            className="flex gap-16 items-center whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...companies, ...companies, ...companies].map((company, index) => (
              <span key={index} className="text-xl font-bold text-gray-700 hover:text-gray-500 transition-colors cursor-default">
                {company}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
