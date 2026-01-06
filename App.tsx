
import React, { useState, useEffect } from 'react';
import { LEVELS } from './constants';
import { Level, Axiom, UserProgress } from './types';
import LevelCard from './components/LevelCard';
import AICoach from './components/AICoach';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'study' | 'dashboard'>('study');
  const [showHelp, setShowHelp] = useState(false);
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
      <header className="fixed top-0 left-0 right-0 h-14 lg:h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 flex items-center px-4 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('study')}>
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <h1 className="serif text-base lg:text-xl font-semibold tracking-tight text-gray-900">
              Аксиомы Бытия
            </h1>
          </div>
          <nav className="flex items-center gap-4 lg:gap-8">
            <button onClick={() => setView('study')} className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'study' ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}>Изучение</button>
            <button onClick={() => setView('dashboard')} className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'dashboard' ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}>Дашборд</button>
            <button onClick={() => setShowHelp(true)} className="ml-2 p-2 text-gray-300 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </nav>
        </div>
      </header>

      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => setShowHelp(false)} className="text-gray-300 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="mb-8">
               <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
               </div>
               <h3 className="serif text-3xl font-medium mb-3">Деплой на GitHub Pages</h3>
               <p className="text-gray-500 text-sm leading-relaxed">Ваше пространство осознанности готово к выходу в сеть.</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Создайте репозиторий</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Загрузите все файлы проекта в новый публичный репозиторий на GitHub.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Активируйте Pages</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Settings → Pages → Deploy from a branch. Выберите ветку <b>main</b> и нажмите Save.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Настройка ИИ</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Так как это статический хостинг, ключ API должен быть доступен в коде или через прокси. Для тестов вы можете использовать кнопку "Активировать Ключ" в чате.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowHelp(false)} className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
              Начать практику
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto pt-20 lg:pt-28 pb-12 px-4 lg:px-8">
        {view === 'dashboard' ? (
          <Dashboard progress={progress} onClose={() => setView('study')} />
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4 lg:space-y-6 relative">
              <h3 className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-8 pl-1">Архитектура Бытия</h3>
              
              <div className="relative group">
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-6 gap-4 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth">
                  {LEVELS.map((level, idx) => (
                    <LevelCard key={level.id} level={level} isActive={selectedLevel.id === level.id} isLocked={isLevelLocked(idx)} onClick={() => { if (!isLevelLocked(idx)) { setSelectedLevel(level); setActiveAxiom(undefined); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} />
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden"></div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-10 lg:space-y-16">
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  Слой {selectedLevel.id} • {selectedLevel.code}
                </div>
                <h2 className="serif text-3xl lg:text-6xl font-medium text-gray-900 mb-4 leading-[1.1] tracking-tight">{selectedLevel.name}</h2>
                <p className="text-base lg:text-2xl text-gray-400 font-light leading-relaxed max-w-2xl serif italic">{selectedLevel.subtitle}</p>
              </div>

              <div className="space-y-5 lg:space-y-8">
                {selectedLevel.axioms.map((axiom, idx) => {
                  const isStudied = progress.studiedAxiomIds.includes(axiom.id);
                  const isLocked = isAxiomLocked(idx);
                  const isFocused = activeAxiom?.id === axiom.id;
                  
                  if (isLocked) {
                    return (
                      <div key={axiom.id} className="p-5 lg:p-10 rounded-3xl border border-gray-50 bg-gray-50/30 opacity-40 flex items-center gap-6 group">
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:scale-110 transition-transform">
                          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <span className="text-xs lg:text-sm text-gray-400 font-light italic tracking-wide">Аксиома скрыта пеленой времени...</span>
                      </div>
                    );
                  }

                  return (
                    <div key={axiom.id} className={`group p-5 lg:p-10 rounded-[32px] lg:rounded-[48px] transition-all duration-700 border ${isFocused ? 'bg-white border-gray-200 shadow-2xl shadow-gray-100 -translate-y-1' : 'bg-white border-gray-50 hover:border-gray-100'}`}>
                      <div className="flex items-start gap-6 lg:gap-10">
                        <button onClick={(e) => { e.stopPropagation(); toggleStudied(axiom.id); }} className={`mt-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isStudied ? 'bg-black border-black text-white' : 'border-gray-100 text-transparent group-hover:border-gray-300'}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <div className="flex-1" onClick={() => setActiveAxiom(isFocused ? undefined : axiom)}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className={`text-lg lg:text-2xl font-medium transition-colors duration-500 ${isFocused ? 'text-black' : 'text-gray-900'}`}>{axiom.title}</h4>
                            <span className="text-[9px] font-mono text-gray-200 group-hover:text-gray-400 transition-colors">{axiom.id}</span>
                          </div>
                          <p className={`text-sm lg:text-lg leading-relaxed font-light mb-6 transition-colors duration-500 ${isFocused ? 'text-gray-600' : 'text-gray-400'}`}>{axiom.description}</p>
                          {isFocused && (
                            <div className="space-y-6 pt-8 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-700" onClick={e => e.stopPropagation()}>
                                <div className="relative">
                                  <textarea value={progress.notes[axiom.id] || ''} onChange={e => updateNote(axiom.id, e.target.value)} placeholder="Зафиксируйте ваше осознание..." className="w-full bg-gray-50/50 rounded-2xl p-5 text-sm lg:text-base resize-none h-32 border border-transparent focus:bg-white focus:border-gray-100 focus:ring-0 outline-none transition-all" />
                                </div>
                                <div className="flex gap-3">
                                  <input id={`in-${axiom.id}`} type="text" placeholder="Инсайт момента..." className="flex-1 bg-gray-50/50 rounded-2xl px-6 py-4 text-sm lg:text-base border border-transparent focus:bg-white focus:border-gray-100 focus:ring-0 outline-none transition-all" onKeyDown={e => { if (e.key === 'Enter') { addInsight(axiom.id, e.currentTarget.value); e.currentTarget.value = ''; } }} />
                                  <button onClick={() => { const i = document.getElementById(`in-${axiom.id}`) as HTMLInputElement; addInsight(axiom.id, i.value); i.value = ''; }} className="px-8 bg-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95">Записать</button>
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-10 lg:pt-20 border-t border-gray-50"><AICoach currentAxiom={activeAxiom} /></div>
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-gray-50 py-16 flex flex-col items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000">
        <div className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center">
           <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
        <p className="text-[10px] font-light italic tracking-[0.3em] uppercase">Om Mani Padme Hum</p>
      </footer>
    </div>
  );
};

export default App;
