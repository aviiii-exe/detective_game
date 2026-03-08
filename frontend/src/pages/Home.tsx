import { Typewriter } from '../components/Typewriter';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full p-10 animate-out fade-out duration-[4000ms] bg-[#05070a]">

      {/* 1. Grit Overlays for Atmosphere */}
      <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      <div className="absolute inset-0 scanline-effect pointer-events-none opacity-40" />

      <div className="flex flex-col items-center space-y-12 relative z-20">

        {/* 1. THE BIOMETRIC SCANNER (The "Soul" Centerpiece) */}
        <div className="relative w-48 h-64 border border-purple-500/20 bg-purple-500/5 p-4 flex flex-col items-center justify-center">
          {/* Fingerprint / Scanner Icon Area */}
          <div className="relative w-full h-full border border-purple-500/10 flex items-center justify-center overflow-hidden">
            {/* The Scanning Beam */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-400 shadow-[0_0_15px_#22d3ee] animate-[scan-beam_2s_ease-in-out_infinite] z-30" />

            {/* Silhouette / Grid Placeholder */}
            <div className="opacity-20 flex flex-col items-center space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex space-x-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 border border-purple-500/20" />
                  ))}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-purple-500/40 font-bold animate-pulse uppercase tracking-widest">
                Analyzing...
              </span>
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-4 w-full flex justify-between items-center text-[8px] text-purple-500/60 font-mono tracking-tighter uppercase">
            <span>ID: UNKNOWN</span>
            <span className="animate-pulse">TRACE_ACTIVE</span>
          </div>
        </div>

        {/* 2. THE NOIR TITLE */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            AI CASE <span className="text-purple-500">DETECTIVE</span>
          </h1>

          <div className="font-typewriter text-purple-500/80 text-sm italic tracking-widest">
            <Typewriter text="Establishing secure uplink to Case Files ..." delay={40} />
          </div>
        </div>

        {/* BOTTOM LOADING BAR */}
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[7px] text-purple-500/40 tracking-widest uppercase">
            <span>Decrypting_Data</span>
            <span>69%</span>
          </div>
          <div className="w-full h-[2px] bg-purple-900/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-500 animate-[loading-bar_4s_linear_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}