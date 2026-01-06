
import React from 'react';
import { UserProgress, Level } from '../types';
import { LEVELS } from '../constants';

interface DashboardProps {
  progress: UserProgress;
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onClose }) => {
  const totalAxioms = LEVELS.reduce((acc, level) => acc + level.axioms.length, 0);
  const studiedCount = progress.studiedAxiomIds.length;
  const progressPercent = Math.round((studiedCount / totalAxioms) * 100);

  const completedLevels = LEVELS.filter(level => 
    level.axioms.every(axiom => progress.studiedAxiomIds.includes(axiom.id))
  );

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="serif text-3xl lg:text-4xl font-medium text-gray-900 mb-2">Ваш Путь</h2>
          <p className="text-sm lg:text-base text-gray-500 font-light">Карта интеграции системы в вашу реальность.</p>
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors border-b border-gray-100 pb-1"
        >
          Назад к изучению
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gray-50 border border-gray-100">
          <div className="text-3xl lg:text-4xl font-light text-gray-900 mb-1">{progressPercent}%</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Прогресс</div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gray-50 border border-gray-100">
          <div className="text-3xl lg:text-4xl font-light text-gray-900 mb-1">{studiedCount}/{totalAxioms}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Аксиомы</div>
        </div>
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gray-50 border border-gray-100">
          <div className="text-3xl lg:text-4xl font-light text-gray-900 mb-1">{completedLevels.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Уровни</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 lg:mb-6">Последние инсайты</h3>
          <div className="space-y-3 lg:space-y-4">
            {progress.insights.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Пока нет записанных осознаний...</p>
            ) : (
              progress.insights.map((insight, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-gray-50 bg-white shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-[9px] font-mono text-gray-300 uppercase">{insight.id}</span>
                    <span className="text-[9px] text-gray-300">{insight.date}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-700 leading-relaxed font-light italic">"{insight.text}"</p>
                </div>
              )).reverse()
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 lg:mb-6">Карта уровней</h3>
          <div className="grid grid-cols-5 gap-2 lg:gap-3">
            {LEVELS.map(level => {
              const levelProgress = level.axioms.filter(a => progress.studiedAxiomIds.includes(a.id)).length;
              const isDone = levelProgress === level.axioms.length;
              return (
                <div key={level.id} className="text-center">
                  <div className={`aspect-square rounded-xl lg:rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    isDone ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : levelProgress > 0 ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-50 border-gray-100 text-gray-300'
                  }`}>
                    <span className="text-[10px] lg:text-xs font-bold">{level.code}</span>
                    <span className="text-[7px] lg:text-[8px] opacity-60 font-medium">{levelProgress}/{level.axioms.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
