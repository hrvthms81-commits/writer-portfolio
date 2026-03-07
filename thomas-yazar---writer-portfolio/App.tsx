import React, { useState, useEffect } from 'react';
import { Work, Category, User } from './types';
import { getWorks, getCurrentUser, loginUser, logoutUser, incrementWorkView, incrementWorkDownload, getAccessCode, adminLogin } from './services/storageService';
import WorkCard from './components/WorkCard';
import AdminPanel from './components/AdminPanel';
import ChatBot from './components/ChatBot';
import ContactModal from './components/ContactModal';

const App: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [user, setUser] = useState<User>(getCurrentUser());
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  
  // Login State Management
  const [loginMode, setLoginMode] = useState<'member' | 'admin'>('member');
  const [accessCode, setAccessCodeInput] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    const fetchWorks = async () => {
      const data = await getWorks();
      setWorks(data);
    };
    fetchWorks();
  }, []);

  const handleUpdateWorks = async () => {
    const data = await getWorks();
    setWorks(data);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await adminLogin(username, password);
    if (user) {
      setUser(user);
      closeLoginModal();
    } else {
      alert('Invalid admin credentials.');
    }
  };

  const handleMemberCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const correctCode = await getAccessCode();
    
    if (accessCode === correctCode) {
      setUser(loginUser('Member', false));
      closeLoginModal();
      alert('Welcome, Member!');
    } else {
      alert('Invalid access code. Please try again.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser({ username: 'Guest', role: 'guest' });
    setShowAdmin(false);
  };

  const closeLoginModal = () => {
    setShowLogin(false);
    // Reset to default state after transition
    setTimeout(() => {
      setLoginMode('member');
      setUsername('');
      setPassword('');
      setAccessCodeInput('');
    }, 300);
  };

  const filteredWorks = filter === 'All' 
    ? works 
    : works.filter(w => w.category === filter);

  const canAccessWork = (work: Work) => {
    if (!work.isLocked) return true;
    return user.role !== 'guest';
  };

  const handleViewWork = async (work: Work) => {
    // Increment view count when opening details
    const updatedWorks = await incrementWorkView(work.id);
    setWorks(updatedWorks);
    
    // Find the updated work to display
    const updatedWork = updatedWorks.find(w => w.id === work.id);
    setSelectedWork(updatedWork || work);
  };

  const handleDownload = async (work: Work) => {
    if (!work.pdfContent) {
      alert("No PDF file attached to this work.");
      return;
    }

    // Increment download count
    const updatedWorks = await incrementWorkDownload(work.id);
    setWorks(updatedWorks);

    // Update selected work reference to reflect new stats if needed
    if (selectedWork && selectedWork.id === work.id) {
       const updated = updatedWorks.find(w => w.id === work.id);
       if (updated) setSelectedWork(updated);
    }

    const link = document.createElement('a');
    link.href = work.pdfContent;
    link.download = `${work.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-ink bg-paper">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-paper/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-serif font-bold text-ink">TY</span>
            <span className="hidden sm:inline text-sm text-gray-500 uppercase tracking-widest border-l border-gray-300 pl-3 ml-1">Thomas Yazar</span>
          </div>

          <nav className="flex items-center gap-6">
            <div className="hidden md:flex gap-1 text-sm font-medium text-gray-600">
              <button onClick={() => setFilter('All')} className={`px-3 py-1 rounded-full transition-colors ${filter === 'All' ? 'bg-ink text-white' : 'hover:bg-gray-200'}`}>All</button>
              {Object.values(Category).map(c => (
                <button 
                  key={c} 
                  onClick={() => setFilter(c)}
                  className={`px-3 py-1 rounded-full transition-colors ${filter === c ? 'bg-ink text-white' : 'hover:bg-gray-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
              <button onClick={() => setShowContact(true)} className="text-sm font-medium text-gray-600 hover:text-accent hidden sm:block">
                Contact
              </button>

              {user.role === 'guest' ? (
                <button onClick={() => setShowLogin(true)} className="text-sm font-semibold hover:text-accent">
                  Member Access
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 hidden sm:inline">Hi, {user.username}</span>
                  {user.role === 'admin' && (
                    <button onClick={() => setShowAdmin(true)} className="text-sm font-semibold hover:text-accent">
                      <i className="fa-solid fa-pen-nib mr-1"></i> Dashboard
                    </button>
                  )}
                  <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600">
                    <i className="fa-solid fa-sign-out-alt"></i>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Intro */}
        <section className="mb-16 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Stories are just <br/> <span className="text-accent">organized hallucinations.</span>
          </h1>
          <p className="text-lg text-gray-600 font-light leading-relaxed mb-6">
            Welcome to my personal archive. Here you'll find short stories, scripts, poems, and various fragments of my imagination. 
            Some are free to read, others require you to join the inner circle.
          </p>
          <div className="sm:hidden">
             <button onClick={() => setShowContact(true)} className="text-sm font-bold text-accent hover:underline flex items-center gap-2">
               <i className="fa-solid fa-envelope"></i> Send me a message
             </button>
          </div>
        </section>

        {/* Filters Mobile */}
        <div className="md:hidden mb-8 overflow-x-auto pb-2 flex gap-2">
           <button onClick={() => setFilter('All')} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'All' ? 'bg-ink text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
           {Object.values(Category).map(c => (
              <button 
                key={c} 
                onClick={() => setFilter(c)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c ? 'bg-ink text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {c}
              </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorks.map(work => (
            <WorkCard 
              key={work.id} 
              work={work} 
              canAccess={canAccessWork(work)} 
              onView={handleViewWork} 
            />
          ))}
          {filteredWorks.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
              <i className="fa-solid fa-feather text-4xl mb-4"></i>
              <p>No works found in this category yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif italic text-gray-500 mb-2">"We tell ourselves stories in order to live."</p>
          <p className="text-xs text-gray-400 uppercase tracking-widest">&copy; {new Date().getFullYear()} Thomas Yazar</p>
        </div>
      </footer>

      {/* Admin Modal */}
      {showAdmin && (
        <AdminPanel works={works} onUpdate={handleUpdateWorks} onClose={() => setShowAdmin(false)} />
      )}

      {/* Contact Modal */}
      {showContact && (
        <ContactModal onClose={() => setShowContact(false)} />
      )}

      {/* Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedWork(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="md:w-2/5 h-64 md:h-auto bg-gray-100 relative">
               <img src={selectedWork.coverImage} className="w-full h-full object-cover absolute inset-0" alt={selectedWork.title} referrerPolicy="no-referrer" />
               {selectedWork.isLocked && !canAccessWork(selectedWork) && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                   <div className="text-center text-white">
                      <i className="fa-solid fa-lock text-4xl mb-2"></i>
                      <p className="font-bold">Locked Content</p>
                   </div>
                 </div>
               )}
            </div>
            <div className="md:w-3/5 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <span className="text-accent text-xs font-bold uppercase tracking-widest">{selectedWork.category}</span>
                   <h2 className="text-3xl font-serif font-bold mt-1 mb-1">{selectedWork.title}</h2>
                   <div className="flex items-center gap-4 text-gray-400 text-xs">
                     <span>Published on {new Date(selectedWork.dateCreated).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1"><i className="fa-solid fa-eye"></i> {selectedWork.views || 0}</span>
                     <span className="flex items-center gap-1"><i className="fa-solid fa-download"></i> {selectedWork.downloads || 0}</span>
                   </div>
                </div>
                <button onClick={() => setSelectedWork(null)} className="text-gray-400 hover:text-ink">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="prose prose-sm prose-stone flex-grow mb-8 overflow-y-auto pr-2">
                <p className="text-gray-700 leading-relaxed text-lg">{selectedWork.description}</p>
                <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-100">
                  <h4 className="font-bold text-sm mb-2">Author's Note</h4>
                  <p className="text-xs text-gray-500 italic">
                    This piece is part of the collection. Feel free to download the PDF to read the full manuscript.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                {canAccessWork(selectedWork) ? (
                   selectedWork.pdfContent ? (
                    <button 
                      onClick={() => handleDownload(selectedWork)}
                      className="flex-1 bg-ink text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-file-pdf"></i> Download PDF
                    </button>
                   ) : (
                    <button disabled className="flex-1 bg-gray-200 text-gray-400 py-3 px-6 rounded cursor-not-allowed">
                       PDF Not Available
                    </button>
                   )
                ) : (
                  <button onClick={() => { setSelectedWork(null); setShowLogin(true); }} className="flex-1 bg-accent text-white py-3 px-6 rounded hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-key"></i> Login to Read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl relative animate-fade-in-up">
             <button onClick={closeLoginModal} className="absolute top-4 right-4 text-gray-400 hover:text-ink">
               <i className="fa-solid fa-times"></i>
             </button>
             
             {loginMode === 'member' && (
               <>
                 <h2 className="text-2xl font-serif font-bold mb-2 text-center">Member Access</h2>
                 <p className="text-center text-gray-500 text-sm mb-6">Enter the access code to unlock exclusive stories.</p>
                 <form onSubmit={handleMemberCodeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Access Code</label>
                      <input 
                         type="text" 
                         required
                         value={accessCode}
                         onChange={e => setAccessCodeInput(e.target.value)}
                         placeholder="Enter code..."
                         className="w-full border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                       />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-ink text-white py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Unlock Content
                    </button>
                  </form>
                 <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <button onClick={() => setLoginMode('admin')} className="text-xs text-gray-400 hover:text-ink">
                      Are you the author? Login here.
                    </button>
                 </div>
               </>
             )}

             {loginMode === 'admin' && (
               <>
                 <h2 className="text-2xl font-serif font-bold mb-6 text-center">Admin Dashboard</h2>
                 <form onSubmit={handleAdminLogin} className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Username</label>
                     <input 
                        type="text" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                      />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
                     <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                      />
                   </div>
                   <button type="submit" className="w-full bg-ink text-white py-2 rounded font-semibold hover:bg-gray-800 transition-colors">
                     Enter
                   </button>
                 </form>
                 <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <button onClick={() => setLoginMode('member')} className="text-xs text-gray-400 hover:text-ink">
                      Back to Member Access
                    </button>
                 </div>
               </>
             )}
          </div>
        </div>
      )}

      <ChatBot works={works} />

    </div>
  );
};

export default App;
