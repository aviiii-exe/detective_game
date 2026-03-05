import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
}

export const Typewriter = ({ text, delay = 25 }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span className="leading-relaxed">{displayedText}</span>;
};