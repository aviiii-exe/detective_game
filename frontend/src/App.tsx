import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Selection from './pages/Selection';
import Game from './pages/Game';
import Result from './pages/Result';

// 1. Updated interfaces to match the AI Teammate's new API contract
interface Suspect {
  name: string;
  hover_bio: string;
}

interface CaseData {
  gameId: string;
  theme_name: string;      // ADDED: For dynamic backgrounds & titles
  image_keyword: string;   // ADDED: For dynamic backgrounds & titles
  narration: string;       // Replaced 'story'
  suspects: Suspect[];     // Array of objects instead of strings
  actual_murderer: string; // Replaced 'culprit'
  difficulty_level: string;
  explanation?: string;    // Kept as optional for the Result page
}

type Page = 'HOME' | 'SELECTION' | 'GAME' | 'RESULT';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('HOME');
  const [loading, setLoading] = useState(false);
  const [activeCase, setActiveCase] = useState<CaseData | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 4-Second Auto-Transition from Home to Selection
  useEffect(() => {
    if (currentPage === 'HOME') {
      const timer = setTimeout(() => {
        setCurrentPage('SELECTION');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  // NEW: Dynamic Browser Tab Titles
  useEffect(() => {
    switch (currentPage) {
      case 'HOME':
        document.title = "Initializing... | Forensic OS";
        break;
      case 'SELECTION':
        document.title = "Database | Select Case File";
        break;
      case 'GAME':
        // Bonus: If a case is active, put the case theme in the tab!
        document.title = activeCase ? `[LIVE] ${activeCase.theme_name}` : "Active Investigation";
        break;
      case 'RESULT':
        document.title = "Debrief | Post Mortem";
        break;
      default:
        document.title = "Detective OS";
    }
  }, [currentPage, activeCase]);

  // UPDATED: Now takes both theme and difficulty from the Selection screen
  // Fetching the case through the Node bridge (Port 5000)
  const handleGenerateCase = async (theme: string, difficulty: string, keyword: string, desc: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://nonvegetative-may-untensile.ngrok-free.dev/api/start-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          difficulty: difficulty,
          case_theme: theme,
          case_desc: desc // <--- THIS IS THE MAGIC LINK!
        }),
      });

      if (!response.ok) {
        throw new Error("AI Link Severed: The AI quota might be exceeded.");
      }

      const data = await response.json();
      setActiveCase({
        ...data,
        theme_name: theme,
        image_keyword: keyword,
        difficulty_level: difficulty
      });

      setCurrentPage('GAME');
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Neural Link Failed! Ensure Node (5000) and Python (8000) are running.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Updated to compare against 'actual_murderer'
  const handleAccuse = async (suspectName: string, reason: string) => {
    if (!activeCase) return;
    setLoading(true);
    try {
      // Calling teammate's new /accuse endpoint
      const response = await fetch('https://nonvegetative-may-untensile.ngrok-free.dev/api/accuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          gameId: activeCase.gameId, //
          accused_suspect: suspectName,
          user_reason: reason //
        }),
      });


      const data = await response.json(); // returns { success: boolean, message: string }
      setIsCorrect(data.success);
      setActiveCase({ ...activeCase, explanation: data.message });
      setCurrentPage('RESULT');
    } catch (err) {
      alert("Connection to AI Judge failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbort = () => {
    setActiveCase(null);
    setCurrentPage('SELECTION');
  };

  const handleTimeOut = () => {
    if (!activeCase) return;
    setIsCorrect(false); // Force a failure state
    setActiveCase({
      ...activeCase,
      explanation: "NEURAL LINK TIMEOUT. You took too long to analyze the forensic data. The killer has fled the jurisdiction and the trail has gone permanently cold."
    });
    setCurrentPage('RESULT');
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-purple-50 font-mono flex flex-col overflow-hidden relative">

      <main
        className={`flex-1 relative flex overflow-hidden ${currentPage === 'GAME'
            ? 'flex-col'
            : 'items-center justify-center'
          }`}
      >
        {currentPage === 'HOME' && <Home />}

        {currentPage === 'SELECTION' && (
          <Selection onGenerate={handleGenerateCase} />
        )}

        {currentPage === 'GAME' && activeCase && (
          <Game activeCase={activeCase} onAccuse={handleAccuse} onAbort={handleAbort} onTimeOut={handleTimeOut} />
        )}

        {currentPage === 'RESULT' && activeCase && (
          <Result
            isCorrect={isCorrect}
            // Passing a fallback if explanation isn't in the initial JSON yet
            explanation={activeCase.explanation || `The investigation concluded. The culprit was indeed ${activeCase.actual_murderer}.`}
            onRestart={() => setCurrentPage('HOME')}
          />
        )}
      </main>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-t-2 border-r-2 border-purple-500 rounded-full animate-spin mb-8" />
          <p className="text-[10px] text-purple-500 font-bold tracking-[0.8em] animate-pulse">
            INITIALIZING_INTERROGATION_ENGINE...
          </p>
        </div>
      )}
    </div>
  );
}