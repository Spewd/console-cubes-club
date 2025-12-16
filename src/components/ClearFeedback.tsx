import { useEffect, useState } from 'react';
import { ClearEvent } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface ClearFeedbackProps {
  clearEvent: ClearEvent | null;
}

export const ClearFeedback = ({ clearEvent }: ClearFeedbackProps) => {
  const [visible, setVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<ClearEvent | null>(null);

  useEffect(() => {
    if (clearEvent) {
      setCurrentEvent(clearEvent);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [clearEvent]);

  if (!visible || !currentEvent) return null;

  const getLabel = () => {
    const labels: string[] = [];
    
    if (currentEvent.isBackToBack) {
      labels.push('BACK-TO-BACK');
    }
    
    if (currentEvent.type === 'tspin') {
      const tspinLabels = ['T-SPIN', 'T-SPIN SINGLE', 'T-SPIN DOUBLE', 'T-SPIN TRIPLE'];
      labels.push(tspinLabels[currentEvent.lines] || 'T-SPIN');
    } else if (currentEvent.type === 'tspin-mini') {
      labels.push('T-SPIN MINI');
    } else if (currentEvent.type === 'perfect') {
      labels.push('PERFECT CLEAR');
    } else if (currentEvent.lines === 4) {
      labels.push('TETRIS');
    } else if (currentEvent.lines === 3) {
      labels.push('TRIPLE');
    } else if (currentEvent.lines === 2) {
      labels.push('DOUBLE');
    } else if (currentEvent.lines === 1) {
      labels.push('SINGLE');
    }
    
    if (currentEvent.combo > 0) {
      labels.push(`${currentEvent.combo} COMBO`);
    }
    
    return labels;
  };

  const labels = getLabel();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div 
        className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
      >
        {labels.map((label, index) => (
          <div
            key={index}
            className={cn(
              "px-3 py-1 text-sm font-bold tracking-wider",
              "bg-card/90 border border-border rounded",
              "animate-fade-in",
              currentEvent.type === 'tspin' && "text-tetris-t",
              currentEvent.type === 'tspin-mini' && "text-tetris-t/80",
              currentEvent.type === 'perfect' && "text-tetris-i",
              currentEvent.lines === 4 && currentEvent.type === 'lines' && "text-tetris-i",
              currentEvent.combo > 2 && index === labels.length - 1 && "text-tetris-o"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {label}
          </div>
        ))}
        <div className="text-xs text-muted-foreground mt-1">
          +{currentEvent.points}
        </div>
      </div>
    </div>
  );
};
