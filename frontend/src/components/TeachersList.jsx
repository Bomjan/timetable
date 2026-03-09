import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';

const TeachersList = ({ api, setToast, requestConfirm, onRefresh }) => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, subjectsRes] = await Promise.all([
          api.get('/teachers'),
          api.get('/subjects')
        ]);
        setTeachers(teachersRes.data || []);
        setSubjects(subjectsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (subjects.length === 0) {
      if (setToast) {
        setToast({ show: true, message: 'Please create at least one subject first.', type: 'error' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      }
      return;
    }
    
    // Fallback if they didn't explicitly select from dropdown but subjects exist
    const finalSubjectId = selectedSubjectId || subjects[0].id;
    const subject_ids = finalSubjectId ? [finalSubjectId] : [];

    try {
      await api.post('/teachers', { name: newName.trim(), subject_ids });
      const teachersRes = await api.get('/teachers');
      setTeachers(teachersRes.data || []);
      if (onRefresh) onRefresh();
      
      setNewName('');
      setSelectedSubjectId('');
      setIsAdding(false);
      
      if (setToast) {
        setToast({ show: true, message: 'Teacher added successfully!', type: 'success' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      }
    } catch (err) {
      if (setToast) {
        setToast({ show: true, message: 'Failed to create teacher', type: 'error' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      }
    }
  };

  const handleDelete = async (id, name) => {
    requestConfirm(
      "Delete Teacher?",
      `Are you sure you want to delete ${name}?`,
      async () => {
        try {
          await api.delete(`/teachers/${id}`);
          // Refresh list
          const teachersRes = await api.get('/teachers');
          setTeachers(teachersRes.data || []);
          if (onRefresh) onRefresh();
          if (setToast) {
            setToast({ show: true, message: 'Teacher deleted successfully.', type: 'success' });
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
          }
        } catch (err) {
          if (setToast) {
            setToast({ show: true, message: 'Failed to delete teacher', type: 'error' });
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
          }
        }
      }
    );
  };

  const getSubjectNames = (subjectIds) => {
    if (!subjectIds || subjectIds.length === 0) return "None assigned";
    return subjectIds.map(id => {
      const sub = subjects.find(s => s.id === id);
      return sub ? sub.name : id;
    }).join(", ");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Teachers</h2>
          <p className="text-slate-500 mt-1">Manage teaching staff and their assigned subjects</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md font-medium ${isAdding ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancel' : 'Add Teacher'}
        </button>
      </div>
      
      {isAdding && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-[slideDown_0.2s_ease-out]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Teacher</h3>
          <form onSubmit={handleCreateSubmit} className="flex gap-4 items-end">
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-slate-600 mb-1">Teacher Name</label>
              <input 
                autoFocus
                type="text" 
                placeholder="Ex: John Doe"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Primary Subject</label>
              <select 
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {subjects.length === 0 ? (
                  <option disabled value="">No subjects available</option>
                ) : (
                  <>
                    <option disabled value="">Select a subject...</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={!newName.trim()}
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
                <th className="p-4 font-semibold text-slate-600">Name</th>
                <th className="p-4 font-semibold text-slate-600">Assigned Subjects</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400">
                    No teachers found. Add one to get started.
                  </td>
                </tr>
              ) : (
                teachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {teacher.name.substring(0, 2).toUpperCase()}
                      </div>
                      {teacher.name}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {getSubjectNames(teacher.subject_ids)}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end">
                      <button 
                        onClick={() => handleDelete(teacher.id, teacher.name)}
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

export default TeachersList;
