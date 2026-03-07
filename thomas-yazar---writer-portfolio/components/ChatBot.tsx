import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Work } from '../types';
import { chatWithPortfolio } from '../services/geminiService';

interface ChatBotProps {
  works: Work[];
}

const ChatBot: React.FC<ChatBotProps> = ({ works }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'intro',
          role: 'model',
          text: "Hello. I am the author's digital assistant. Curious about a story? Ask me anything.",
          timestamp: Date.now()
        }
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithPortfolio(history, works, userMsg.text);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 sm:w-96 mb-4 overflow-hidden flex flex-col animate-fade-in-up" style={{ height: '500px' }}>
          <div className="bg-ink p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-robot"></i>
              <span className="font-serif italic">Digital Assistant</span>
            </div>
            <button onClick={toggleChat} className="text-white/80 hover:text-white">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-accent text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
               <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 text-sm flex gap-1">
                 <span className="animate-bounce">.</span>
                 <span className="animate-bounce delay-75">.</span>
                 <span className="animate-bounce delay-150">.</span>
               </div>
             </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask about the stories..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <button 
              type="submit" 
              className="bg-ink text-white w-10 h-10 rounded flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={toggleChat}
        className="bg-ink text-white w-14 h-14 rounded-full shadow-lg hover:bg-accent transition-colors flex items-center justify-center text-xl"
      >
        <i className={`fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-comment-dots'}`}></i>
      </button>
    </div>
  );
};

export default ChatBot;