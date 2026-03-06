// src/pages/Game.tsx
import { useState, useEffect } from 'react';
import { Typewriter } from '../components/Typewriter';

interface Suspect {
  name: string;
  hover_bio: string;
}

interface GameProps {
  activeCase: {
    theme_name: string;
    image_keyword: string;
    narration: string;
    suspects: Suspect[];
    difficulty_level: string;
  };
  onAccuse: (suspectName: string) => void;
  onAbort: () => void;
}

export default function Game({ activeCase, onAccuse, onAbort }: GameProps) {
  const [phase, setPhase] = useState<'BRIEFING' | 'INVESTIGATION'>('BRIEFING');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 1. DYNAMIC TIMER LOGIC
  const getInitialTime = () => {
    switch (activeCase.difficulty_level) {
      case 'EXPERT': return 12 * 60; // 12 mins
      case 'INTERMEDIATE': return 8 * 60; // 8 mins
      default: return 5 * 60; // 5 mins for NOVICE
    }
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());

  useEffect(() => {
    if (phase === 'INVESTIGATION' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. TRANSITION HANDLER
  const handleStartGame = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPhase('INVESTIGATION');
      setIsTransitioning(false);
    }, 800); // Matches the duration of the slide-down animation
  };

  const handleAbortClick = () => {
    if (window.confirm("Close the case unsolved? The killer will escape!")) {
      onAbort();
    }
  };

  return (
    <div className="flex-1 w-full h-full p-10 flex flex-col relative overflow-hidden">
      
      {/* PHASE 1: THE BRIEFING */}
      {phase === 'BRIEFING' && (
        <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          isTransitioning ? 'translate-y-[100vh] opacity-0' : 'animate-in fade-in zoom-in-95'
        }`}>
          <div className="w-full max-w-4xl p-12 bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl relative">
             <div className="absolute -top-4 left-6 px-3 py-1 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest">
               Dossier_Open
             </div>
             
             <div className="font-typewriter text-2xl leading-relaxed text-white/80 min-h-[150px]">
               <Typewriter text={activeCase.narration} delay={30} />
             </div>
          </div>

          <button 
            onClick={handleStartGame}
            className="mt-12 px-16 py-4 border border-white/20 text-white font-bold tracking-[0.5em] uppercase hover:bg-white hover:text-black hover:scale-105 transition-all duration-300"
          >
            START_GAME
          </button>
        </div>
      )}

      {/* PHASE 2: THE INVESTIGATION */}
      {phase === 'INVESTIGATION' && (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-top-10 duration-1000">
          
          {/* HEADER ROW */}
          <div className="w-full flex justify-between items-start mb-8">
            <button 
              onClick={handleAbortClick}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 group transition-all"
            >
              <span className="text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-transform">←</span>
            </button>

            <div className="text-right">
              <span className="text-[8px] text-cyan-500/50 font-bold uppercase tracking-[0.3em]">Neural_Link_Time</span>
              <div className="mt-1 px-4 py-2 border border-cyan-500/30 bg-cyan-500/5 text-cyan-500 font-mono text-2xl tracking-widest">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* SUSPECT GRID */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="text-center space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.5em]">Tap to know more about them</p>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
            </div>

            <div className="grid grid-cols-4 gap-8 w-full max-w-6xl">
              {activeCase.suspects.map((suspect, i) => (
                <button
                  key={suspect.name}
                  onClick={() => console.log("Interrogating:", suspect.name)}
                  className="group relative aspect-[3/4] bg-black/40 border border-white/5 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden"
                >
                  {/* Card Glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <span className="text-[8px] text-cyan-500/40 font-bold uppercase mb-1">Subject_0{i+1}</span>
                    <h4 className="text-2xl font-black italic text-white/40 group-hover:text-white transition-colors uppercase">
                      {suspect.name}
                    </h4>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10 group-hover:border-cyan-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}