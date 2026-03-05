import { Typewriter } from '../components/Typewriter';
import DotGrid from '../components/DotGrid';

export default function Selection({ onGenerate }: { onGenerate: (m: string) => void }) {
  const modes = [
    { id: 'NOVICE', color: '#22d3ee', desc: 'Standard AI generation. Easy difficulty.' },
    { id: 'INTERMEDIATE', color: '#fbbf24', desc: 'Complex contradictions. Medium difficulty.' },
    { id: 'EXPERT', color: '#ef4444', desc: 'Highly encrypted logic. Hard difficulty.' }
  ];

  return (
    // The parent must be relative so the absolute DotGrid stays inside it
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      
      {/* THE GRID (Layer 0) */}
      <DotGrid />

      {/* THE CONTENT (Layer 10) */}
      <div className="relative z-10 flex flex-col items-center justify-center p-10 space-y-12 max-w-5xl w-full mx-auto animate-in fade-in duration-1000">
        
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-light tracking-[0.4em] text-white/90 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Select_Operation_Mode
          </h2>
          <div className="w-24 h-px bg-white/10 mx-auto" />
        </div>

        <div className="grid grid-cols-3 gap-8 w-full">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onGenerate(mode.id)}
              style={{ '--mode-glow': mode.color } as React.CSSProperties}
              className="h-64 border border-white/5 bg-black/60 backdrop-blur-md transition-all duration-500 flex flex-col items-center justify-center group p-8 text-center relative overflow-hidden hover:border-[var(--mode-glow)] hover:shadow-[0_0_30px_rgba(0,0,0,0.5),0_0_20px_var(--mode-glow)]"
            >
              <div 
                className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out opacity-10" 
                style={{ backgroundColor: mode.color }}
              />

              <div className="w-12 h-12 border border-white/10 mb-6 group-hover:rotate-45 transition-all duration-500 flex items-center justify-center relative z-20 group-hover:border-[var(--mode-glow)]">
                <div className="w-2 h-2" style={{ backgroundColor: mode.color }} />
              </div>

              <span className="text-[12px] tracking-[0.4em] font-bold text-white/40 group-hover:text-white relative z-20 mb-3 transition-colors uppercase">
                {mode.id}
              </span>
              <p className="text-[9px] text-white/20 uppercase tracking-widest relative z-20 group-hover:text-white/60">
                {mode.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="w-full p-8 bg-black/60 border-l border-white/10 backdrop-blur-md relative z-10">
          <p className="text-[10px] text-white/20 mb-4 font-bold tracking-[0.4em] uppercase">System_Prompt:</p>
          <div className="text-lg italic text-slate-400">
            <Typewriter text="Awaiting mode selection... The AI Content Engine is ready for uplink." />
          </div>
        </div>
      </div>
    </div>
  );
}