import { useState } from 'react';
import { Typewriter } from '../components/Typewriter';

// Updated interfaces to match your teammate's Interrogation Engine JSON
interface Suspect {
  name: string;
  hover_bio: string;
}

interface CaseData {
  narration: string;
  suspects: Suspect[];
  actual_murderer: string;
}

interface GameProps {
  activeCase: CaseData;
  onAccuse: (suspectName: string) => void;
}

export default function Game({ activeCase, onAccuse }: GameProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  
  // This will store the conversation history with suspects
  const [chatLog, setChatLog] = useState<{sender: string, text: string}[]>([
    { sender: 'SYSTEM', text: 'Neural link established. Interrogation protocols online.' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSuspect) return;
    
    // Add user message to log
    setChatLog([...chatLog, { sender: 'YOU', text: chatInput }]);
    
    // TODO: Connect this to your teammate's /api/chat-case endpoint
    console.log(`Sending to ${selectedSuspect}: ${chatInput}`);
    setChatInput('');
  };

  return (
    <div className="flex-1 grid grid-cols-12 gap-6 p-10 z-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      
      {/* LEFT: The Investigation Narrative */}
      <div className="col-span-7 bg-white/[0.02] border border-white/5 p-10 flex flex-col relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 text-[9px] text-cyan-500/30 uppercase tracking-[0.3em]">Live_Narration</div>
        <h3 className="text-[10px] text-cyan-500 tracking-[0.4em] mb-8 uppercase italic border-b border-cyan-900/30 pb-4 inline-block">
          // INCIDENT_FILE_DECRYPTED
        </h3>
        <div className="text-2xl italic leading-relaxed text-slate-200 overflow-y-auto pr-6 scrollbar-hide">
          {/* Using teammate's 'narration' key */}
          <Typewriter text={activeCase.narration} delay={20} />
        </div>
      </div>

      {/* RIGHT: Interrogation & Suspect Profiles */}
      <div className="col-span-5 flex flex-col gap-6">
        
        {/* Interrogation Terminal (The Chat Interface) */}
        <div className="flex-1 bg-black/40 border border-cyan-900/20 flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-cyan-900/20 bg-cyan-950/10 flex justify-between items-center">
            <h4 className="text-[10px] text-cyan-500 tracking-[0.4em] uppercase">Interrogation_Terminal</h4>
            {selectedSuspect && (
              <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded tracking-widest animate-pulse">
                TARGET: {selectedSuspect}
              </span>
            )}
          </div>

          {/* Chat History */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono scrollbar-hide">
            {chatLog.map((log, i) => (
              <div key={i} className={`text-[11px] ${log.sender === 'YOU' ? 'text-cyan-400 pl-4 border-l border-cyan-500/30' : 'text-slate-500'}`}>
                <span className="font-bold opacity-50">[{log.sender}]: </span>
                <span className="italic">{log.text}</span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-cyan-900/20 bg-cyan-950/5">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!selectedSuspect}
              placeholder={selectedSuspect ? `Ask ${selectedSuspect} something...` : "Select a suspect to interrogate"}
              className="w-full bg-transparent border-none text-xs text-cyan-100 placeholder:text-cyan-900 focus:ring-0 italic"
            />
          </form>
        </div>

        {/* Suspect Identification Grid */}
        <div className="p-8 border border-cyan-500/20 bg-cyan-950/20 shadow-xl">
          <h4 className="text-[10px] text-cyan-500 tracking-[0.4em] uppercase mb-6 text-center border-b border-cyan-900/30 pb-4">
            Subject_Database
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {/* Using teammate's object-based suspects array */}
            {activeCase.suspects.map((suspect) => (
              <button 
                key={suspect.name}
                onClick={() => setSelectedSuspect(suspect.name)}
                title={suspect.hover_bio} // Teammate's bio appears on mouse hover
                className={`py-4 text-[10px] font-bold border transition-all tracking-widest uppercase relative group ${
                  selectedSuspect === suspect.name 
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'border-cyan-900/50 text-cyan-600 hover:border-cyan-400 hover:text-cyan-400'
                }`}
              >
                {suspect.name}
                {/* Visual tooltip indicator */}
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Verdict Submission */}
          {selectedSuspect && (
            <button 
              onClick={() => onAccuse(selectedSuspect)}
              className="w-full mt-6 py-5 bg-white text-black font-black text-[10px] tracking-[0.5em] hover:bg-cyan-400 hover:text-white transition-all uppercase shadow-2xl"
            >
              FINALIZE_ACCUSATION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}