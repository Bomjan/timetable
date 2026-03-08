import React from 'react';
import { 
  Users, 
  BookOpen, 
  Layers, 
  Settings as SettingsIcon,
  ChevronRight,
  Plus
} from 'lucide-react';

const Sidebar = ({ classes, activeClass, setActiveClass, api, onRefresh }) => {
  const menuItems = [
    { icon: Layers, label: 'Timetables', active: true },
    { icon: BookOpen, label: 'Subjects' },
    { icon: Users, label: 'Teachers' },
    { icon: SettingsIcon, label: 'Settings' },
  ];

  const handleAddClass = async () => {
    const name = prompt("Enter class name (e.g., 10B):");
    if (name) {
      try {
        await api.post('/classes', { name });
        if (onRefresh) onRefresh();
      } catch (err) {
        alert("Failed to add class");
      }
    }
  };

  const handleDeleteClass = async (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this class? All associated timetable data will be lost (if using MongoDB).")) {
      try {
        await api.delete(`/classes/${id}`);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert("Failed to delete class");
      }
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Management</h3>
        <nav className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active 
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
            onClick={handleAddClass}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => setActiveClass(cls)}
              className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeClass?.id === cls.id
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
            </button>
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
