
import React from 'react';
import { UserProgress, Level, Axiom } from '../types';
import { LEVELS } from '../constants';

interface DashboardProps {
  progress: UserProgress;
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onClose }) => {
  const totalAxioms = LEVELS.reduce((acc, level) => acc + level.axioms.length, 0);
  const studiedCount = progress.studiedAxiomIds.length;
  const progressPercent = Math.round((studiedCount / totalAxioms) * 100);

  // Получаем список всех аксиом для быстрого поиска метаданных
  const allAxioms: Record<string, Axiom> = {};
  LEVELS.forEach(l => l.axioms.forEach(a => { allAxioms[a.id] = a; }));

  // Собираем все записи (заметки и инсайты), сгруппированные по ID аксиомы
  const journalEntries = Object.keys(progress.notes)
    .filter(id => progress.notes[id].trim() !== '' || progress.insights.some(i => i.id === id))
    .map(id => ({
      id,
      axiom: allAxioms[id],
      note: progress.notes[id],
      insights: progress.insights.filter(i => i.id === id)
    }))
    .reverse();

  const completedLevels = LEVELS.filter(level => 
    level.axioms.every(axiom => progress.studiedAxiomIds.includes(axiom.id))
  );

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Шапка дашборда */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="serif text-3xl lg:text-4xl font-medium text-gray-900 mb-1">Ваш Путь</h2>
          <p className="text-xs lg:text-base text-gray-400 font-light italic">Архив вашей внутренней трансформации.</p>
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors border-b border-gray-100 pb-1"
        >
          Вернуться к практике
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="text-2xl lg:text-4xl font-light text-gray-900 mb-1">{progressPercent}%</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Интеграция</div>
          <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="text-2xl lg:text-4xl font-light text-gray-900 mb-1">{studiedCount}/{totalAxioms}</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Постигнуто Аксиом</div>
        </div>
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-white border border-gray-100 shadow-sm">
          <div className="text-2xl lg:text-4xl font-light text-gray-900 mb-1">{completedLevels.length}</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Пройдено Уровней</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Хроника осознаний */}
        <section className="lg:col-span-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 lg:mb-8">Хроника осознаний</h3>
          <div className="space-y-6 lg:space-y-8">
            {journalEntries.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-gray-200 rounded-[30px] lg:rounded-[40px]">
                <p className="serif text-gray-300 italic">Дневник пока пуст.<br/>Ваши мысли появятся здесь после практики.</p>
              </div>
            ) : (
              journalEntries.map((entry) => (
                <div key={entry.id} className="group p-6 lg:p-10 rounded-[30px] lg:rounded-[40px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[8px] font-mono text-gray-300 uppercase block mb-1">{entry.id}</span>
                      <h4 className="serif text-xl lg:text-2xl font-medium text-gray-900">{entry.axiom?.title || 'Аксиома'}</h4>
                    </div>
                  </div>

                  {entry.note && (
                    <div className="mb-6">
                      <h5 className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-3">Дневник Состояния</h5>
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed font-light whitespace-pre-wrap">{entry.note}</p>
                    </div>
                  )}

                  {entry.insights.length > 0 && (
                    <div className="pt-6 border-t border-gray-50">
                      <h5 className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-3">Вспышки Инсайтов</h5>
                      <div className="flex flex-wrap gap-2">
                        {entry.insights.map((insight, idx) => (
                          <div key={idx} className="px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                            <p className="text-[11px] lg:text-xs text-gray-700 font-medium">
                                <span className="text-[8px] text-gray-300 mr-2">{insight.date}</span>
                                {insight.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Геометрия духа */}
        <section className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Геометрия Духа</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-3">
              {LEVELS.map(level => {
                const levelProgress = level.axioms.filter(a => progress.studiedAxiomIds.includes(a.id)).length;
                const isDone = levelProgress === level.axioms.length;
                return (
                  <div key={level.id} className="text-center">
                    <div className={`aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-700 ${
                      isDone ? 'bg-black border-black text-white shadow-lg' : levelProgress > 0 ? 'bg-white border-gray-200 text-black' : 'bg-gray-50/50 border-transparent text-gray-300'
                    }`}>
                      <span className="text-[11px] font-bold mb-0.5">{level.code}</span>
                      <span className="text-[7px] opacity-60 font-medium">{levelProgress}/{level.axioms.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 p-6 bg-gray-50 rounded-3xl border border-gray-100 hidden lg:block">
              <p className="serif italic text-xs text-gray-400 leading-relaxed text-center">
                "Вы не то, что вы думаете о себе. Вы — само пространство, в котором рождаются мысли."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
