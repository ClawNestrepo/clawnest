import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ChatWidget } from './components/ChatWidget';
import { LandingPage } from './pages/Landing';
import { Introduction } from './pages/docs/Introduction';
import { GettingStarted } from './pages/docs/GettingStarted';
import { APIKeys } from './pages/docs/APIKeys';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Blog } from './pages/Blog';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 relative">
          <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
          <Navbar />
          
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blog" element={<Blog />} />
            
            <Route path="/docs" element={<Introduction />} />
            <Route path="/docs/getting-started" element={<GettingStarted />} />
            <Route path="/docs/api-keys" element={<APIKeys />} />
            {/* Fallback for other docs links */}
            <Route path="/docs/*" element={<Introduction />} />
          </Routes>

          <ChatWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}
