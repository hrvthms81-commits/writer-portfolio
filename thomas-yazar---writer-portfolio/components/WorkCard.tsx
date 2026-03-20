import React from 'react';
import { Work, Category } from '../types';

interface WorkCardProps {
  work: Work;
  canAccess: boolean;
  onView: (work: Work) => void;
}

const WorkCard: React.FC<WorkCardProps> = ({ work, canAccess, onView }) => {
  return (
    <div 
      className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => onView(work)}
    >
      <div className="aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden relative">
        <img 
          src={work.coverImage} 
          alt={work.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
          <p className="text-white text-[10px] sm:text-xs font-light italic">Read more...</p>
        </div>
        {work.isLocked && !canAccess && (
          <div className="absolute top-2 right-2 bg-ink/80 text-white p-1.5 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center backdrop-blur-md">
            <i className="fa-solid fa-lock text-[8px] sm:text-[10px]"></i>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold rounded mb-1.5">
          {work.category}
        </span>
        <h3 className="text-base sm:text-lg font-serif font-bold text-ink mb-1 leading-tight group-hover:text-accent transition-colors">
          {work.title}
        </h3>
        <p className="text-gray-600 text-[11px] sm:text-xs line-clamp-2 font-light leading-relaxed mb-2">
          {work.description}
        </p>
        <div className="flex items-center gap-3 text-[8px] sm:text-[9px] text-gray-400 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-eye"></i>
            {work.views || 0}
          </span>
          {work.downloads !== undefined && work.category !== Category.THOUGHT && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-download"></i>
              {work.downloads}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;