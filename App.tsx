
import React, { useState, useEffect } from 'react';
import { LEVELS } from './constants.ts';
import { Level, Axiom, UserProgress } from './types.ts';
import LevelCard from './components/LevelCard.tsx';
import Dashboard from './components/Dashboard.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<'study' | 'dashboard'>('study');
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVELS[0]);
  const [activeAxiom, setActiveAxiom] = useState<Axiom | undefined>();
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('axioms_v2_progress');
    return saved ? JSON.parse(saved) : { studiedAxiomIds: [], notes: {}, insights: [] };
  });

  useEffect(() => {
    localStorage.setItem('axioms_v2_progress', JSON.stringify(progress));
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
    <div className="min-h-screen bg-[#FCFCFC] text-[#1A1A1A]">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-6 lg:px-12">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setView('study'); setActiveAxiom(undefined); }}>
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <h1 className="serif text-xl font-semibold tracking-tight">Аксиомы Бытия</h1>
          </div>
          <nav className="flex items-center gap-8">
            <button onClick={() => setView('study')} className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${view === 'study' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>Практика</button>
            <button onClick={() => setView('dashboard')} className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${view === 'dashboard' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>Путь</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-32 pb-24 px-6 lg:px-12">
        {view === 'dashboard' ? (
          <Dashboard progress={progress} onClose={() => setView('study')} />
        ) : (
          <div className="grid lg:grid-cols-12 gap-16">
            <aside className="lg:col-span-3 space-y-6">
              <div className="sticky top-32">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8 pl-1">Архитектура</h3>
                <div className="space-y-3">
                  {LEVELS.map((level, idx) => (
                    <LevelCard 
                      key={level.id} 
                      level={level} 
                      isActive={selectedLevel.id === level.id} 
                      isLocked={isLevelLocked(idx)} 
                      onClick={() => { setSelectedLevel(level); setActiveAxiom(undefined); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    />
                  ))}
                </div>
              </div>
            </aside>

            <section className="lg:col-span-9">
              <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gray-100/50 border border-gray-100 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-6">
                  Уровень {selectedLevel.id} • {selectedLevel.code}
                </div>
                <h2 className="serif text-4xl lg:text-7xl font-medium mb-6 leading-tight">{selectedLevel.name}</h2>
                <p className="text-xl lg:text-3xl text-gray-400 font-light leading-relaxed serif italic max-w-2xl">{selectedLevel.subtitle}</p>
              </div>

              <div className="space-y-8">
                {selectedLevel.axioms.map((axiom, idx) => {
                  const isStudied = progress.studiedAxiomIds.includes(axiom.id);
                  const isLocked = isAxiomLocked(idx);
                  const isOpen = activeAxiom?.id === axiom.id;

                  if (isLocked) {
                    return (
                      <div key={axiom.id} className="p-8 rounded-[40px] border border-gray-50 bg-gray-50/20 opacity-30 flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white">
                          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <span className="text-sm text-gray-400 font-light italic">Постигните предыдущую истину, чтобы открыть эту...</span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={axiom.id} 
                      className={`group rounded-[40px] transition-all duration-700 border overflow-hidden ${
                        isOpen ? 'bg-white border-gray-200 shadow-2xl shadow-gray-100' : 'bg-white border-gray-50 hover:border-gray-100'
                      }`}
                    >
                      <div className="p-8 lg:p-12 flex items-start gap-8">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleStudied(axiom.id); }} 
                          className={`mt-1.5 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${isStudied ? 'bg-black border-black text-white' : 'border-gray-100 text-transparent group-hover:border-gray-300'}`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                        </button>
                        
                        <div className="flex-1 cursor-pointer" onClick={() => setActiveAxiom(isOpen ? undefined : axiom)}>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className={`text-xl lg:text-3xl font-medium transition-colors ${isOpen ? 'text-black' : 'text-gray-900'}`}>{axiom.title}</h4>
                            <span className="text-[10px] font-mono text-gray-200 group-hover:text-gray-400">{axiom.id}</span>
                          </div>
                          <p className={`text-base lg:text-xl leading-relaxed font-light ${isOpen ? 'text-gray-600' : 'text-gray-400'}`}>{axiom.description}</p>
                          
                          {isOpen && (
                            <div className="mt-12 space-y-12 animate-in fade-in slide-in-from-top-4 duration-700" onClick={e => e.stopPropagation()}>
                              <div className="grid lg:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Глубина</h5>
                                  <p className="text-gray-700 leading-relaxed font-light">{axiom.explanation}</p>
                                </div>
                                <div className="space-y-4 p-8 bg-gray-50 rounded-3xl border border-gray-100">
                                  <h5 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900">Практика дня</h5>
                                  <p className="text-gray-800 font-medium italic">{axiom.practice}</p>
                                </div>
                              </div>

                              <div className="pt-12 border-t border-gray-50 space-y-6">
                                <h5 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Дневник осознания</h5>
                                <textarea 
                                  value={progress.notes[axiom.id] || ''} 
                                  onChange={e => updateNote(axiom.id, e.target.value)} 
                                  placeholder="Что вы чувствуете, проживая эту аксиому?" 
                                  className="w-full bg-gray-50/50 rounded-3xl p-6 text-base resize-none h-40 border border-transparent focus:bg-white focus:border-gray-100 outline-none transition-all"
                                />
                                <div className="flex gap-4">
                                  <input 
                                    id={`in-${axiom.id}`} 
                                    type="text" 
                                    placeholder="Инсайт момента..." 
                                    className="flex-1 bg-gray-50/50 rounded-2xl px-6 py-4 border border-transparent focus:bg-white focus:border-gray-100 outline-none" 
                                    onKeyDown={e => { if (e.key === 'Enter') { addInsight(axiom.id, e.currentTarget.value); e.currentTarget.value = ''; } }} 
                                  />
                                  <button onClick={() => { const i = document.getElementById(`in-${axiom.id}`) as HTMLInputElement; addInsight(axiom.id, i.value); i.value = ''; }} className="px-10 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">Записать</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="py-24 border-t border-gray-50 text-center opacity-30">
        <p className="serif italic text-sm mb-4">Тишина — лучший учитель.</p>
        <div className="w-1 h-1 bg-black rounded-full mx-auto"></div>
      </footer>
    </div>
  );
};

export default App;
