import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Pricing } from '../components/Pricing';
import { TrustedBy } from '../components/TrustedBy';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <Pricing />
        
        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-sm"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to deploy your assistant?</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of developers and teams running OpenClaw on ClawNest. 
                Get started today with a 30-day money-back guarantee.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 cursor-pointer w-full sm:w-auto">
                  Start Your Free Trial
                </Link>
                <button className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-medium text-lg hover:bg-white/5 transition-all cursor-pointer w-full sm:w-auto">
                  Talk to Sales
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/favicon.png" alt="ClawNest" className="w-6 h-6 rounded" />
                <span className="text-lg font-bold text-white">ClawNest</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                The purpose-built managed hosting platform for OpenClaw. 
                Secure, reliable, and effortless AI agent deployment.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Changelog</a></li>
                <li><a href="/docs" className="hover:text-blue-400 transition-colors">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><Link to="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2026 ClawNest. Hosted in Sweden. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-8 p-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full shadow-lg z-40 cursor-pointer backdrop-blur-sm"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
