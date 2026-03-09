import React, { useState, useEffect } from 'react';
import DraggableSubject from './DraggableSubject';
import { Search } from 'lucide-react';

const RightDrawer = ({ api }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch subjects in RightDrawer", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [api]);

  const filteredSubjects = subjects.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-slate-50 border-l border-slate-200 flex flex-col h-full rounded-r-xl">
      <div className="p-4 border-b border-slate-200 bg-white rounded-tr-xl">
        <h3 className="font-bold text-slate-800">Subjects</h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">Drag to timetable</p>
        
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <p className="text-center text-sm text-slate-500 mt-4">No subjects found</p>
        ) : (
          filteredSubjects.map(subject => (
            <DraggableSubject key={subject.id} subject={subject} />
          ))
        )}
      </div>
    </div>
  );
};

export default RightDrawer;
