import { Button } from '@/components/ui/button';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, ChevronsDown } from 'lucide-react';

interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  disabled?: boolean;
}

export const GameControls = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  disabled
}: GameControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-1">
        <div />
        <Button
          variant="arcade"
          size="icon"
          onClick={onRotate}
          disabled={disabled}
          className="arcade-button"
        >
          <RotateCw className="w-5 h-5" />
        </Button>
        <div />
        
        <Button
          variant="arcade"
          size="icon"
          onClick={onMoveLeft}
          disabled={disabled}
          className="arcade-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="arcade"
          size="icon"
          onClick={onMoveDown}
          disabled={disabled}
          className="arcade-button"
        >
          <ArrowDown className="w-5 h-5" />
        </Button>
        <Button
          variant="arcade"
          size="icon"
          onClick={onMoveRight}
          disabled={disabled}
          className="arcade-button"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Drop Button */}
      <Button
        variant="arcadeAccent"
        size="lg"
        onClick={onHardDrop}
        disabled={disabled}
        className="arcade-button w-full"
      >
        <ChevronsDown className="w-5 h-5 mr-2" />
        DROP
      </Button>
    </div>
  );
};
