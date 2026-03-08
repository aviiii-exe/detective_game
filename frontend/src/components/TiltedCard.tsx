// src/components/TiltedCard.tsx
import { useRef, useState } from 'react';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  rotateAmplitude?: number; // How extreme the tilt gets
  scaleOnHover?: number;    // How much it pops out
}

export default function TiltedCard({ 
  children, 
  className = "",
  rotateAmplitude = 12,
  scaleOnHover = 1.05
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)' });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate cursor position relative to the center of the card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert coordinates to rotation degrees
    const rotateY = ((mouseX / width) - 0.5) * (rotateAmplitude * 2); 
    const rotateX = ((mouseY / height) - 0.5) * -(rotateAmplitude * 2);

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scaleOnHover})`
    });
  };

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    // Snap back to 0 perfectly flat
    setStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)' });
  };

  return (
    <div className={className} style={{ perspective: '1000px' }}>
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...style,
          // Fast tracking while hovering, slow smooth spring-back on leave!
          transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}