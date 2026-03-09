import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Layers, 
  Settings as SettingsIcon,
  ChevronRight,
  Plus,
  X,
  Check
} from 'lucide-react';

const Sidebar = ({ classes, activeClass, setActiveClass, api, onRefresh, currentView, setCurrentView, setToast, requestConfirm }) => {
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const menuItems = [
    { icon: Layers, label: 'Timetables' },
    { icon: BookOpen, label: 'Subjects' },
    { icon: Users, label: 'Teachers' },
    { icon: SettingsIcon, label: 'Settings' },
  ];

  const handleAddClassSubmit = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    
    try {
      await api.post('/classes', { name: newClassName.trim() });
      if (onRefresh) onRefresh();
      setNewClassName('');
      setIsAddingClass(false);
      if (setToast) {
        setToast({ show: true, message: 'Class created successfully!', type: 'success' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      }
    } catch (err) {
      if (setToast) {
        setToast({ show: true, message: 'Failed to create class', type: 'error' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      }
    }
  };

  const handleDeleteClass = async (e, id) => {
    e.stopPropagation();
    requestConfirm(
      "Delete Class?",
      "Are you sure you want to delete this class? All associated timetable data will be lost.",
      async () => {
        try {
          await api.delete(`/classes/${id}`);
          if (onRefresh) onRefresh();
          if (setToast) {
            setToast({ show: true, message: 'Class deleted successfully.', type: 'success' });
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
          }
        } catch (err) {
          if (setToast) {
            setToast({ show: true, message: 'Failed to delete class.', type: 'error' });
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
          }
        }
      }
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Management</h3>
        <nav className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => setCurrentView(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentView === item.label 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Classes</h3>
          <button 
            onClick={() => { setIsAddingClass(!isAddingClass); setNewClassName(''); }}
            className={`transition-colors rounded transition-transform ${isAddingClass ? 'text-white bg-slate-800 rotate-45' : 'text-slate-500 hover:text-white'}`}
          >
            <Plus size={16} />
          </button>
        </div>
        
        {isAddingClass && (
          <form onSubmit={handleAddClassSubmit} className="mb-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 flex items-center gap-2">
            <input 
              autoFocus
              type="text" 
              placeholder="Ex: 10B"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-white flex-shrink-0 transition-colors">
              <Check size={14} />
            </button>
          </form>
        )}
        <div className="space-y-1">
          {classes.map(cls => (
            <div
              key={cls.id}
              onClick={() => setActiveClass(cls)}
              className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeClass?.id === cls.id && currentView === 'Timetables'
                  ? 'bg-slate-800 text-white ring-1 ring-slate-700'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{cls.name}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDeleteClass(e, cls.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Plus size={12} className="rotate-45" />
                </button>
                {activeClass?.id === cls.id && <ChevronRight size={14} className="text-blue-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 mt-auto">
        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-bold text-white">John Doe</p>
            <p className="text-[10px] text-slate-500">Admin Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
