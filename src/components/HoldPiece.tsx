import { Piece, TetrisBlock } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface HoldPieceProps {
  piece: Piece | null;
  canHold: boolean;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i',
  O: 'bg-tetris-o',
  T: 'bg-tetris-t',
  S: 'bg-tetris-s',
  Z: 'bg-tetris-z',
  J: 'bg-tetris-j',
  L: 'bg-tetris-l',
  G: 'bg-muted-foreground/60',
};

export const HoldPiece = ({ piece, canHold }: HoldPieceProps) => {
  return (
    <div className={cn(
      "stats-panel p-3 transition-opacity",
      !canHold && "opacity-50"
    )}>
      <h3 className="text-xs text-muted-foreground mb-3 text-center">Hold</h3>
      <div className="flex items-center justify-center min-h-[64px]">
        {piece && piece.type ? (
          <div 
            className="grid gap-[2px]"
            style={{ 
              gridTemplateColumns: `repeat(${piece.shape[0].length}, 14px)`,
            }}
          >
            {piece.shape.flat().map((cell, index) => (
              <div
                key={index}
                className={cn(
                  'w-[14px] h-[14px] rounded-sm',
                  cell && piece.type 
                    ? `${BLOCK_COLORS[piece.type]} tetris-block` 
                    : 'bg-transparent'
                )}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground/50 text-xs">Empty</div>
        )}
      </div>
    </div>
  );
};
