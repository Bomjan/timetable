import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';

const SubjectsList = ({ api, setToast, requestConfirm }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    
    try {
      await api.post('/subjects', { name: newName.trim(), code: newCode.trim() });
      setNewName('');
      setNewCode('');
      setIsAdding(false);
      fetchSubjects();
      if (setToast) {
        setToast({ show: true, message: 'Subject created successfully!', type: 'success' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      }
    } catch (err) {
      if (setToast) {
        setToast({ show: true, message: 'Failed to create subject', type: 'error' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      }
    }
  };

  const handleDelete = async (id, name) => {
    requestConfirm(
      "Delete Subject?",
      `Are you sure you want to delete ${name}?`,
      async () => {
        try {
          await api.delete(`/subjects/${id}`);
          fetchSubjects();
          if (setToast) {
            setToast({ show: true, message: 'Subject deleted successfully.', type: 'success' });
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
          }
        } catch (err) {
          if (setToast) {
            setToast({ show: true, message: 'Failed to delete subject', type: 'error' });
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
          }
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subjects</h2>
          <p className="text-slate-500 mt-1">Manage all subjects taught in the school</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md font-medium ${isAdding ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancel' : 'Create Subject'}
        </button>
      </div>
      
      {isAdding && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-[slideDown_0.2s_ease-out]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Subject</h3>
          <form onSubmit={handleCreateSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Subject Code</label>
              <input 
                autoFocus
                type="text" 
                placeholder="Ex: MATH101"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-slate-600 mb-1">Subject Name</label>
              <input 
                type="text" 
                placeholder="Ex: Advanced Mathematics"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={!newName.trim() || !newCode.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
            >
              <Check size={18} /> Save
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600">Code</th>
                <th className="p-4 font-semibold text-slate-600">Name</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400">
                    No subjects found. Create one to get started.
                  </td>
                </tr>
              ) : (
                subjects.map(subject => (
                  <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-slate-600 bg-slate-100/50 rounded inline-block m-3">{subject.code}</td>
                    <td className="p-4 font-medium text-slate-800">{subject.name}</td>
                    <td className="p-4 flex justify-end">
                      <button 
                        onClick={() => handleDelete(subject.id, subject.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubjectsList;
