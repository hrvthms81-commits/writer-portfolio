import React from 'react';
import { Work } from '../types';

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
      <div className="aspect-[2/3] w-full overflow-hidden relative">
        <img 
          src={work.coverImage} 
          alt={work.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <p className="text-white text-sm font-light italic">Read more...</p>
        </div>
        {work.isLocked && !canAccess && (
          <div className="absolute top-4 right-4 bg-ink/80 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md">
            <i className="fa-solid fa-lock text-xs"></i>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-[10px] uppercase tracking-wider font-semibold rounded mb-3">
          {work.category}
        </span>
        <h3 className="text-xl font-serif font-bold text-ink mb-2 leading-tight group-hover:text-accent transition-colors">
          {work.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 font-light leading-relaxed mb-4">
          {work.description}
        </p>
        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-eye"></i>
            {work.views || 0} views
          </span>
          {work.downloads !== undefined && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-download"></i>
              {work.downloads} downloads
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;