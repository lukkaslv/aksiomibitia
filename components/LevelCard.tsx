
import React from 'react';
import { Level } from '../types';

interface LevelCardProps {
  level: Level;
  isActive: boolean;
  isLocked: boolean;
  onClick: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, isActive, isLocked, onClick }) => {
  if (isLocked) {
    return (
      <div className="shrink-0 w-[140px] lg:w-full text-left p-4 lg:p-6 rounded-2xl border border-gray-50 bg-gray-50/50 opacity-50 cursor-not-allowed select-none transition-all">
         <div className="flex items-center justify-between mb-2 lg:mb-4">
          <span className="text-[9px] lg:text-[10px] font-semibold tracking-widest text-gray-300 uppercase">
            L {level.id}
          </span>
          <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="serif text-base lg:text-2xl font-semibold text-gray-300 mb-0.5 truncate lg:whitespace-normal">
          {level.name}
        </h2>
         <p className="hidden lg:block text-sm text-gray-300 font-light italic">
          Погружение...
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`shrink-0 w-[140px] lg:w-full text-left p-4 lg:p-6 rounded-2xl transition-all duration-300 border ${
        isActive 
          ? 'bg-white border-gray-200 shadow-xl shadow-gray-100 lg:scale-[1.02]' 
          : 'bg-white border-transparent hover:border-gray-100 opacity-60 lg:opacity-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2 lg:mb-4">
        <span className={`text-[9px] lg:text-[10px] font-semibold tracking-widest uppercase ${isActive ? 'text-black' : 'text-gray-400'}`}>
          L {level.id}
        </span>
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
          {level.code}
        </span>
      </div>
      <h2 className={`serif text-base lg:text-2xl font-semibold mb-0.5 truncate lg:whitespace-normal ${isActive ? 'text-black' : 'text-gray-900'}`}>
        {level.name}
      </h2>
      <p className={`hidden lg:block text-sm font-light italic ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
        {level.subtitle}
      </p>
    </button>
  );
};

export default LevelCard;
