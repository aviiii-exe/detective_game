import DotGrid from '../components/DotGrid';

export default function Selection({ onGenerate }: { onGenerate: (m: string) => void }) {
  const modes = [
    { id: 'NOVICE', code: 'CASE_01', color: '#22d3ee', difficulty: 'LOW_RISK' },
    { id: 'INTERMEDIATE', code: 'CASE_04', color: '#fbbf24', difficulty: 'MODERATE' },
    { id: 'EXPERT', code: 'CASE_09', color: '#ef4444', difficulty: 'CRITICAL' }
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#05070a]">
      <DotGrid proximity={120} baseColor="rgba(255, 255, 255, 0.03)" />
      
      {/* Visual Grit Overlays */}
      <div className="absolute inset-0 vignette-overlay z-10" />
      <div className="absolute inset-0 scanline-effect z-10" />

      <div className="relative z-20 w-full max-w-6xl p-10 space-y-16">
        <div className="space-y-2 border-l-4 border-cyan-500 pl-6">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            Select Investigation
          </h2>
          <p className="text-xs tracking-[0.5em] text-cyan-500/50 font-bold uppercase">
            Forensic_Database_v4.02 // Awaiting_Selection
          </p>
        </div>

        <div className="grid grid-cols-3 gap-10">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onGenerate(mode.id)}
              style={{ '--case-color': mode.color } as React.CSSProperties}
              className="group relative flex flex-col text-left transition-all duration-500 hover:-translate-y-2"
            >
              {/* Folder Tab Effect */}
              <div className="w-24 h-6 bg-white/5 border-t border-x border-white/10 rounded-t-lg ml-2 transition-colors group-hover:bg-[var(--case-color)] group-hover:text-black flex items-center justify-center">
                <span className="text-[8px] font-bold tracking-widest">{mode.code}</span>
              </div>
              
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group-hover:border-[var(--case-color)]/50">
                {/* ID Tag */}
                <span className="absolute top-4 right-4 text-[8px] font-bold text-white/20 tracking-tighter uppercase">
                  Ref: {mode.difficulty}
                </span>

                <h3 className="text-3xl font-black italic text-white/40 group-hover:text-white transition-colors mb-4">
                  {mode.id}
                </h3>
                
                <div className="h-px w-full bg-white/5 mb-4 group-hover:bg-[var(--case-color)]/20" />
                
                <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                  Initializing forensic link for difficulty level: {mode.id}. Trace probability: 84%.
                </p>

                {/* Corner Accent */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/5 group-hover:border-[var(--case-color)] transition-colors" />
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 -z-10 bg-[var(--case-color)]/0 blur-3xl transition-all duration-500 group-hover:bg-[var(--case-color)]/10" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}