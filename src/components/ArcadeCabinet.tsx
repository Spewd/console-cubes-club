import { ReactNode } from 'react';

interface ArcadeCabinetProps {
  children: ReactNode;
  title?: string;
}

export const ArcadeCabinet = ({ children, title = "TETRIS" }: ArcadeCabinetProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Cabinet Frame */}
      <div className="relative w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="bg-card rounded-lg p-6 border border-border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
