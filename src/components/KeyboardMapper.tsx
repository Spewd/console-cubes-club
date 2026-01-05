import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyBindings } from '@/hooks/usePlayerSettings';
import { cn } from '@/lib/utils';

interface KeyboardMapperProps {
  keyBindings: KeyBindings;
  onUpdateBinding: (action: keyof KeyBindings, key: string) => void;
}

const ACTION_LABELS: Record<keyof KeyBindings, string> = {
  moveLeft: 'Move Left',
  moveRight: 'Move Right',
  softDrop: 'Soft Drop',
  hardDrop: 'Hard Drop',
  rotateCW: 'Rotate CW',
  rotateCCW: 'Rotate CCW',
  rotate180: 'Rotate 180°',
  hold: 'Hold',
  pause: 'Pause',
};

const formatKey = (key: string): string => {
  if (key === ' ') return 'Space';
  if (key === 'ArrowUp') return '↑';
  if (key === 'ArrowDown') return '↓';
  if (key === 'ArrowLeft') return '←';
  if (key === 'ArrowRight') return '→';
  if (key.length === 1) return key.toUpperCase();
  return key;
};

export const KeyboardMapper = ({ keyBindings, onUpdateBinding }: KeyboardMapperProps) => {
  const [listeningFor, setListeningFor] = useState<keyof KeyBindings | null>(null);

  const handleKeyCapture = (action: keyof KeyBindings) => {
    setListeningFor(action);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Ignore modifier keys alone
      if (['Control', 'Alt', 'Meta', 'Shift'].includes(e.key)) return;
      
      onUpdateBinding(action, e.key);
      setListeningFor(null);
      window.removeEventListener('keydown', handleKeyDown);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      setListeningFor(null);
      window.removeEventListener('keydown', handleKeyDown);
    }, 5000);
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Key Bindings</Label>
      <p className="text-xs text-muted-foreground mb-4">
        Click a key to rebind it. Press any key to assign.
      </p>
      
      <div className="grid gap-2">
        {(Object.keys(ACTION_LABELS) as (keyof KeyBindings)[]).map((action) => (
          <div 
            key={action} 
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
          >
            <span className="text-sm">{ACTION_LABELS[action]}</span>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "min-w-[80px] font-mono text-sm",
                listeningFor === action && "ring-2 ring-primary animate-pulse"
              )}
              onClick={() => handleKeyCapture(action)}
            >
              {listeningFor === action ? '...' : formatKey(keyBindings[action])}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
