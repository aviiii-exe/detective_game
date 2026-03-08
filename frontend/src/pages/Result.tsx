interface ResultProps {
  isCorrect: boolean | null;
  explanation: string;
  onRestart: () => void;
}

export default function Result({ isCorrect, explanation, onRestart }: ResultProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 z-10 space-y-12 w-full animate-in zoom-in-95 duration-700 ease-out">

      {/* 1. THE VERDICT TITLE (This is the only part that changes color!) */}
      <div className="text-center relative">
        <div className={`absolute inset-0 blur-3xl opacity-20 ${isCorrect ? 'bg-purple-500' : 'bg-red-500'} -z-10`} />
        
        <h2 className={`text-8xl md:text-9xl font-black italic tracking-tighter uppercase ${
          isCorrect 
            ? 'text-purple-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]' 
            : 'text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]'
        }`}>
          {isCorrect ? 'SUCCESS' : 'FAILURE'}
        </h2>
        
        <p className="text-[10px] tracking-[0.8em] uppercase text-white/40 mt-6 font-bold">
          Investigation_Post_Mortem
        </p>
      </div>

      {/* 2. THE DEBRIEF TERMINAL (Locked to Obsidian Purple) */}
      <div className="w-full max-w-4xl bg-black/60 backdrop-blur-xl border border-white/10 p-12 text-left relative overflow-hidden shadow-2xl">
        
        {/* Holographic Corner Accents */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-purple-500 opacity-50" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-purple-500 opacity-50" />

        <div className="absolute top-6 right-8 text-[9px] font-bold uppercase tracking-[0.4em] text-purple-500 opacity-50">
          Classified_Debrief
        </div>

        <h4 className="text-[11px] font-bold tracking-[0.4em] uppercase mb-8 border-b border-white/10 pb-4 inline-block text-purple-500">
          AI_Verdict_Analysis
        </h4>
        
        {/* Swapped to typewriter font to match the game's terminal vibe */}
        <div className="font-typewriter text-xl leading-relaxed text-white/80">
          {explanation}
        </div>
      </div>

      {/* 3. THE REBOOT BUTTON (Locked to Obsidian Purple) */}
      <button
        onClick={onRestart}
        className="mt-8 px-12 py-5 border border-purple-500/50 text-purple-500 text-[11px] font-black tracking-[0.5em] uppercase transition-all duration-300 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
      >
        [ Reboot_System_Interface ]
      </button>

    </div>
  );
}