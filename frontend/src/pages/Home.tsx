export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full p-10 animate-out fade-out duration-[4000ms]">
      <div className="flex flex-col items-center space-y-16">
        
        {/* THE NEURAL EYE */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-pulse-ring" />
          <div className="absolute inset-4 border border-cyan-400/10 rounded-full animate-[pulse-ring_5s_ease-in-out_infinite]" />
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center backdrop-blur-md border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-float">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
          </div>
        </div>

        {/* UPDATED NAME */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-light tracking-[0.2em] text-white opacity-90 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] uppercase italic">
            AI case detective game
          </h1>
          <div className="flex items-center justify-center space-x-4">
             <div className="h-px w-12 bg-cyan-900/50" />
             <p className="text-[10px] tracking-[0.8em] text-cyan-500 uppercase font-medium">
               Initializing_Sequence
             </p>
             <div className="h-px w-12 bg-cyan-900/50" />
          </div>
        </div>

        {/* VISUAL LOADING BAR (Replaces Button) */}
        <div className="w-48 h-[1px] bg-cyan-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500 animate-[loading-bar_4s_linear_infinite]" />
        </div>
      </div>
    </div>
  );
}