import React, { useState, useEffect } from 'react';
import DraggableSubject from './DraggableSubject';
import { Search, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

const RightDrawer = ({ api, active }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: 'drawer-drop-zone',
  });

  // Only show trash/remove UI if dragging a grid cell, NOT when dragging a subject out
  const showTrash = isOver && !active?.data?.current?.isSubject;

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
    <div 
      ref={setNodeRef}
      className={`w-64 border-l flex flex-col h-full rounded-r-xl transition-colors duration-200 ${
        showTrash ? 'bg-red-50 border-red-200 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className={`p-4 border-b rounded-tr-xl transition-colors duration-200 ${
        showTrash ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold transition-colors ${showTrash ? 'text-red-700' : 'text-slate-800'}`}>
            {showTrash ? 'Remove Subject' : 'Subjects'}
          </h3>
          {showTrash && <Trash2 size={18} className="text-red-500 animate-bounce" />}
        </div>
        <p className={`text-xs mt-1 mb-3 transition-colors ${showTrash ? 'text-red-500' : 'text-slate-500'}`}>
          {showTrash ? 'Drop here to clear cell' : 'Drag to timetable'}
        </p>
        
        {!showTrash && (
          <div className="relative animate-[fadeIn_0.2s_ease-out]">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showTrash ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-2 animate-pulse">
            <div className="p-4 bg-red-100 rounded-full text-red-600">
              <Trash2 size={32} />
            </div>
            <p className="text-sm font-medium">Clear Slot</p>
          </div>
        ) : loading ? (
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
