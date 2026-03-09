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
      className={`min-h-[110px] p-1.5 transition-all relative group ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div 
        {...(isOff ? {} : attributes)}
        {...(isOff ? {} : listeners)}
        className={`w-full h-full rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${
          isOff 
            ? 'bg-slate-50/50 border border-slate-100/50 text-slate-200' 
            : `cursor-grab active:cursor-grabbing hover:shadow-xl hover:-translate-y-0.5 border-l-[6px] ${
              isChanged && isComparing
                ? 'bg-amber-50/80 border-amber-200 border-l-amber-500 shadow-sm'
                : 'bg-white border-slate-100 border-l-indigo-500 shadow-sm'
            }`
        }`}
      >
        {isComparing && isChanged && (
          <div className="absolute -top-1 -right-1 z-10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-white shadow-lg ring-2 ring-white animate-pulse">
              Δ
            </span>
          </div>
        )}

        {!isOff ? (
          <>
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                {isComparing && isChanged && originalEntry && !wasOff && (
                  <div className="text-[10px] text-slate-400/60 line-through truncate mb-1 font-medium">
                    {originalEntry.subject_name}
                  </div>
                )}
                <h4 className={`font-black text-sm tracking-tight leading-tight truncate ${
                  isComparing && isChanged ? 'text-amber-900' : 'text-slate-800'
                }`}>
                  {entry.subject_name || ""}
                </h4>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5 block">
                  {entry.subject_code || ""}
                </span>
              </div>
              
              <div className="relative group/menu flex-shrink-0">
                <button className="text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full p-1.5 transition-colors">
                  <MoreVertical size={16} />
                </button>
                <div className="absolute top-0 right-0 hidden group-hover/menu:block bg-white border border-slate-100 rounded-xl shadow-2xl z-[60] py-1.5 min-w-[150px] overflow-hidden">
                  {entry.duration > 1 ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSplit(entry); }}
                      className="w-full text-left px-4 py-2.5 text-[11px] hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Split Block
                    </button>
                  ) : canMerge ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMerge(entry); }}
                      className="w-full text-left px-4 py-2.5 text-[11px] hover:bg-slate-50 text-emerald-600 font-bold flex items-center justify-between group/btn"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Merge Right
                      </span>
                      <span className="text-emerald-400 group-hover/btn:translate-x-1 transition-transform">→</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-3 flex flex-col gap-1.5">
              {isComparing && isChanged && originalEntry && !wasOff && (
                <div className="text-[10px] text-slate-400/50 line-through truncate font-medium italic">
                  {originalEntry.teacher_name}
                </div>
              )}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isComparing && isChanged ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                <p className={`text-[11px] font-bold truncate ${
                  isComparing && isChanged ? 'text-amber-700/80' : 'text-slate-500'
                }`}>
                  {entry.teacher_name || "TBA"}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                {entry.duration > 1 ? (
                  <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-tighter ${
                    isComparing && isChanged ? 'bg-amber-100/50 text-amber-600' : 'bg-indigo-50 text-indigo-500'
                  }`}>
                    {entry.duration} Periods
                  </span>
                ) : <div />}

                {entry.has_conflict && (
                  <div className="bg-red-50 p-1 rounded-md animate-bounce">
                    <AlertCircle size={12} className="text-red-500" />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
             {isComparing && isChanged && originalEntry && !wasOff && (
              <div className="text-[10px] text-slate-400 line-through mb-1 font-medium italic">
                {originalEntry.subject_name}
              </div>
            )}
            <div className="w-6 h-0.5 bg-slate-200 rounded-full mb-2"></div>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isComparing && isChanged ? 'text-amber-400' : 'text-slate-300'}`}>
              Vacant
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableCell;
