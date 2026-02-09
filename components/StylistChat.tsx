
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, User, Bot, Loader2 } from 'lucide-react';
import { getStylingAdvice } from '../services/geminiService';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6t7ea5QCdTITMFucAq-baDdBVUgUxJe-vJRvcQLtjKySHF_S8qUvuGpD0zfNKlG9l/exec';

const StylistChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Hi! I'm your UNIKA Style Assistant. Looking for a t-shirt for a specific event or need some fashion advice?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Create a persistent customer ID for this session
  const customerIdRef = useRef<string>(`cust-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const syncMessageToCloud = async (sender: string, text: string) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          chatAction: 'saveMessage',
          sender: sender,
          message: text,
          customerId: customerIdRef.current
        })
      });
    } catch (err) {
      console.warn("Cloud sync failed, message stored locally only.");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    // Sync user message to cloud
    syncMessageToCloud('Customer', userMsg);
    
    setIsTyping(true);
    const response = await getStylingAdvice(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsTyping(false);
    
    // Sync AI response to cloud
    syncMessageToCloud('AI Assistant', response);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1 rounded-lg">
                <Bot size={20} />
              </div>
              <span className="font-bold">Style AI</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="text-sm">{m.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">Stylist is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="What should I wear for..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-2 p-1.5 bg-black text-white rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center space-x-2"
        >
          <MessageCircle size={24} />
          <span className="hidden sm:inline font-bold pr-2">Ask Stylist</span>
        </button>
      )}
    </div>
  );
};

export default StylistChat;
