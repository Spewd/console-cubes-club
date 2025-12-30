import { useState, useEffect, useCallback } from 'react';
import { ClearEvent, BOARD_WIDTH } from '@/hooks/useTetris';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface LineClearParticlesProps {
  clearEvent: ClearEvent | null;
  boardRef?: React.RefObject<HTMLDivElement>;
}

const PARTICLE_COLORS = [
  'hsl(185 90% 55%)',  // cyan
  'hsl(280 85% 60%)',  // purple
  'hsl(45 95% 55%)',   // yellow
  'hsl(145 80% 50%)',  // green
  'hsl(0 85% 55%)',    // red
  'hsl(220 90% 55%)',  // blue
  'hsl(25 95% 55%)',   // orange
];

export const LineClearParticles = ({ clearEvent }: LineClearParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = useCallback((rowIndices: number[]) => {
    const newParticles: Particle[] = [];
    const particlesPerRow = 20;
    const cellWidth = 26;
    const cellHeight = 26;
    
    rowIndices.forEach((rowIndex) => {
      const baseY = rowIndex * cellHeight + cellHeight / 2;
      
      for (let i = 0; i < particlesPerRow; i++) {
        const baseX = (i / particlesPerRow) * (BOARD_WIDTH * cellWidth);
        const angle = (Math.random() - 0.5) * Math.PI;
        const speed = 2 + Math.random() * 4;
        
        newParticles.push({
          id: Date.now() + Math.random(),
          x: baseX + Math.random() * cellWidth,
          y: baseY,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
          vy: -Math.abs(Math.sin(angle) * speed) - Math.random() * 2,
          size: 3 + Math.random() * 5,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          life: 1,
          maxLife: 0.8 + Math.random() * 0.4,
        });
      }
    });
    
    return newParticles;
  }, []);

  useEffect(() => {
    if (clearEvent && clearEvent.clearedRowIndices.length > 0) {
      const newParticles = createParticles(clearEvent.clearedRowIndices);
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [clearEvent, createParticles]);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0);
        
        return updated;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            transform: `scale(${particle.life})`,
          }}
        />
      ))}
    </div>
  );
};
