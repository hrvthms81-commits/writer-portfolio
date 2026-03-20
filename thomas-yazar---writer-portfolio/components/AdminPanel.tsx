import React, { useState, useRef } from 'react';
import { Category, Work } from '../types';
import { generateWorkSummary } from '../services/geminiService';
import { saveWork, deleteWork, getAccessCode, setAccessCode } from '../services/storageService';

interface AdminPanelProps {
  works: Work[];
  onUpdate: () => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ works, onUpdate, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(Category.SHORT_STORY);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [pdfContent, setPdfContent] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memberCode, setMemberCode] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchCode = async () => {
      const code = await getAccessCode();
      setMemberCode(code);
    };
    fetchCode();
  }, []);

  const handleFileRead = (file: File, callback: (result: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileRead(e.target.files[0], setCoverImage);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileRead(e.target.files[0], setPdfContent);
    }
  };

  const handleAISummary = async () => {
    if (!title) return;
    setIsGenerating(true);
    const summary = await generateWorkSummary(title, category, description || "A story about...");
    setDescription(summary);
    setIsGenerating(false);
  };

  const handleEdit = (work: Work) => {
    setTitle(work.title);
    setCategory(work.category);
    setDescription(work.description);
    setContent(work.content || '');
    setIsLocked(work.isLocked);
    setCoverImage(work.coverImage);
    setPdfContent(work.pdfContent);
    setEditingId(work.id);
    
    // Clear file inputs visually as we can't set their value programmatically to the existing file
    if(fileInputRef.current) fileInputRef.current.value = '';
    if(pdfInputRef.current) pdfInputRef.current.value = '';

    // Scroll to top
    const formElement = document.getElementById('admin-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preserve original creation date and stats if editing
    let dateCreated = Date.now();
    let views = 0;
    let downloads = 0;

    if (editingId) {
      const original = works.find(w => w.id === editingId);
      if (original) {
        dateCreated = original.dateCreated;
        views = original.views || 0;
        downloads = original.downloads || 0;
      }
    }

    const newWork: Work = {
      id: editingId || Date.now().toString(),
      title,
      category,
      description,
      content,
      isLocked,
      dateCreated: dateCreated,
      coverImage: coverImage || `https://picsum.photos/400/600?random=${Date.now()}`,
      pdfContent,
      views,
      downloads,
    };
    await saveWork(newWork);
    onUpdate();
    resetForm();
    setEditingId(null);
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setCoverImage(undefined);
    setPdfContent(undefined);
    setEditingId(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    if(pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this work?")) {
      await deleteWork(id);
      onUpdate();
      // If we deleted the item being edited, reset the form
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl p-8 overflow-y-auto animate-slide-in-right">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif text-ink">Manage Portfolio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-ink">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <form id="admin-form" onSubmit={handleSubmit} className="space-y-6 mb-12 border-b border-gray-200 pb-12">
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg mb-8">
            <label className="block text-sm font-bold text-accent uppercase tracking-wider mb-2">Member Access Code</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={memberCode}
                onChange={e => setMemberCode(e.target.value)}
                className="flex-1 border-gray-300 border rounded-md p-2 text-sm"
                placeholder="Code for members..."
              />
              <button 
                type="button"
                onClick={async () => { await setAccessCode(memberCode); alert('Access code updated!'); }}
                className="bg-accent text-white px-4 py-2 rounded text-sm font-bold hover:bg-orange-600"
              >
                Save Code
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 italic">Share this code with people you want to grant "Member" access to.</p>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">
              {editingId ? 'Edit Work' : 'Add New Work'}
            </h3>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              required
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full border-gray-300 border rounded-md p-2 focus:ring-accent focus:border-accent"
              placeholder="Enter title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full border-gray-300 border rounded-md p-2"
              >
                {Object.values(Category).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center pt-6">
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input 
                    type="checkbox" 
                    checked={isLocked}
                    onChange={e => setIsLocked(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                 />
                 <span className="text-sm text-gray-700">Require Login to View</span>
               </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <button 
                type="button"
                onClick={handleAISummary}
                disabled={isGenerating || !title}
                className={`text-xs flex items-center gap-1 ${isGenerating ? 'text-gray-400' : 'text-accent hover:text-orange-700'}`}
              >
                <i className={`fa-solid fa-wand-magic-sparkles ${isGenerating ? 'animate-pulse' : ''}`}></i>
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full border-gray-300 border rounded-md p-2 h-24"
              placeholder="Short description or synopsis..."
            />
          </div>

          {category === Category.THOUGHT ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thought Content</label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)}
                className="w-full border-gray-300 border rounded-md p-2 h-48 font-serif"
                placeholder="Write your thought directly here..."
              />
              <p className="text-[10px] text-gray-500 mt-1 italic">Note: Random Thoughts are published as direct text and don't require a PDF.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Art</label>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-accent hover:file:bg-orange-100"
                />
                {editingId && coverImage && <p className="text-xs text-green-600 mt-1">✓ Current image kept</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
                <input 
                  ref={pdfInputRef}
                  type="file" 
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {editingId && pdfContent && <p className="text-xs text-green-600 mt-1">✓ Current PDF kept</p>}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full py-3 rounded-md transition-colors font-semibold ${editingId ? 'bg-accent hover:bg-orange-600 text-white' : 'bg-ink hover:bg-gray-800 text-white'}`}
          >
            {editingId ? 'Update Work' : 'Publish Work'}
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Existing Works</h3>
          {works.map(work => (
            <div key={work.id} className={`flex items-center justify-between bg-gray-50 p-4 rounded-lg border ${editingId === work.id ? 'border-accent ring-1 ring-accent' : 'border-gray-100'}`}>
              <div className="flex items-center space-x-4">
                <img src={work.coverImage} alt={work.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                <div>
                  <h4 className="font-serif font-bold text-ink">{work.title}</h4>
                  <p className="text-xs text-gray-500">{work.category}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span title="Views"><i className="fa-solid fa-eye mr-1"></i>{work.views || 0}</span>
                    <span title="Downloads"><i className="fa-solid fa-download mr-1"></i>{work.downloads || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(work)}
                  className="text-gray-400 hover:text-accent p-2"
                  title="Edit"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                  onClick={() => handleDelete(work.id)}
                  className="text-red-400 hover:text-red-600 p-2"
                  title="Delete"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;