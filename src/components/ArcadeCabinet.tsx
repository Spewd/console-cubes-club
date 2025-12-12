import { ReactNode } from 'react';

interface ArcadeCabinetProps {
  children: ReactNode;
  title?: string;
}

export const ArcadeCabinet = ({ children, title = "TETRIS" }: ArcadeCabinetProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background via-background to-muted/20">
      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-secondary/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-accent/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* Cabinet Frame */}
      <div className="relative w-full max-w-4xl z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 
            className="font-arcade text-3xl md:text-5xl text-primary animate-pulse-neon tracking-wider"
            style={{ textShadow: 'var(--shadow-neon-cyan)' }}
          >
            {title}
          </h1>
          <p 
            className="font-arcade text-xs text-secondary/80 mt-2 tracking-widest"
            style={{ textShadow: 'var(--shadow-neon-purple)' }}
          >
            EFFECT EDITION
          </p>
        </div>

        {/* Main Content */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-lg" />
          
          {/* Content container */}
          <div className="relative bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
            {children}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="flex justify-center mt-6 gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="font-arcade text-[8px] text-muted-foreground">P1</span>
          </div>
          <div className="text-center">
            <span className="font-arcade text-[8px] text-muted-foreground/50">INSERT COIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-arcade text-[8px] text-muted-foreground">P2</span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
