// src/pages/Game.tsx
import { useState, useEffect } from 'react';
import { Typewriter } from '../components/Typewriter';
import TiltedCard from '../components/TiltedCard';

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
  onTimeOut: () => void;
}

export default function Game({ activeCase, onAccuse, onAbort, onTimeOut }: GameProps) {
  const [phase, setPhase] = useState<'BRIEFING' | 'INVESTIGATION'>('BRIEFING');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Custom Modal States
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false); // State to trigger the exit animation
  const [showAbortConfirm, setShowAbortConfirm] = useState(false); //FEATURE : Custom Abort UI

  // Interrogation States
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string, text: string }[]>([]);
  const [isAccusing, setIsAccusing] = useState(false);
  const [reason, setReason] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  //  FEATURE 1: Per-Suspect Question Tracking (Frontend State)
  // Maps suspect name to questions asked: e.g., { "Suspect A": 2, "Suspect B": 1 }
  const [questionsAsked, setQuestionsAsked] = useState<Record<string, number>>({});

  // NEW: Evidence Gathering States
  const [evidenceLog, setEvidenceLog] = useState<{suspect: string, clue: string}[]>([]);
  const [activeEvidenceSelections, setActiveEvidenceSelections] = useState<number[]>([]);

  // FEATURE: Precision Text Extractor State
  const [snippetPopup, setSnippetPopup] = useState<{show: boolean, x: number, y: number, text: string, suspect: string} | null>(null);

  // Close the popup if they click anywhere else on the screen
  useEffect(() => {
    const dismissPopup = () => setSnippetPopup(null);
    document.addEventListener('mousedown', dismissPopup);
    return () => document.removeEventListener('mousedown', dismissPopup);
  }, []);

  const getInitialTime = () => {
    switch (activeCase.difficulty_level) {
      case 'EXPERT': return 20 * 60;
      case 'INTERMEDIATE': return 15 * 60;
      default: return 1 * 60;
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

  // NEW: Smooth close handler
  const handleCloseModal = () => {
    setIsClosingModal(true); 
    setTimeout(() => {
      setSelectedSuspect(null); 
      setIsClosingModal(false); 
    }, 400); // synced with css duration
  };

  // FEATURE: Capture highlighted text
  const handleTextHighlight = (e: React.MouseEvent, role: string) => {
    // We only extract from suspects, not the Detective or System
    if (role === 'Detective' || role === 'SYSTEM') return;

    const selection = window.getSelection();
    const text = selection?.toString().trim();

    // If they highlighted more than 5 characters, show the popup!
    if (text && text.length > 5) {
      setSnippetPopup({
        show: true,
        x: e.clientX,
        y: e.clientY - 40, // Put it 40px above their mouse cursor
        text: text,
        suspect: role
      });
    } else {
      setSnippetPopup(null);
    }
  };

  // FEATURE: Updated Chat Handler
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

      const res = await fetch('https://nonvegetative-may-untensile.ngrok-free.dev/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
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
    <div className="flex-1 w-full max-w-7xl mx-auto px-10 pb-10 pt-6 flex flex-col relative">

      {/* PHASE 1: THE BRIEFING */}
      {phase === 'BRIEFING' && (
        <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isTransitioning ? 'translate-y-[100vh] opacity-0' : 'animate-in fade-in zoom-in-95'
          }`}>
          <div className="w-full max-w-4xl p-12 bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute -top-4 left-6 px-3 py-1 bg-purple-500 text-black text-[10px] font-black uppercase tracking-widest">
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
            BEGIN_INVESTIGATION
          </button>
        </div>
      )}

      {/* PHASE 2: THE INVESTIGATION */}
      {phase === 'INVESTIGATION' && (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-top-10 duration-1000">

          {/* HEADER ROW */}
          <div className="w-full flex justify-between items-start mb-8 relative z-20 shrink-0">
            <button
              onClick={() => setShowAbortConfirm(true)} // Trigger Custom Abort UI
              className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/7 group transition-all"
            >
              <span className="text-white/40 group-hover:text-white transition-transform">←</span>
            </button>

            <div className="text-right">
              <span className="text-[10px] text-purple-500/50 font-bold uppercase tracking-[0.3em]">Time_Remaining</span>
              <div className={`mt-1 px-4 py-2 border font-mono text-2xl tracking-widest flex items-center justify-center ${timeLeft < 60 ? 'border-red-500 text-red-500 animate-pulse bg-red-500/10' : 'border-purple-500/30 text-purple-500 bg-purple-500/5'
                }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* SUSPECT GRID */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full">
            <div className="text-center space-y-2">
              <p className="text-[12px] text-white/70 uppercase tracking-[0.5em]">Tap to interrogate them!</p>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
            </div>

            <div className="w-full flex justify-center">
              <div className="grid grid-cols-4 gap-8 gap-x-12 w-full max-w-6xl">
              {activeCase.suspects.map((suspect: any, i: number) => (
                // NEW: Wrapped the entire button in our 3D physics engine
                <TiltedCard key={suspect.name} rotateAmplitude={14} scaleOnHover={1.05}>
                  <button
                    onClick={() => {
                      setSelectedSuspect(suspect);
                      setChatLog([]);
                      setIsAccusing(false);
                    }}
                    className="w-full h-full group relative aspect-[3/4] bg-black/40 border border-white/15 hover:border-purple-500/50 transition-colors duration-500 overflow-hidden shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center pointer-events-none">
                      <span className="text-[14px] text-purple-500/60 group-hover:text-purple-400 transition-colors duration-300 font-bold uppercase tracking-widest mb-1">
                        Subject_0{i+1}
                      </span>
                      <h4 className="text-2xl font-black italic text-white/40 group-hover:text-white transition-colors uppercase leading-none">
                        {suspect.name}
                      </h4>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10 group-hover:border-purple-500 transition-colors" />
                  </button>
                </TiltedCard>
              ))}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODALS (Interrogation and Abort) */}
      {/* ================================================================ */}

      {/* 1. INTERROGATION MODAL */}
      {selectedSuspect && (
        <div className={`fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-20 ${
          isClosingModal ? 'animate-bg-out' : 'animate-bg-in'
        }`}>
          
          {/* Gets the separate Genie animation! */}
          <div className={`w-full max-w-5xl h-full bg-[#05070a] border border-purple-500/20 flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(168,85,247,0.15)] ${
            isClosingModal ? 'animate-genie-out' : 'animate-genie-in'
          }`}>
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Interrogating: <span className="text-purple-500">{selectedSuspect.name}</span>
              </h2>
              {/*REFACTORED: Now uses our smooth close handler */}
              <button 
                onClick={handleCloseModal} 
                className="text-white/30 hover:text-purple-400 transition-colors uppercase text-[12px] font-bold tracking-widest"
              >
                [ CLOSE_FILE ]
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left: Suspect Dossier */}
              {/* REFACTORED: Made this a flex-col so we can push the button to the bottom */}
              <div className="w-1/3 p-8 border-r border-white/10 bg-white/5 flex flex-col overflow-hidden">
                
                {/* Scrollable Upper Area */}
                <div className="flex-1 overflow-y-auto pr-4 space-y-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f730 transparent' }}>
                  
                  {/* Bio */}
                  <div>
                    <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest block mb-2">Forensic_Bio</span>
                    <p className="text-sm text-white/60 leading-relaxed italic font-typewriter">{selectedSuspect.hover_bio}</p>
                  </div>

                  {/* Questions remaining tracker */}
                  <div className="pt-6 border-t border-white/10 text-center">
                    <span className="text-[11px] text-white/30 uppercase tracking-widest block mb-1">Link_Questions_Asked</span>
                    <p 
                      key={questionsAsked[selectedSuspect.name] || 0} 
                      className={`text-4xl font-mono ${(questionsAsked[selectedSuspect.name] || 0) >= 3 ? 'text-red-500 animate-pulse' : 'text-purple-500'}`}
                    >
                      {(questionsAsked[selectedSuspect.name] || 0)} <span className="text-sm text-white/40">/ 3</span>
                    </p>
                  </div>

                  {/* The Extracted Evidence Inventory */}
                  <div className="pt-6 border-t border-white/10">
                    <span className="text-[9px] text-purple-500 font-bold uppercase tracking-widest block mb-4">Extracted_Data_Log</span>
                    {evidenceLog.length === 0 ? (
                      <p className="text-[10px] text-white/20 italic font-mono">No forensic data extracted yet...</p>
                    ) : (
                      <div className="space-y-3">
                        {evidenceLog.map((ev, idx) => (
                          <div key={idx} className="p-2 border border-purple-500/30 bg-purple-500/5 text-[11px] font-mono text-white/60 relative group">
                             <span className="text-purple-500 font-bold block mb-1">[{ev.suspect}]</span>
                             <p className="line-clamp-3">{ev.clue}</p>
                             <button 
                               onClick={() => setEvidenceLog(prev => prev.filter((_, i) => i !== idx))}
                               className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                             >x</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div> {/* End Scrollable Upper Area */}

                {/* REFACTORED: Sticky Bottom Area for the Button */}
                <div className="pt-6 mt-auto shrink-0 border-t border-transparent">
                  <button
                    onClick={() => setIsAccusing(true)}
                    className="w-full py-4 border border-red-500/50 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    Initiate_Arrest
                  </button>
                </div>
              </div>

              {/* Right: The Terminal Chat */}
              <div className="flex-1 flex flex-col p-8 bg-black/40">
                {!isAccusing ? (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 font-mono text-[11px] mb-6 pr-4">
                      {chatLog.map((m, i) => (
                        // REFACTORED: Removed the old "Extract Data" hover button from here
                        <div key={i} className={`p-3 border relative group ${m.role === 'Detective' ? 'border-purple-500/30 bg-purple-500/5 ml-8' : m.role === 'SYSTEM' ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5 mr-8'}`}>
                          
                          {/* NEW: Hover to extract evidence! */}
                          {m.role !== 'Detective' && m.role !== 'SYSTEM' && (
                            <button 
                              onClick={() => setEvidenceLog(prev => [...prev, { suspect: m.role, clue: m.text }])}
                              className="absolute -top-3 right-2 bg-black border border-purple-500 text-purple-500 text-[8px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-purple-500 hover:text-black uppercase tracking-widest z-10"
                            >
                              + Extract_Data
                            </button>
                          )}

                          <span className={`font-bold uppercase ${m.role === 'Detective' ? 'text-purple-500' : m.role === 'SYSTEM' ? 'text-red-500' : 'text-white/40'}`}>{m.role}:</span>
                          {/* ADDED: onMouseUp listener to capture their selection */}
                          <p 
                            onMouseUp={(e) => handleTextHighlight(e, m.role)}
                            className="mt-1 text-white/80 leading-relaxed selection:bg-purple-500/40 selection:text-white"
                          >
                            {m.text}
                          </p>
                        </div>
                      ))}
                      {loadingChat && <div className="text-purple-500/50 animate-pulse font-bold text-[9px] tracking-widest uppercase ml-8">[ Suspect_Is_Responding... ]</div>}
                    </div>
                    <div className="flex gap-2 p-2 border border-white/10 bg-black">
                      <input
                        value={question}
                        disabled={(questionsAsked[selectedSuspect.name] || 0) >= 3}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder={(questionsAsked[selectedSuspect.name] || 0) >= 3 ? "Subject refuses to speak further." : "Type your question..."}
                        className="flex-1 bg-transparent p-2 outline-none text-xs uppercase tracking-widest text-purple-50 disabled:text-white/20"
                      />
                      <button onClick={handleChat} disabled={(questionsAsked[selectedSuspect.name] || 0) >= 3} className="bg-purple-500 text-black px-6 font-bold text-[10px] uppercase tracking-widest hover:bg-purple-400 disabled:bg-white/10 disabled:text-white/30">Send</button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col animate-in slide-in-from-right-10 px-6 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 transparent' }}>
                    <h3 className="text-xl font-black italic text-red-500 uppercase tracking-tighter mb-2 mt-4">Initiate Arrest Protocol</h3>
                    
                    {/* Step 1: Attach Evidence Checkboxes */}
                    <div className="mb-6 mt-4">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">1. Attach Required Evidence</p>
                      {evidenceLog.length === 0 ? (
                        <p className="text-xs text-red-500 font-mono bg-red-500/10 p-3 border border-red-500/30 animate-pulse">
                          [WARNING]: No forensic data extracted. Arrest warrant cannot be issued without evidence.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {evidenceLog.map((ev, idx) => (
                            <label key={idx} className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${activeEvidenceSelections.includes(idx) ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                              <input 
                                type="checkbox" 
                                className="mt-1 accent-purple-500"
                                checked={activeEvidenceSelections.includes(idx)}
                                onChange={(e) => {
                                  if (e.target.checked) setActiveEvidenceSelections(prev => [...prev, idx]);
                                  else setActiveEvidenceSelections(prev => prev.filter(i => i !== idx));
                                }}
                              />
                              <div>
                                <span className="text-[9px] text-purple-500 font-bold block mb-1">[{ev.suspect}]</span>
                                <p className="text-[10px] font-mono text-white/70">{ev.clue}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Step 2: Detective's Logic */}
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">2. Detective's Logic</p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full h-32 bg-white/5 border border-white/10 p-4 text-xs font-typewriter outline-none focus:border-red-500 transition-colors text-white mb-6"
                      placeholder="Explain how the attached evidence proves their guilt..."
                    />

                    {/* Submit Button */}
                    <button
                      disabled={evidenceLog.length > 0 && activeEvidenceSelections.length === 0}
                      onClick={() => {
                        // Package the selected evidence and reasoning together for the backend!
                        const selectedClues = activeEvidenceSelections.map(idx => evidenceLog[idx].clue).join(" | ");
                        const finalPayload = `Attached Evidence: ${selectedClues}\n\nDetective's Logic: ${reason}`;
                        onAccuse(selectedSuspect.name, finalPayload);
                      }}
                      className="w-full py-4 bg-red-600 text-white font-black text-xs tracking-[0.4em] uppercase hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-8"
                    >
                      Submit_Warrant
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
          <div className="w-full max-w-lg bg-black border border-red-500/30 p-10 text-center shadow-[0_0_60px_rgba(239,68,68,0.2)]">


            <div className="mb-8 mt-4">
              <span className="text-red-500 text-xs font-mono tracking-wider animate-pulse">[ Neural Link Stable ]</span>
              <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter mt-2">Abort Mission?</h3>
              <p className="mt-6 text-[12px] text-white/70 font-typewriter uppercase tracking-widest leading-relaxed">Closing this dossier now will result in the <strong className="text-red-500">suspect escaping justice</strong>. The case remains unsolved.</p>
            </div>

            <div className="flex gap-4 px-2 mt-4">
              <button
                onClick={() => setShowAbortConfirm(false)}
                className="flex-1 py-4 px-2 border border-white/10 text-white text-[12px] font-bold uppercase tracking-widest hover:bg-white/10"
              >
                Continue_Investigation
              </button>
              <button
                onClick={onAbort}
                className="flex-1 py-4 px-2 bg-red-600 text-white text-[12px] font-black uppercase tracking-[0.15em] hover:bg-red-500 hover:scale-105 transition-all"
              >
                Abort_Case_Unsolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 3: CRITICAL TIMEOUT MODAL */}
      {timeLeft === 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
          <div className="max-w-xl p-12 border border-red-500/50 text-center bg-red-950/20 shadow-[0_0_100px_rgba(239,68,68,0.2)]">

            <h2 className="text-5xl font-black italic text-red-500 tracking-tighter mb-4 mt-6 animate-pulse">
              LINK_SEVERED
            </h2>

            <p className="text-white/60 font-mono text-xs uppercase tracking-widest leading-relaxed mb-10">
              Investigation time expired. Local authorities have taken over the crime scene. The primary suspect has fled the jurisdiction.
            </p>

            <button
              onClick={onTimeOut}
              className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all"
            >
              [ VIEW_POST_MORTEM ]
            </button>
          </div>
        </div>
      )}
      {/* FEATURE: Precision Extractor Floating Button */}
      {snippetPopup && snippetPopup.show && (
        <button
          // onMouseDown instead of onClick so it fires BEFORE the document mousedown dismisses it
          onMouseDown={(e) => {
            e.stopPropagation();
            setEvidenceLog(prev => [...prev, { suspect: snippetPopup.suspect, clue: snippetPopup.text }]);
            setSnippetPopup(null);
            window.getSelection()?.removeAllRanges(); // Clears the text highlight after saving
          }}
          style={{ top: snippetPopup.y, left: snippetPopup.x, transform: 'translateX(-50%)' }}
          className="fixed z-[120] animate-in zoom-in-75 fade-in duration-200 bg-[#05070a] border border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] text-purple-500 text-[9px] font-black px-4 py-2 uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-black transition-colors"
        >
          [+ Extract_Data ]
        </button>
      )}
    </div>
  );
}