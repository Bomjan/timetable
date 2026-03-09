import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, MoreVertical } from 'lucide-react';

const TimetableCell = ({ entry, originalEntry, isComparing, isChanged, dayNum, periodNum, onMerge, onSplit, span = 1, canMerge = false, isCollisionTarget = false }) => {
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
      className={`min-h-[110px] p-1 transition-all relative ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <div 
        {...(isOff ? {} : attributes)}
        {...(isOff ? {} : listeners)}
        className={`w-full h-full rounded-lg p-4 flex flex-col justify-between transition-all duration-200 ${
          isCollisionTarget ? 'ring-2 ring-red-400 ring-offset-2 scale-[0.98]' : ''
        } ${
          isOff 
            ? 'bg-slate-50/40 border border-slate-100/60' 
            : `bg-white border border-slate-200 cursor-grab active:cursor-grabbing hover:border-slate-300 hover:shadow-sm ${
              isChanged && isComparing ? 'bg-amber-50/30 border-amber-200' : ''
            }`
        }`}
      >
        {isComparing && isChanged && (
          <div className="absolute top-2 right-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
              Δ
            </span>
          </div>
        )}

        {!isOff ? (
          <>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                {isComparing && isChanged && originalEntry && !wasOff && (
                  <div className="text-[10px] text-slate-400 font-normal mb-0.5">
                    Prev: {originalEntry.subject_name}
                  </div>
                )}
                <h4 className="font-semibold text-[13px] text-slate-700 leading-snug truncate">
                  {entry.subject_name || ""}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                  {entry.subject_code || ""}
                </p>
              </div>
              
              {(entry.duration > 1 || canMerge) && (
                <div className="relative group/menu flex-shrink-0">
                  <button className="text-slate-300 hover:text-slate-500 rounded p-1 transition-colors">
                    <MoreVertical size={14} />
                  </button>
                  <div className="absolute top-0 right-0 hidden group-hover/menu:block bg-white border border-slate-200 rounded-md shadow-lg z-[60] py-1 min-w-[130px] overflow-hidden">
                    {entry.duration > 1 ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSplit(entry); }}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 text-slate-600"
                      >
                        Split Block
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onMerge(entry); }}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 text-slate-600 flex items-center justify-between group/btn"
                      >
                        <span>Merge Right</span>
                        <span className="text-slate-400 group-hover/btn:translate-x-0.5 transition-transform">→</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-1">
              {isComparing && isChanged && originalEntry && !wasOff && (
                <div className="text-[10px] text-slate-300 font-normal">
                  with {originalEntry.teacher_name}
                </div>
              )}
              <div className="flex items-center gap-1.5 overflow-hidden">
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {entry.teacher_name || "Unassigned"}
                </p>
              </div>
              
              {entry.has_conflict && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                    <AlertCircle size={10} /> Conflict
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">
              Vacant
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableCell;
