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
    <div className="flex flex-col items-center gap-4 p-4">
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-1">
        <div />
        <Button
          variant="secondary"
          size="icon"
          onClick={onRotate}
          disabled={disabled}
        >
          <RotateCw className="w-5 h-5" />
        </Button>
        <div />
        
        <Button
          variant="secondary"
          size="icon"
          onClick={onMoveLeft}
          disabled={disabled}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onMoveDown}
          disabled={disabled}
        >
          <ArrowDown className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onMoveRight}
          disabled={disabled}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        {onHold && (
          <Button
            variant="outline"
            size="lg"
            onClick={onHold}
            disabled={disabled}
            className="flex-1"
          >
            <Archive className="w-5 h-5 mr-1" />
            Hold
          </Button>
        )}
        <Button
          variant="default"
          size="lg"
          onClick={onHardDrop}
          disabled={disabled}
          className="flex-1"
        >
          <ChevronsDown className="w-5 h-5 mr-1" />
          Drop
        </Button>
      </div>
    </div>
  );
};
