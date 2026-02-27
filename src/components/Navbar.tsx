import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isDocs = location.pathname.startsWith('/docs');
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || isDocs ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="ClawNest" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold text-white tracking-tight">ClawNest</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Features</Link>
          <a href="/#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
          <Link to="/docs" className={`text-sm transition-colors ${isDocs ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}>Documentation</Link>
          <Link to="/blog" className="text-sm text-gray-300 hover:text-white transition-colors">Blog</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-white hover:text-blue-400 transition-colors flex items-center gap-2">
                <User className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">Log in</Link>
              <Link to="/signup" className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4 flex flex-col">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white">Features</Link>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white">Pricing</Link>
              <Link to="/docs" onClick={() => setMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white">Documentation</Link>
              <hr className="border-white/10" />
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-lg text-white font-medium">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg text-white">Log in</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
