import { useRef, useEffect, useCallback } from 'react';

export default function DotGrid({
  dotSize = 1.4,
  gap = 30,
  baseColor = 'rgba(255, 255, 255, 0.12)', // Slightly brighter base
  activeColor = 'rgba(34, 211, 238, 0.8)',
  proximity = 140,
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lerpMouseRef = useRef({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluidity lerp
    lerpMouseRef.current.x += (mouseRef.current.x - lerpMouseRef.current.x) * 0.12;
    lerpMouseRef.current.y += (mouseRef.current.y - lerpMouseRef.current.y) * 0.12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = gap / 2; x < canvas.width; x += gap) {
      for (let y = gap / 2; y < canvas.height; y += gap) {
        const dx = lerpMouseRef.current.x - x;
        const dy = lerpMouseRef.current.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        ctx.beginPath();
        if (distance < proximity) {
          const ratio = 1 - distance / proximity;
          ctx.fillStyle = activeColor;
          ctx.arc(x, y, dotSize + ratio * 3.5, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = baseColor;
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }, [gap, dotSize, baseColor, activeColor, proximity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by the parent container if necessary
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    const animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [draw]);

  return (
    <canvas 
      ref={canvasRef} 
      // Changed to absolute and Z-0 to sit on top of the bg but below content
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}