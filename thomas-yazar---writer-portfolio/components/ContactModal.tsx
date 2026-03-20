import React, { useState, useEffect } from 'react';
import { saveMessage } from '../services/storageService';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Antispam State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Generate random numbers between 1 and 10
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Antispam Check
    if (parseInt(answer) !== num1 + num2) {
      setError('Incorrect answer to the math question. Please try again.');
      return;
    }

    // Length Check
    if (message.length > 200) {
      setError('Message is too long. Maximum 200 characters allowed.');
      return;
    }

    // Link Detection
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    if (urlRegex.test(message)) {
      setError('Links are not allowed in the message for security reasons.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMessage({ name, email, message });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-serif font-bold text-ink">Get in Touch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-ink transition-colors">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-paper-plane text-4xl text-green-500 mb-4 animate-bounce"></i>
              <h3 className="text-xl font-bold text-gray-800">Message Sent!</h3>
              <p className="text-gray-500 text-sm mt-2">Thank you for writing. Your message has been saved to the <span className="font-bold text-ink">Admin Panel</span>.</p>
              <p className="text-xs text-gray-400 mt-4 italic">Closing window...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase text-gray-500">Message</label>
                  <span className={`text-[10px] font-bold ${message.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                    {message.length}/200
                  </span>
                </div>
                <textarea 
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={250}
                  rows={4}
                  className={`w-full border rounded p-2 focus:ring-1 outline-none resize-none ${message.length > 200 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-accent focus:ring-accent'}`}
                  placeholder="Tell me what you think..."
                />
              </div>

              {/* Antispam Section */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  <i className="fa-solid fa-shield-halved mr-1"></i> Security Check
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-serif font-bold text-gray-700 bg-white px-3 py-2 rounded border border-gray-300">
                    {num1} + {num2} = ?
                  </span>
                  <input 
                    type="number"
                    required
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    className="w-20 border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    placeholder="0"
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-2"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-ink text-white py-3 rounded font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;