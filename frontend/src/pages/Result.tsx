interface ResultProps {
  isCorrect: boolean | null;
  explanation: string;
  onRestart: () => void;
}

export default function Result({ isCorrect, explanation, onRestart }: ResultProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 z-10 space-y-12 w-full animate-in zoom-in-95 duration-500">

      <div className="text-center">
        <h2 className={`text-9xl font-black italic tracking-tighter drop-shadow-2xl ${isCorrect ? 'text-purple-400 shadow-purple-500/50' : 'text-red-600 shadow-red-500/50'
          }`}>
          {isCorrect ? 'SUCCESS' : 'FAILURE'}
        </h2>
        <p className="text-[10px] tracking-[0.8em] uppercase text-slate-500 mt-6">
          Investigation_Post_Mortem
        </p>
      </div>

      <div className="max-w-4xl bg-white/[0.02] border border-white/5 p-12 text-left relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 text-[10px] text-purple-500/50 uppercase tracking-[0.3em]">
          Classified_Debrief
        </div>
        <h4 className="text-[12px] text-purple-500 tracking-[0.4em] uppercase mb-6 border-b border-purple-900/30 pb-4 inline-block">
          AI_Verdict_Analysis
        </h4>
        <p className="text-2xl leading-relaxed italic text-slate-200">
          {explanation}
        </p>
      </div>

      <button
        onClick={onRestart}
        className="text-purple-600 text-[15px] font-bold tracking-[0.6em] hover:text-purple-300 transition-colors uppercase py-4 border-b border-transparent hover:border-purple-400"
      >
        [ REBOOT_SYSTEM_INTERFACE ]
      </button>

    </div>
  );
}