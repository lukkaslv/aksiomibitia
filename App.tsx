
import React, { useState, useEffect } from 'react';
import { LEVELS } from './constants';
import { Level, Axiom, UserProgress } from './types';
import LevelCard from './components/LevelCard';
import AICoach from './components/AICoach';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'study' | 'dashboard'>('study');
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVELS[0]);
  const [activeAxiom, setActiveAxiom] = useState<Axiom | undefined>();
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('genesis_progress');
    return saved ? JSON.parse(saved) : { studiedAxiomIds: [], notes: {}, insights: [] };
  });

  useEffect(() => {
    localStorage.setItem('genesis_progress', JSON.stringify(progress));
  }, [progress]);

  const toggleStudied = (id: string) => {
    setProgress(prev => ({
      ...prev,
      studiedAxiomIds: prev.studiedAxiomIds.includes(id) 
        ? prev.studiedAxiomIds.filter(i => i !== id) 
        : [...prev.studiedAxiomIds, id]
    }));
  };

  const updateNote = (id: string, text: string) => {
    setProgress(prev => ({ ...prev, notes: { ...prev.notes, [id]: text } }));
  };

  const addInsight = (id: string, text: string) => {
    if (!text.trim()) return;
    const newInsight = { id, date: new Date().toLocaleDateString('ru-RU'), text };
    setProgress(prev => ({ ...prev, insights: [...prev.insights, newInsight] }));
  };

  const isLevelLocked = (levelIndex: number) => {
    if (levelIndex === 0) return false;
    const prevLevel = LEVELS[levelIndex - 1];
    return !prevLevel.axioms.every(a => progress.studiedAxiomIds.includes(a.id));
  };

  const isAxiomLocked = (axiomIndex: number) => {
    if (axiomIndex === 0) return false;
    const prevAxiomId = selectedLevel.axioms[axiomIndex - 1].id;
    return !progress.studiedAxiomIds.includes(prevAxiomId);
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="fixed top-0 left-0 right-0 h-14 lg:h-16 bg-white/90 backdrop-blur-lg border-b border-gray-50 z-50 flex items-center px-4 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <h1 className="serif text-base lg:text-xl font-semibold tracking-tight text-gray-900 cursor-pointer" onClick={() => setView('study')}>
            Аксиомы Бытия
          </h1>
          <nav className="flex gap-4 lg:gap-8">
            <button onClick={() => setView('study')} className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${view === 'study' ? 'text-gray-900' : 'text-gray-300'}`}>Изучение</button>
            <button onClick={() => setView('dashboard')} className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${view === 'dashboard' ? 'text-gray-900' : 'text-gray-300'}`}>Дашборд</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-20 lg:pt-24 pb-12 px-4 lg:px-8">
        {view === 'dashboard' ? (
          <Dashboard progress={progress} onClose={() => setView('study')} />
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12">
            <div className="lg:col-span-4 lg:space-y-4 relative">
              <h3 className="hidden lg:block text-xs font-bold uppercase tracking-[0.2em] text-gray-300 mb-6 pl-2">Архитектура</h3>
              
              {/* Mobile Level Scroller with Fade Effect */}
              <div className="relative group">
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 gap-3 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth">
                  {LEVELS.map((level, idx) => (
                    <LevelCard key={level.id} level={level} isActive={selectedLevel.id === level.id} isLocked={isLevelLocked(idx)} onClick={() => { if (!isLevelLocked(idx)) { setSelectedLevel(level); setActiveAxiom(undefined); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} />
                  ))}
                </div>
                {/* Visual fade for horizontal scroll on mobile */}
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden"></div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8 lg:space-y-12">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-block px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                  Слой {selectedLevel.id} • {selectedLevel.code}
                </div>
                <h2 className="serif text-2xl lg:text-5xl font-medium text-gray-900 mb-2 leading-tight">{selectedLevel.name}</h2>
                <p className="text-sm lg:text-xl text-gray-500 font-light leading-relaxed max-w-2xl">{selectedLevel.subtitle}</p>
              </div>

              <div className="space-y-4 lg:space-y-6">
                {selectedLevel.axioms.map((axiom, idx) => {
                  const isStudied = progress.studiedAxiomIds.includes(axiom.id);
                  const isLocked = isAxiomLocked(idx);
                  const isFocused = activeAxiom?.id === axiom.id;
                  
                  if (isLocked) {
                    return (
                      <div key={axiom.id} className="p-4 lg:p-8 rounded-2xl border border-gray-50 bg-gray-50/50 opacity-60 flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <span className="text-xs text-gray-400 font-light italic">Эволюция продолжается...</span>
                      </div>
                    );
                  }

                  return (
                    <div key={axiom.id} className={`p-4 lg:p-8 rounded-2xl lg:rounded-3xl transition-all duration-500 border ${isFocused ? 'bg-white border-gray-300 shadow-lg' : 'bg-white border-gray-50'}`}>
                      <div className="flex items-start gap-4 lg:gap-6">
                        <button onClick={(e) => { e.stopPropagation(); toggleStudied(axiom.id); }} className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isStudied ? 'bg-black border-black text-white' : 'border-gray-200 text-transparent'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <div className="flex-1" onClick={() => setActiveAxiom(isFocused ? undefined : axiom)}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-base lg:text-xl font-medium ${isFocused ? 'text-blue-600' : 'text-gray-900'}`}>{axiom.title}</h4>
                            <span className="text-[8px] font-mono text-gray-300">{axiom.id}</span>
                          </div>
                          <p className="text-xs lg:text-base text-gray-600 leading-relaxed font-light mb-3">{axiom.description}</p>
                          {isFocused && (
                            <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in" onClick={e => e.stopPropagation()}>
                                <textarea value={progress.notes[axiom.id] || ''} onChange={e => updateNote(axiom.id, e.target.value)} placeholder="Ваша заметка..." className="w-full bg-gray-50 rounded-xl p-3 text-sm resize-none h-24 border-none focus:ring-1 focus:ring-gray-100" />
                                <div className="flex gap-2">
                                  <input id={`in-${axiom.id}`} type="text" placeholder="Инсайт дня..." className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm border-none focus:ring-1 focus:ring-gray-100" onKeyDown={e => { if (e.key === 'Enter') { addInsight(axiom.id, e.currentTarget.value); e.currentTarget.value = ''; } }} />
                                  <button onClick={() => { const i = document.getElementById(`in-${axiom.id}`) as HTMLInputElement; addInsight(axiom.id, i.value); i.value = ''; }} className="px-4 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">OK</button>
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-6 lg:pt-12"><AICoach currentAxiom={activeAxiom} /></div>
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-gray-50 py-10 flex flex-col items-center gap-6 opacity-40">
        <p className="text-[9px] font-light italic">Быть ничем — значит быть Всем.</p>
      </footer>
    </div>
  );
};

export default App;
