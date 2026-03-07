import React, { useState, useEffect } from 'react';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Antispam Check
    if (parseInt(answer) !== num1 + num2) {
      setError('Incorrect answer to the math question. Please try again.');
      return;
    }

    // Simulate sending
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
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
              <p className="text-gray-500">Thank you for writing. I'll get back to you soon.</p>
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
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Message</label>
                <textarea 
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
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
                className="w-full bg-ink text-white py-3 rounded font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;