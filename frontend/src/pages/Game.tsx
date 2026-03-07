// src/pages/Game.tsx
import { useState, useEffect } from 'react';
import { Typewriter } from '../components/Typewriter';

interface Suspect {
  name: string;
  hover_bio: string;
}

interface GameProps {
  activeCase: {
    gameId: string; // Ensure this is strict typed from App.tsx fix
    theme_name: string;
    narration: string;
    suspects: Suspect[];
    difficulty_level: string;
    actual_murderer: string; // Need this for frontend display logic
  };
  onAccuse: (suspectName: string, reason: string) => void;
  onAbort: () => void;
}

export default function Game({ activeCase, onAccuse, onAbort }: GameProps) {
  const [phase, setPhase] = useState<'BRIEFING' | 'INVESTIGATION'>('BRIEFING');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Custom Modal States
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false); // 🚨 FEATURE 2: Custom Abort UI

  // Interrogation States
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<{role: string, text: string}[]>([]);
  const [isAccusing, setIsAccusing] = useState(false);
  const [reason, setReason] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  //  FEATURE 1: Per-Suspect Question Tracking (Frontend State)
  // Maps suspect name to questions asked: e.g., { "Suspect A": 2, "Suspect B": 1 }
  const [questionsAsked, setQuestionsAsked] = useState<Record<string, number>>({});

  const getInitialTime = () => {
    switch (activeCase.difficulty_level) {
      case 'EXPERT': return 12 * 60;
      case 'INTERMEDIATE': return 8 * 60;
      default: return 5 * 60;
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

  const handleStartGame = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPhase('INVESTIGATION');
      setIsTransitioning(false);
    }, 800);
  };

  // FEATURE 1: Updated Chat Handler
  const handleChat = async () => {
    if (!question.trim() || !selectedSuspect || loadingChat) return;

    // A. Verify local limit BEFORE sending
    const currentCount = questionsAsked[selectedSuspect.name] || 0;
    if (currentCount >= 3) {
      setChatLog([...chatLog, { role: 'SYSTEM', text: 'Neural link limit reached for this subject.' }]);
      return;
    }

    const newLog = [...chatLog, { role: 'Detective', text: question }];
    setChatLog(newLog);
    setQuestion("");
    setLoadingChat(true);

    try {
      setQuestionsAsked({
        ...questionsAsked,
        [selectedSuspect.name]: currentCount + 1
      });

      const res = await fetch('http://127.0.0.1:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: activeCase.gameId,
          suspect_name: selectedSuspect.name,
          question: question,
          suspect_bio: selectedSuspect.hover_bio,
          difficulty: activeCase.difficulty_level
        })
      });
      
      const data = await res.json();

      // SAFETY NET 1: Catch actual backend crashes and print them into the chat!
      if (!res.ok || data.error) {
         setChatLog([...newLog, { role: 'SYSTEM', text: `[SYSTEM ERROR: ${data.error || 'Neural link severed.'}]` }]);
         return;
      }

      // SAFETY NET 2: Grab the text no matter what key Python uses to send it
      const aiText = data.reply || data.response || data.message || (typeof data === 'string' ? data : "Subject remains silent.");
      
      setChatLog([...newLog, { role: selectedSuspect.name, text: aiText }]);

    } catch (err) {
      setChatLog([...newLog, { role: 'SYSTEM', text: '[CRITICAL FAILURE: Unable to reach interrogation engine.]' }]);
    } finally {
      setLoadingChat(false);
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
          <div className="w-full flex justify-between items-start mb-8 relative z-20">
            <button 
              onClick={() => setShowAbortConfirm(true)} // 🚨 Trigger Custom Abort UI
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 group transition-all"
            >
              <span className="text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-transform">←</span>
            </button>

            <div className="text-right">
              <span className="text-[8px] text-cyan-500/50 font-bold uppercase tracking-[0.3em]">Neural_Link_Time</span>
              <div className={`mt-1 px-4 py-2 border font-mono text-2xl tracking-widest ${
                timeLeft < 60 ? 'border-red-500 text-red-500 animate-pulse bg-red-500/10' : 'border-cyan-500/30 text-cyan-500 bg-cyan-500/5'
              }`}>
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
              {activeCase.suspects.map((suspect: any, i: number) => (
                <button
                  key={suspect.name}
                  onClick={() => {
                    setSelectedSuspect(suspect);
                    setChatLog([]);
                    setIsAccusing(false);
                  }}
                  className="group relative aspect-[3/4] bg-black/40 border border-white/5 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <span className="text-[8px] text-cyan-500/40 font-bold uppercase mb-1">Subject_0{i+1}</span>
                    <h4 className="text-2xl font-black italic text-white/40 group-hover:text-white transition-colors uppercase leading-none">
                      {suspect.name}
                    </h4>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10 group-hover:border-cyan-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODALS (Interrogation and Abort) */}
      {/* ================================================================ */}

      {/* 1. INTERROGATION MODAL */}
      {selectedSuspect && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-20 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-5xl h-full bg-black border border-white/10 flex flex-col overflow-hidden relative shadow-2xl">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Interrogating: <span className="text-cyan-500">{selectedSuspect.name}</span>
              </h2>
              <button onClick={() => setSelectedSuspect(null)} className="text-white/20 hover:text-white uppercase text-[10px] tracking-widest">[ CLOSE_FILE ]</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left: Suspect Dossier */}
              <div className="w-1/3 p-8 border-r border-white/10 bg-white/5 overflow-y-auto">
                <span className="text-[8px] text-cyan-500 font-bold uppercase tracking-widest block mb-4">Forensic_Bio</span>
                <p className="text-xs text-white/60 leading-relaxed italic font-typewriter">{selectedSuspect.hover_bio}</p>
                
                {/* FEATURE 1: Questions remaining tracker */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Link_Questions_Used</span>
                  <p className={`text-4xl font-mono ${ (questionsAsked[selectedSuspect.name] || 0) >= 3 ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
                    {(questionsAsked[selectedSuspect.name] || 0)} <span className="text-sm text-white/40">/ 3</span>
                  </p>
                </div>

                <button 
                  onClick={() => setIsAccusing(true)}
                  className="mt-12 w-full py-4 border border-red-500/50 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Initiate_Arrest
                </button>
              </div>

              {/* Right: The Terminal Chat */}
              <div className="flex-1 flex flex-col p-8 bg-black/40">
                {!isAccusing ? (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 font-mono text-[11px] mb-6 pr-4">
                      {chatLog.map((m, i) => (
                        <div key={i} className={`p-3 border ${m.role === 'Detective' ? 'border-cyan-500/30 bg-cyan-500/5 ml-8' : m.role === 'SYSTEM' ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5 mr-8'}`}>
                          <span className={`font-bold uppercase ${m.role === 'Detective' ? 'text-cyan-500' : m.role === 'SYSTEM' ? 'text-red-500' : 'text-white/40'}`}>{m.role}:</span>
                          <p className="mt-1 text-white/80 leading-relaxed">{m.text}</p>
                        </div>
                      ))}
                      {loadingChat && <div className="text-cyan-500/50 animate-pulse font-bold text-[9px] tracking-widest uppercase ml-8">[ Neural_Link_Processing_Response... ]</div>}
                    </div>
                    <div className="flex gap-2 p-2 border border-white/10 bg-black">
                      <input 
                        value={question}
                        disabled={(questionsAsked[selectedSuspect.name] || 0) >= 3}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder={(questionsAsked[selectedSuspect.name] || 0) >= 3 ? "Subject refuses to speak further." : "Type your question..."} 
                        className="flex-1 bg-transparent p-2 outline-none text-xs uppercase tracking-widest text-cyan-50 disabled:text-white/20" 
                      />
                      <button onClick={handleChat} disabled={(questionsAsked[selectedSuspect.name] || 0) >= 3} className="bg-cyan-500 text-black px-6 font-bold text-[10px] uppercase tracking-widest hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/30">Send</button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-right-10 px-10">
                    <h3 className="text-xl font-black italic text-red-500 uppercase tracking-tighter">Accusation Reasoning</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest text-center">The AI Judge will evaluate your logic. Why is {selectedSuspect.name} guilty?</p>
                    <textarea 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full h-40 bg-white/5 border border-white/10 p-4 text-xs font-typewriter outline-none focus:border-red-500 transition-colors text-white"
                      placeholder="Enter your forensic evidence and reasoning here..."
                    />
                    <button 
                      onClick={() => onAccuse(selectedSuspect.name, reason)}
                      className="px-12 py-4 bg-red-600 text-white font-black text-xs tracking-[0.4em] uppercase hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all"
                    >
                      Final_Decision
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 2: CUSTOM ABORT CONFIRMATION MODAL */}
      {showAbortConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-lg flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-black border border-red-500/30 p-10 text-center shadow-[0_0_60px_rgba(239,68,68,0.2)]">
            <div className="absolute top-4 left-6 px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.4em]">
              WARNING_ALERT
            </div>

            <div className="mb-8 mt-4">
              <span className="text-red-500 text-xs font-mono tracking-wider animate-pulse">[ Neural Link Stable ]</span>
              <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mt-2">Abort Mission?</h3>
              <p className="mt-4 text-[10px] text-white/60 font-typewriter uppercase tracking-widest leading-relaxed">Closing this dossier now will result in the <strong className="text-red-500">suspect escaping justice</strong>. The case remains unsolved.</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowAbortConfirm(false)}
                className="flex-1 py-4 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/5"
              >
                Continue_Investigation
              </button>
              <button 
                onClick={onAbort} // This connects back to App.tsx
                className="flex-1 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:scale-105 transition-all"
              >
                Abort_Case_Unsolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}