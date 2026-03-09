import React, { useState, useEffect } from 'react';
import TimetableGrid from './components/TimetableGrid';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SubjectsList from './components/SubjectsList';
import TeachersList from './components/TeachersList';
import PDFExportButton from './components/PDFExportButton';
import ConfirmDialog from './components/ConfirmDialog';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

function App() {
  const [activeClass, setActiveClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [initialTimetable, setInitialTimetable] = useState([]);
  const [week, setWeek] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('Timetables'); // Timetables, Subjects, Teachers
  
  const [isComparing, setIsComparing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Custom confirm dialog state
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const requestConfirm = (title, message, onConfirm) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Custom deep check arrays. JSON stringify is fast but ignores undefined.
  const hasUnsavedChanges = JSON.stringify(timetable) !== JSON.stringify(initialTimetable);

  const fetchClasses = async () => {
    try {
      const classesRes = await api.get('/classes');
      setClasses(classesRes.data || []);
      if (classesRes.data && classesRes.data.length > 0 && !activeClass) {
        setActiveClass(classesRes.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const teachersRes = await api.get('/teachers');
      setTeachers(teachersRes.data || []);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (activeClass && currentView === 'Timetables') {
      const fetchTimetable = async () => {
        setLoading(true);
        try {
          const url = week === 0 
            ? `/timetable/${activeClass.id}`
            : `/overrides/${activeClass.id}/${week}`;
          const res = await api.get(url);
          setTimetable(res.data || []);
          setInitialTimetable(res.data || []);
          setIsComparing(false);
        } catch (err) {
          console.error("Failed to fetch timetable", err);
        } finally {
          setLoading(false);
        }
      };
      // Fetch only if switching classes/weeks, not if we already have local changes we want to keep.
      // Assuming if we just saved, we already updated initialTimetable.
      fetchTimetable();
    }
  }, [activeClass, week, currentView]);

  const handleSave = async (silent = false) => {
    if (!hasUnsavedChanges) return;
    try {
      if (!silent) setToast({ show: true, message: 'Saving changes...', type: 'info' });
      const url = week === 0 ? '/timetable/save' : '/overrides';
      const payload = week === 0 
        ? { class_id: activeClass.id, entries: timetable }
        : { class_id: activeClass.id, week, entries: timetable };
      
      await api.post(url, payload);
      setInitialTimetable(timetable);
      setIsComparing(false);
      
      if (!silent) {
        setToast({ show: true, message: 'Changes saved successfully!', type: 'success' });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setToast({ show: true, message: 'Failed to save changes.', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
      }
    }
  };

  const handleClearTimetable = () => {
    requestConfirm(
      "Clear Timetable?",
      `Are you sure you want to clear the entire timetable for ${activeClass.name}? This action cannot be undone.`,
      async () => {
        try {
          await api.delete(`/timetable/${activeClass.id}`);
          setTimetable([]);
          setInitialTimetable([]);
          setIsComparing(false);
          if (setToast) {
            setToast({ show: true, message: 'Timetable cleared successfully.', type: 'success' });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
          }
        } catch (err) {
          if (setToast) {
            setToast({ show: true, message: 'Failed to clear timetable.', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
          }
        }
      }
    );
  };

  // Auto-save on tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (JSON.stringify(timetable) !== JSON.stringify(initialTimetable)) {
        const payload = week === 0 
          ? { class_id: activeClass?.id, entries: timetable }
          : { class_id: activeClass?.id, week, entries: timetable };
        navigator.sendBeacon(`http://localhost:8080${week === 0 ? '/timetable/save' : '/overrides'}`, JSON.stringify(payload));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timetable, initialTimetable, activeClass, week]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          classes={classes} 
          activeClass={activeClass} 
          setActiveClass={async (cls) => {
            if (activeClass?.id !== cls.id && hasUnsavedChanges) {
              await handleSave(true);
            }
            setActiveClass(cls);
            setCurrentView('Timetables');
          }} 
          api={api}
          onRefresh={fetchClasses}
          currentView={currentView}
          setCurrentView={async (view) => {
            if (view !== 'Timetables' && currentView === 'Timetables' && hasUnsavedChanges) {
              await handleSave(true);
            }
            setCurrentView(view);
          }}
          setToast={setToast}
          requestConfirm={requestConfirm}
        />
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          
          {currentView === 'Subjects' && <SubjectsList api={api} setToast={setToast} requestConfirm={requestConfirm} />}
          {currentView === 'Teachers' && <TeachersList api={api} setToast={setToast} requestConfirm={requestConfirm} />}
          {currentView === 'Settings' && (
            <div className="max-w-4xl mx-auto animate-[fadeIn_0.2s_ease-out]">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-slate-500 mt-1">Configure your Timetable Pro application preferences.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {/* Setting Item */}
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Dark Mode</h3>
                    <p className="text-sm text-slate-500">Enable dark theme across the application. (Coming soon)</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                
                {/* Setting Item */}
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Auto-Save Changes</h3>
                    <p className="text-sm text-slate-500">Automatically save timetable edits in the background when switching tabs or closing the window.</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>

                {/* Setting Item */}
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Weekend Classes</h3>
                    <p className="text-sm text-slate-500">Include Saturday and Sunday in the standard timetable grid generation.</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                
                {/* Danger Zone */}
                <div className="p-6 bg-red-50/50">
                  <div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600/80 mb-4">Permanent actions that cannot be undone.</p>
                    <button 
                      onClick={() => alert("Database reset feature is disabled for safety.")}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow-sm hover:bg-red-700 transition-colors"
                    >
                      Reset All Data
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {currentView === 'Timetables' && activeClass && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{activeClass.name} Timetable</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-slate-500">Drag and drop to rearrange periods</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {hasUnsavedChanges && (
                    <button 
                      onClick={() => setIsComparing(!isComparing)}
                      className={`px-4 py-2 border rounded-lg shadow-sm transition-all font-medium ${isComparing ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {isComparing ? 'Hide Changes' : 'Compare'}
                    </button>
                  )}
                  <PDFExportButton 
                    targetId="timetable-grid" 
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm transition-all font-medium" 
                  />
                  <button 
                    onClick={handleClearTimetable}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm transition-all font-medium"
                  >
                    Clear Grid
                  </button>
                  <button 
                    onClick={() => handleSave(false)}
                    disabled={!hasUnsavedChanges}
                    className={`px-4 py-2 rounded-lg shadow-md transition-all font-medium ${hasUnsavedChanges ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <TimetableGrid 
                  timetable={timetable} 
                  setTimetable={setTimetable} 
                  initialTimetable={initialTimetable}
                  isComparing={isComparing}
                  classId={activeClass.id}
                  api={api}
                  teachers={teachers}
                />
              )}
            </div>
          )}

          {currentView === 'Timetables' && !activeClass && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
             <p className="text-xl">Select a class to view its timetable</p>
             <button 
               onClick={async () => {
                 await api.post('/classes', { name: 'Class 10A' });
                 fetchClasses();
               }}
               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-900/10"
             >
               Create Sample Class
             </button>
           </div>
          )}

        </main>
        
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg font-medium text-white transition-opacity z-50 animate-[slideIn_0.3s_ease-out] ${
            toast.type === 'error' ? 'bg-red-500' : 
            toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
          }`}>
            {toast.message}
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
        confirmText="Delete"
      />
    </div>
  );
}

export default App;
