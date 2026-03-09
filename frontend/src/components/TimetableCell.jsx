import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, MoreVertical } from 'lucide-react';

const TimetableCell = ({ entry, dayNum, periodNum, onMerge, onSplit, isChanged }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform,
    transition,
    isDragging 
  } = useSortable({
    id: `drag-${dayNum}-${periodNum}`,
    data: { day: dayNum, period: periodNum, entry }
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  const isOff = !entry.subject_id;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`min-h-[100px] p-2 transition-all relative group ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div 
        {...attributes}
        {...listeners}
        className={`w-full h-full rounded-lg p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
          isOff 
            ? 'bg-slate-50 border border-dashed border-slate-200 text-slate-300' 
            : isChanged 
              ? 'bg-yellow-50 border border-yellow-300 shadow-sm border-l-4 border-l-yellow-500'
              : 'bg-white border border-slate-200 shadow-sm border-l-4 border-l-blue-500'
        }`}
      >
        {!isOff ? (
          <>
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-800 leading-tight">
                {entry.subject_name || ""}
              </h4>
              <div className="relative group/menu">
                <button className="text-slate-300 hover:text-slate-500">
                  <MoreVertical size={14} />
                </button>
                <div className="absolute top-0 right-0 hidden group-hover/menu:block bg-white border border-slate-200 rounded shadow-lg z-[60] py-1 min-w-[120px]">
                  {entry.duration > 1 ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSplit(entry); }}
                      className="w-full text-left px-3 py-1 text-[11px] hover:bg-slate-50 text-slate-600 font-bold"
                    >
                      Split Block
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMerge(entry); }}
                      className="w-full text-left px-3 py-1 text-[11px] hover:bg-slate-50 text-slate-600 font-bold"
                    >
                      Merge with Next
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 space-y-1">
              <p className="font-medium text-slate-600">{entry.teacher_name || ""}</p>
              {entry.duration > 1 && (
                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">
                  {entry.duration} Periods
                </span>
              )}
            </div>
            {entry.has_conflict && (
              <div className="absolute top-1 right-1 text-red-500">
                <AlertCircle size={14} fill="currentColor" className="text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs font-bold uppercase tracking-widest">OFF</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableCell;
