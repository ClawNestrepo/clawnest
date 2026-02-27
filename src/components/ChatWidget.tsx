import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SESSION_ID = Math.random().toString(36).substring(2);

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Hi! I\'m Nestor. How can I help you deploy your AI agent today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, sessionId: SESSION_ID }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please try again later or email support@clawnest.eu."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end font-sans">
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 w-[350px] max-w-[calc(100vw-2rem)] bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    style={{ height: '500px', maxHeight: '70vh' }}
                >
                    <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </div>
                            <span className="font-semibold text-white text-sm">ClawNest Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg cursor-pointer"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white/10 text-gray-200 rounded-bl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
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
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about hosting..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors cursor-pointer"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="text-[10px] text-center text-gray-600 mt-2">
                            Powered by AI. Responses may vary.
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center transition-colors cursor-pointer"
        >
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <X className="w-6 h-6" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="chat"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <MessageCircle className="w-6 h-6" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    </div>
  );
};
