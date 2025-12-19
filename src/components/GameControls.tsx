import { Button } from '@/components/ui/button';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, Archive } from 'lucide-react';

interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onHold?: () => void;
  disabled?: boolean;
}

export const GameControls = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onHold,
  disabled
}: GameControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-2">
        <div />
        <Button
          variant="glass"
          size="icon"
          onClick={onRotate}
          disabled={disabled}
          className="h-14 w-14 rounded-2xl"
        >
          <RotateCw className="w-6 h-6" />
        </Button>
        <div />
        
        <Button
          variant="glass"
          size="icon"
          onClick={onMoveLeft}
          disabled={disabled}
          className="h-14 w-14 rounded-2xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={onMoveDown}
          disabled={disabled}
          className="h-14 w-14 rounded-2xl"
        >
          <ArrowDown className="w-6 h-6" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={onMoveRight}
          disabled={disabled}
          className="h-14 w-14 rounded-2xl"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        {onHold && (
          <Button
            variant="outline"
            size="lg"
            onClick={onHold}
            disabled={disabled}
            className="flex-1 h-14"
          >
            <Archive className="w-5 h-5 mr-2" />
            Hold
          </Button>
        )}
        <Button
          variant="default"
          size="lg"
          onClick={onHardDrop}
          disabled={disabled}
          className="flex-1 h-14"
        >
          <ChevronsDown className="w-5 h-5 mr-2" />
          Drop
        </Button>
      </div>
    </div>
  );
};
