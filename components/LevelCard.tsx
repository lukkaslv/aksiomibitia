
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
      <div className="flex-shrink-0 lg:w-full text-left p-4 lg:p-6 rounded-2xl border border-gray-50 bg-gray-50/50 min-w-[140px] lg:min-w-0 opacity-50 cursor-not-allowed select-none">
         <div className="flex items-center justify-between mb-2 lg:mb-4">
          <span className="text-[10px] font-semibold tracking-widest text-gray-300 uppercase">
            L {level.id}
          </span>
          <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="serif text-lg lg:text-2xl font-semibold text-gray-300 mb-0.5 lg:mb-1 truncate lg:whitespace-normal">
          {level.name}
        </h2>
         <p className="hidden lg:block text-sm text-gray-300 font-light italic">
          Недоступно
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 lg:w-full text-left p-4 lg:p-6 rounded-2xl transition-all duration-300 border ${
        isActive 
          ? 'bg-white border-gray-200 shadow-lg lg:shadow-xl scale-[1.02] lg:scale-[1.02]' 
          : 'bg-white border-transparent hover:border-gray-100 hover:shadow-sm opacity-60 lg:opacity-100'
      } min-w-[140px] lg:min-w-0`}
    >
      <div className="flex items-center justify-between mb-2 lg:mb-4">
        <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
          L {level.id}
        </span>
        <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
          {level.code}
        </span>
      </div>
      <h2 className="serif text-lg lg:text-2xl font-semibold text-gray-900 mb-0.5 lg:mb-1 truncate lg:whitespace-normal">
        {level.name}
      </h2>
      <p className="hidden lg:block text-sm text-gray-500 font-light italic">
        {level.subtitle}
      </p>
    </button>
  );
};

export default LevelCard;
