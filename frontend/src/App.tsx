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

  // Fetching the case through the Node bridge (Port 5000)
  // UPDATED: Now takes both theme and difficulty from the Selection screen
  const handleGenerateCase = async (theme: string, difficulty: string, keyword: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/start-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: difficulty,
          case_theme: theme
        }),
      });

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
    const response = await fetch('http://127.0.0.1:5001/api/accuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId: activeCase.gameId, //
        accused_suspect: suspectName,
        user_reason: reason //
      }),
    });

    if (!response.ok) {
        throw new Error("AI Link Severed: The AI quota might be exceeded.");
    }

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

  return (
    <div className="min-h-screen bg-[#05070a] text-cyan-50 font-mono flex flex-col overflow-hidden relative">

      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        {currentPage === 'HOME' && <Home />}

        {currentPage === 'SELECTION' && (
          <Selection onGenerate={handleGenerateCase} />
        )}

        {currentPage === 'GAME' && activeCase && (
          <Game activeCase={activeCase} onAccuse={handleAccuse} onAbort={handleAbort} />
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
          <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-500 rounded-full animate-spin mb-8" />
          <p className="text-[10px] text-cyan-500 font-bold tracking-[0.8em] animate-pulse">
            INITIALIZING_INTERROGATION_ENGINE...
          </p>
        </div>
      )}
    </div>
  );
}