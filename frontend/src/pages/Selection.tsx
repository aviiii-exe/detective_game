import React, { useState, useRef, useEffect } from 'react';
import DotGrid from '../components/DotGrid';

interface CaseSummary {
  id: number;
  title: string;
  desc: string;
  keyword: string;
}

interface SelectionProps {
  onGenerate: (theme: string, difficulty: string, keyword: string, desc: string) => void;
}

export default function Selection({ onGenerate }: SelectionProps) {
  // --- STATE MANAGEMENT ---
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [caseDatabase, setCaseDatabase] = useState<CaseSummary[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false); 
  const scrollRef = useRef<HTMLDivElement>(null);

  const modes = [
    { id: 'NOVICE', code: 'CASE_01', color: '#22d3ee', difficulty: 'LOW_RISK' },
    { id: 'INTERMEDIATE', code: 'CASE_04', color: '#fbbf24', difficulty: 'MODERATE' },
    { id: 'EXPERT', code: 'CASE_09', color: '#ef4444', difficulty: 'CRITICAL' }
  ];

  // --- FUNCTION TO FETCH THE AI CASE LIST ---
  const fetchCaseList = async (difficulty: string) => {
    setIsLoadingList(true);
    setSelectedDifficulty(difficulty); 

    try {
      const response = await fetch('http://127.0.0.1:5001/api/generate-case-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: difficulty }),
      });

      const data = await response.json();
      // Duplicate the cases 3 times to create the infinite scroll illusion
      const infiniteList = [...data.cases, ...data.cases, ...data.cases];
      setCaseDatabase(infiniteList);
      
      if (data.cases.length > 0) {
        setSelectedCase(data.cases[0]);
      }
    } catch (error) {
      console.error("Failed to fetch case list:", error);
      alert("Failed to connect to the Case Database. Is the backend running?");
      setSelectedDifficulty(null);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Infinite scroll centering logic
  useEffect(() => {
    if (selectedDifficulty && !isLoadingList && scrollRef.current && caseDatabase.length > 0) {
      // Snap to exactly the start of the middle set
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight / 3;
    }
  }, [selectedDifficulty, isLoadingList, caseDatabase]);

  // REFACTORED: Seamless Infinite scroll looping logic
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    // The exact pixel height of ONE set of cases (since we duplicated it 3 times)
    const singleSetHeight = scrollHeight / 3;

    // If we scroll too far up (into the first set), seamlessly jump down by one full set
    if (scrollTop <= 10) {
      scrollRef.current.scrollTop = scrollTop + singleSetHeight;
    } 
    // If we scroll too far down (into the third set), seamlessly jump up by one full set
    else if (scrollTop + clientHeight >= scrollHeight - 10) {
      scrollRef.current.scrollTop = scrollTop - singleSetHeight;
    }
  };

  // -----------------------------------------------------------------
  // VIEW A: 3-BUTTON UI
  // -----------------------------------------------------------------
  if (!selectedDifficulty) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#05070a]">
        <DotGrid proximity={120} baseColor="rgba(255, 255, 255, 0.03)" />
        <div className="absolute inset-0 vignette-overlay z-10 pointer-events-none" />
        <div className="absolute inset-0 scanline-effect z-10 pointer-events-none" />

        <div className="relative z-20 w-full max-w-6xl p-10 space-y-16">
          <div className="space-y-2 border-l-4 border-cyan-500 pl-6">
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
              Select Investigation
            </h2>
            <p className="text-xs tracking-[0.5em] text-cyan-500/50 font-bold uppercase">
              Forensic_Database_v4.02 // Awaiting_Selection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => fetchCaseList(mode.id)}
                style={{ '--case-color': mode.color } as React.CSSProperties}
                className="group relative flex flex-col text-left transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-24 h-6 bg-white/5 border-t border-x border-white/10 rounded-t-lg ml-2 transition-colors group-hover:bg-[var(--case-color)] group-hover:text-black flex items-center justify-center">
                  <span className="text-[8px] font-bold tracking-widest">{mode.code}</span>
                </div>
                
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group-hover:border-[var(--case-color)]/50">
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

                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/5 group-hover:border-[var(--case-color)] transition-colors" />
                </div>

                <div className="absolute inset-0 -z-10 bg-[var(--case-color)]/0 blur-3xl transition-all duration-500 group-hover:bg-[var(--case-color)]/10" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW B: INFINITE SCROLL CASE SELECTOR
  // -----------------------------------------------------------------
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#05070a]">
      <DotGrid proximity={120} baseColor="rgba(255, 255, 255, 0.03)" />
      <div className="absolute inset-0 vignette-overlay z-10 pointer-events-none" />
      <div className="absolute inset-0 scanline-effect z-10 pointer-events-none" />

      <div className="relative z-20 w-full max-w-6xl h-[80vh] flex flex-col md:flex-row bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        
        {isLoadingList && (
          <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-500 rounded-full animate-spin mb-8" />
            <p className="text-[10px] text-cyan-500 font-bold tracking-[0.3em] animate-pulse uppercase">
              Scanning Global Case Database...
            </p>
            <p className="text-[8px] text-cyan-500/50 mt-2 font-mono">
              Filter: {selectedDifficulty} // Decrypting Files...
            </p>
          </div>
        )}

        {/* LEFT SIDE: INFINITE SCROLLING LIST */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative border-b md:border-b-0 md:border-r border-white/10 bg-black/40">
          <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-[#05070a] to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            // REFACTORED: Removed 'scroll-smooth' so JS jumping is invisible!
            className="h-full overflow-y-scroll"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {!isLoadingList && caseDatabase.length > 0 && caseDatabase.map((c, index) => (
              <div 
                key={`${c.id}-${index}`}
                onClick={() => setSelectedCase(c)}
                className={`flex h-36 cursor-pointer border-b border-white/5 transition-all duration-300 ${
                  selectedCase?.id === c.id ? 'bg-cyan-900/20 border-l-4 border-l-cyan-500' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-full p-6 flex flex-col justify-center">
                  <h3 className={`font-black italic text-lg tracking-widest uppercase mb-2 ${selectedCase?.id === c.id ? 'text-white' : 'text-white/40'}`}>
                    [{c.id}] {c.title}
                  </h3>
                  <p className="text-[10px] text-white/30 tracking-widest uppercase line-clamp-2 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-[#05070a] to-transparent z-10 pointer-events-none" />
        </div>

        {/* RIGHT SIDE: SELECTED CASE PREVIEW */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-10 flex flex-col justify-between font-mono">
          {!isLoadingList && selectedCase ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] text-cyan-500/50 font-bold uppercase tracking-[0.5em]">Target Profile</span>
                  <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase border border-white/10 px-3 py-1 bg-white/5">
                    {selectedDifficulty}
                  </span>
                </div>

                <div className="relative w-full h-56 border border-white/10 mb-8 overflow-hidden group">
                  <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay z-10 pointer-events-none" />
                  <img 
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(selectedCase.keyword || "cyberpunk crime scene dark")}?width=800&height=400&nologo=true&seed=${selectedCase.id}`} 
                    alt="Case Location" 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute bottom-2 right-2 z-20 text-[8px] text-cyan-500 bg-black/80 px-2 font-mono tracking-widest">
                    REC_FEED_ONLINE // LIVE
                  </div>
                </div>

                <h1 className="text-3xl font-black italic text-white mb-4 uppercase tracking-tighter">{selectedCase.title}</h1>
                
                <div className="h-px w-full bg-white/5 mb-4" />
                
                <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed border-l-2 border-cyan-500 pl-4">
                  {selectedCase.desc}
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => {
                    setSelectedDifficulty(null);
                    setCaseDatabase([]); 
                  }}
                  className="px-6 py-4 text-[10px] font-bold text-white/30 border border-white/10 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest"
                >
                  Abort
                </button>
                <button 
                  onClick={() => onGenerate(selectedCase.title, selectedDifficulty!, selectedCase.keyword, selectedCase.desc)}
                  className="flex-1 px-6 py-4 bg-cyan-500/10 text-cyan-500 border border-cyan-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300"
                >
                Establish Secure Uplink
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-white/30 tracking-widest uppercase">
              {isLoadingList ? "Awaiting Data..." : "Select a Case File..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}