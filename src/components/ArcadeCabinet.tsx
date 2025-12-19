import { ReactNode } from 'react';

interface ArcadeCabinetProps {
  children: ReactNode;
  title?: string;
}

export const ArcadeCabinet = ({ children, title = "TETRIS" }: ArcadeCabinetProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Cabinet Frame */}
      <div className="relative w-full max-w-4xl z-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-accent tracking-tight">
            {title}
          </h1>
          <div className="mt-3 h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
