// src/components/DotGrid.tsx
import { useRef, useEffect, useCallback } from 'react';

// 1. Tell TypeScript about our new props
interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  resistance?: number;     // Higher = harder to push dots away
  returnDuration?: number; // Higher = slower spring back to origin
}

export default function DotGrid({
  dotSize = 1.4,
  gap = 30,
  baseColor = 'rgba(255, 255, 255, 0.12)',
  activeColor = 'rgba(168, 85, 247, 0.8)',
  proximity = 140,
  resistance = 650,      // Default value applied
  returnDuration = 1     // Default value applied
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lerpMouseRef = useRef({ x: 0, y: 0 });
  
  // 2. State to track the "home" and "current" position of every dot
  const dotsRef = useRef<{ base_x: number, base_y: number, x: number, y: number }[]>([]);

  // 3. Setup Grid Function (runs on load and resize)
  const setupGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dotsRef.current = [];
    for (let x = gap / 2; x < canvas.width; x += gap) {
      for (let y = gap / 2; y < canvas.height; y += gap) {
        dotsRef.current.push({ base_x: x, base_y: y, x: x, y: y });
      }
    }
  }, [gap]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Smooth mouse movement
    lerpMouseRef.current.x += (mouseRef.current.x - lerpMouseRef.current.x) * 0.12;
    lerpMouseRef.current.y += (mouseRef.current.y - lerpMouseRef.current.y) * 0.12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 4. THE PHYSICS ENGINE
    dotsRef.current.forEach(dot => {
      // Find distance between dot and mouse
      const dx = lerpMouseRef.current.x - dot.x;
      const dy = lerpMouseRef.current.y - dot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // A. The Push (Resistance)
      if (distance < proximity) {
        const force = (proximity - distance) / proximity;
        // The higher the resistance, the smaller the push factor
        const pushFactor = (force * 1000) / resistance; 
        
        dot.x -= (dx / distance) * pushFactor;
        dot.y -= (dy / distance) * pushFactor;
      }

      // B. The Spring Back (Return Duration)
      // Dots naturally want to return to their base_x/base_y
      const smoothReturn = Math.max(1, returnDuration); 
      dot.x += (dot.base_x - dot.x) / (smoothReturn * 10);
      dot.y += (dot.base_y - dot.y) / (smoothReturn * 10);

      // C. Draw the dot at its new physical location
      ctx.beginPath();
      if (distance < proximity) {
        const ratio = 1 - distance / proximity;
        ctx.fillStyle = activeColor;
        ctx.arc(dot.x, dot.y, dotSize + ratio * 3.5, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = baseColor;
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }, [dotSize, baseColor, activeColor, proximity, resistance, returnDuration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setupGrid(); // Rebuild the dots when window changes
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize(); // Initialize

    const animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [draw, setupGrid]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}