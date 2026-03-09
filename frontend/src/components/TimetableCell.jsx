import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, MoreVertical } from 'lucide-react';

const TimetableCell = ({ entry, originalEntry, isComparing, isChanged, dayNum, periodNum, onMerge, onSplit, span = 1, canMerge = false }) => {
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
    gridColumn: `span ${span}`,
  } : {
    gridColumn: `span ${span}`,
  };

  const isOff = !entry.subject_id;
  const wasOff = originalEntry && !originalEntry.subject_id;

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
        className={`w-full h-full rounded-lg p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
          isOff 
            ? 'bg-slate-50 border border-dashed border-slate-200 text-slate-300' 
            : isChanged && isComparing
              ? 'bg-amber-50 border border-amber-300 shadow-sm border-l-4 border-l-amber-500'
              : 'bg-white border border-slate-200 shadow-sm border-l-4 border-l-blue-500'
        }`}
      >
        {isComparing && isChanged && (
          <div className="absolute -top-1 -right-1 z-10">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
              Δ
            </span>
          </div>
        )}

        {!isOff ? (
          <>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isComparing && isChanged && originalEntry && !wasOff && (
                  <div className="text-[10px] text-slate-400 line-through truncate mb-0.5 opacity-60">
                    {originalEntry.subject_name}
                  </div>
                )}
                <h4 className={`font-bold leading-tight ${isComparing && isChanged ? 'text-amber-900' : 'text-slate-800'}`}>
                  {entry.subject_name || ""}
                </h4>
              </div>
              
              <div className="relative group/menu ml-2">
                <button className="text-slate-300 hover:text-slate-500 p-1">
                  <MoreVertical size={14} />
                </button>
                <div className="absolute top-0 right-0 hidden group-hover/menu:block bg-white border border-slate-200 rounded shadow-lg z-[60] py-1 min-w-[140px]">
                  {entry.duration > 1 ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSplit(entry); }}
                      className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 text-slate-600 font-bold border-b border-slate-100"
                    >
                      Split Block
                    </button>
                  ) : canMerge ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMerge(entry); }}
                      className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 text-emerald-600 font-bold border-b border-slate-100 flex items-center justify-between"
                    >
                      <span>Merge Right</span>
                      <span className="text-emerald-400">→</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-2 text-[11px] space-y-1">
              {isComparing && isChanged && originalEntry && !wasOff && (
                <div className="text-[9px] text-slate-400 line-through truncate opacity-60">
                  {originalEntry.teacher_name}
                </div>
              )}
              <p className={`font-medium ${isComparing && isChanged ? 'text-amber-700' : 'text-slate-600'}`}>
                {entry.teacher_name || ""}
              </p>
              
              {entry.duration > 1 && (
                <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] mt-1 ${
                  isComparing && isChanged ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
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
          <div className="flex flex-col items-center justify-center h-full">
             {isComparing && isChanged && originalEntry && !wasOff && (
              <div className="text-[10px] text-slate-400 line-through mb-1 opacity-60">
                {originalEntry.subject_name}
              </div>
            )}
            <span className={`text-xs font-bold uppercase tracking-widest ${isComparing && isChanged ? 'text-amber-400' : 'text-slate-300'}`}>
              OFF
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableCell;
