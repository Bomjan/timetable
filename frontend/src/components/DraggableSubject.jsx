import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BookOpen } from 'lucide-react';

const DraggableSubject = ({ subject }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `subject-${subject.id}`,
    data: {
      isSubject: true,
      subject,
    },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors flex items-center gap-3`}
    >
      <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
        <BookOpen size={18} />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm leading-tight">{subject.name}</h4>
        <p className="text-xs text-slate-500 font-mono mt-0.5">{subject.code}</p>
      </div>
    </div>
  );
};

export default DraggableSubject;
