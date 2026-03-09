import React, { useMemo } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  SortableContext,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import TimetableCell from './TimetableCell';
import RightDrawer from './RightDrawer';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIOD_COUNT = 7;
const TimetableGrid = ({ timetable, setTimetable, initialTimetable, isComparing, classId, api, teachers, subjects, saveToHistory }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const gridData = useMemo(() => {
    const data = [];
    DAYS.forEach((day, dIdx) => {
      const dayNum = dIdx + 1;
      const row = { day_name: day, day_num: dayNum, periods: {} };
      for (let p = 1; p <= PERIOD_COUNT; p++) {
        const entry = timetable.find(e => e.day === dayNum && e.period === p);
        if (entry) {
          // Dynamic lookup for missing names
          const subject = subjects?.find(s => s.id === entry.subject_id);
          const teacher = teachers?.find(t => t.id === entry.teacher_id);
          
          row.periods[p] = {
            ...entry,
            subject_name: entry.subject_name || subject?.name || "",
            subject_code: entry.subject_code || subject?.code || "",
            teacher_name: entry.teacher_name || teacher?.name || ""
          };
        } else {
          row.periods[p] = { class_id: classId, day: dayNum, period: p, duration: 1 };
        }
      }
      data.push(row);
    });
    return data;
  }, [timetable, classId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Save to history before any changes
    if (active.id !== over.id || active.data.current?.isSubject || over.id === 'drawer-drop-zone') {
       saveToHistory();
    }
    
    // Handle subject drag from RightDrawer (Add)
    if (active.data.current?.isSubject) {
      if (over.id.toString().startsWith('drag-')) {
        const overData = over.data.current;
        const subject = active.data.current.subject;

        setTimetable(prev => {
          const newTimetable = [...prev];
          const idx = newTimetable.findIndex(e => e.day === overData.day && e.period === overData.period);
          
          if (idx !== -1) {
            const assignedTeacher = teachers?.find(t => t.subject_ids?.includes(subject.id));
            newTimetable[idx] = { 
              ...newTimetable[idx], 
              subject_id: subject.id,
              subject_name: subject.name,
              subject_code: subject.code,
              teacher_id: assignedTeacher?.id || null,
              teacher_name: assignedTeacher?.name || "",
              duration: 1 
            };
          } else {
            const assignedTeacher = teachers?.find(t => t.subject_ids?.includes(subject.id));
            newTimetable.push({
              class_id: classId,
              day: overData.day,
              period: overData.period,
              duration: 1,
              subject_id: subject.id,
              subject_name: subject.name,
              subject_code: subject.code,
              teacher_id: assignedTeacher?.id || null,
              teacher_name: assignedTeacher?.name || ""
            });
          }
          return newTimetable;
        });
      }
      return;
    }

    // Handle removal when dragging cell back to drawer
    if (over.id === 'drawer-drop-zone') {
      const activeData = active.data.current;
      if (activeData && activeData.day && activeData.period) {
        setTimetable(prev => prev.filter(e => !(e.day === activeData.day && e.period === activeData.period)));
      }
      return;
    }

    if (active.id !== over.id) {
      const activeData = active.data.current;
      const overData = over.data.current;

      setTimetable(prev => {
        const newTimetable = [...prev];
        const idx1 = newTimetable.findIndex(e => e.day === activeData.day && e.period === activeData.period);
        const idx2 = newTimetable.findIndex(e => e.day === overData.day && e.period === overData.period);
        
        if (idx1 !== -1) {
          newTimetable[idx1] = { ...newTimetable[idx1], day: overData.day, period: overData.period };
        }
        if (idx2 !== -1) {
          newTimetable[idx2] = { ...newTimetable[idx2], day: activeData.day, period: activeData.period };
        }
        return newTimetable;
      });
    }
  };

  const handleMerge = (entry) => {
    saveToHistory();
    setTimetable(prev => {
      const newTimetable = [...prev];
      const idx = newTimetable.findIndex(e => e.day === entry.day && e.period === entry.period);
      if (idx !== -1) {
        newTimetable[idx] = { ...newTimetable[idx], duration: 2 };
      }
      return newTimetable.filter(e => !(e.day === entry.day && e.period === entry.period + 1));
    });
  };

  const handleSplit = (entry) => {
    saveToHistory();
    setTimetable(prev => {
      const newTimetable = [...prev];
      const idx = newTimetable.findIndex(e => e.day === entry.day && e.period === entry.period);
      if (idx !== -1) {
        newTimetable[idx] = { ...newTimetable[idx], duration: 1 };
      }
      return newTimetable;
    });
  };

  return (
    <div className="flex bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div id="timetable-grid" className="flex-1 w-full relative">
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
            <div className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider text-center border-r border-slate-200">
              Day
            </div>
            {Array.from({ length: 7 }, (_, i) => i + 1).map(p => (
              <div key={p} className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider text-center border-r border-slate-200 last:border-0">
                P{p} <br />
                <span className="text-[10px] text-slate-400 font-normal">{p + 8}:00 - {p + 9}:00</span>
              </div>
            ))}
          </div>
        
          <SortableContext 
            items={gridData.flatMap(r => Object.keys(r.periods).map(p => `drag-${r.day_num}-${p}`))} 
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-col divide-y divide-slate-200">
              {gridData.map(row => (
                <div key={row.day_num} className="grid grid-cols-8 divide-x divide-slate-200">
                  <div className="flex items-center justify-center p-4 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-sm">
                    {row.day_name}
                  </div>
                  {Object.entries(row.periods).map(([periodNum, entry]) => {
                    let isChanged = false;
                    if (isComparing) {
                      const originalEntry = initialTimetable.find(e => e.day === row.day_num && e.period === parseInt(periodNum));
                      isChanged = originalEntry?.subject_id !== entry.subject_id || originalEntry?.duration !== entry.duration;
                    }

                    return (
                      <TimetableCell 
                        key={`${row.day_num}-${periodNum}`}
                        entry={entry}
                        dayNum={row.day_num}
                        periodNum={parseInt(periodNum)}
                        onMerge={handleMerge}
                        onSplit={handleSplit}
                        isChanged={isChanged}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </SortableContext>
        </div>
        <RightDrawer api={api} />
      </DndContext>
    </div>
  );
};

export default TimetableGrid;
