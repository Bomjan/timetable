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
} from '@dnd-kit/sortable';
import TimetableCell from './TimetableCell';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIOD_COUNT = 7;

const TimetableGrid = ({ timetable, setTimetable, classId, api }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const gridData = useMemo(() => {
    const data = [];
    for (let p = 1; p <= PERIOD_COUNT; p++) {
      const row = { period: p, days: {} };
      DAYS.forEach((day, dIdx) => {
        const dayNum = dIdx + 1;
        const entry = timetable.find(e => e.day === dayNum && e.period === p);
        row.days[dayNum] = entry || { class_id: classId, day: dayNum, period: p, duration: 1 };
      });
      data.push(row);
    }
    return data;
  }, [timetable, classId]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const activeData = active.data.current;
      const overData = over.data.current;

      try {
        await api.post('/timetable/swap', {
          class_id: classId,
          slot1: { day: activeData.day, period: activeData.period },
          slot2: { day: overData.day, period: overData.period }
        });
        
        const res = await api.get(`/timetable/${classId}`);
        setTimetable(res.data);
      } catch (err) {
        console.error("Swap failed", err);
      }
    }
  };

  const handleMerge = async (entry) => {
    try {
      await api.post('/timetable/merge', {
        class_id: classId,
        day: entry.day,
        period: entry.period,
        count: 2
      });
      const res = await api.get(`/timetable/${classId}`);
      setTimetable(res.data);
    } catch (err) {
      console.error("Merge failed", err);
    }
  };

  const handleSplit = async (entry) => {
    try {
      await api.post('/timetable/split', {
        class_id: classId,
        day: entry.day,
        period: entry.period
      });
      const res = await api.get(`/timetable/${classId}`);
      setTimetable(res.data);
    } catch (err) {
      console.error("Split failed", err);
    }
  };

  return (
    <div id="timetable-grid" className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50">
          <div className="p-4 font-bold text-slate-500 text-sm uppercase tracking-wider text-center border-r border-slate-200">
            Period
          </div>
          {DAYS.map(day => (
            <div key={day} className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider text-center border-r border-slate-200 last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="flex flex-col divide-y divide-slate-200">
          {gridData.map(row => (
            <div key={row.period} className="grid grid-cols-6 divide-x divide-slate-200">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 font-medium text-slate-500">
                <span className="text-lg">P{row.period}</span>
                <span className="text-[10px] text-slate-400">
                  {row.period + 8}:00 - {row.period + 9}:00
                </span>
              </div>
              {Object.entries(row.days).map(([dayNum, entry]) => (
                <TimetableCell 
                  key={`${dayNum}-${row.period}`}
                  entry={entry}
                  dayNum={parseInt(dayNum)}
                  periodNum={row.period}
                  onMerge={handleMerge}
                  onSplit={handleSplit}
                />
              ))}
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default TimetableGrid;
