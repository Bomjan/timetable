import React, { useState, useEffect } from 'react';
import TimetableGrid from './components/TimetableGrid';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

function App() {
  const [activeClass, setActiveClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [week, setWeek] = useState(0); // 0 for default
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const classesRes = await api.get('/classes');
      setClasses(classesRes.data);
      if (classesRes.data.length > 0 && !activeClass) {
        setActiveClass(classesRes.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (activeClass) {
      const fetchTimetable = async () => {
        setLoading(true);
        try {
          const url = week === 0 
            ? `/timetable/${activeClass.id}`
            : `/overrides/${activeClass.id}/${week}`;
          const res = await api.get(url);
          setTimetable(res.data);
        } catch (err) {
          console.error("Failed to fetch timetable", err);
        } finally {
          setLoading(false);
        }
      };
      fetchTimetable();
    }
  }, [activeClass, week]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          classes={classes} 
          activeClass={activeClass} 
          setActiveClass={setActiveClass} 
          api={api}
          onRefresh={fetchClasses}
        />
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {activeClass ? (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{activeClass.name} Timetable</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-slate-500">Drag and drop to rearrange periods</p>
                    <div className="flex items-center gap-2 ml-4 bg-white border border-slate-200 rounded-lg p-1">
                      <button 
                        onClick={() => setWeek(0)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${week === 0 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        Default
                      </button>
                      {[1, 2, 3].map(w => (
                        <button 
                          key={w}
                          onClick={() => setWeek(w)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${week === w ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          Week {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm transition-all font-medium">
                    Export PDF
                  </button>
                  <button className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 shadow-md transition-all font-medium">
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
                  classId={activeClass.id}
                  api={api}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
              <p className="text-xl">Select a class to view its timetable</p>
              <button 
                onClick={async () => {
                  await api.post('/classes', { name: 'Class 10A' });
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-900/10"
              >
                Create Sample Class
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
