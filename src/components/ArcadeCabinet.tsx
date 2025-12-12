import { ReactNode } from 'react';

interface ArcadeCabinetProps {
  children: ReactNode;
  title?: string;
}

export const ArcadeCabinet = ({ children, title = "TETRIS" }: ArcadeCabinetProps) => {
  return (
    <div className="arcade-cabinet min-h-screen flex flex-col items-center justify-center p-4">
      {/* Cabinet Frame */}
      <div className="relative w-full max-w-4xl">
        {/* Marquee */}
        <div className="bg-card border-4 border-primary p-4 mb-2">
          <h1 className="font-arcade text-2xl md:text-4xl text-center text-primary neon-glow animate-pulse-neon">
            {title}
          </h1>
          <p className="font-retro text-lg text-center text-secondary neon-glow-purple mt-1">
            ARCADE EDITION
          </p>
        </div>

        {/* Screen Bezel */}
        <div className="bg-card border-4 border-primary p-4 pixel-border">
          {children}
        </div>

        {/* Control Panel Decoration */}
        <div className="bg-muted border-4 border-primary mt-2 p-2">
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="font-arcade text-[8px] text-muted-foreground">P1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="font-arcade text-[8px] text-muted-foreground">P2</span>
            </div>
          </div>
        </div>

        {/* Coin Slot */}
        <div className="flex justify-center mt-4">
          <div className="bg-accent/20 border-2 border-accent px-4 py-1">
            <span className="font-arcade text-[10px] text-accent">INSERT COIN</span>
          </div>
        </div>
      </div>
    </div>
  );
};
