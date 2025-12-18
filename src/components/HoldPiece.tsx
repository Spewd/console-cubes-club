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
      "stats-panel p-4 transition-all duration-200",
      !canHold && "opacity-40 scale-[0.98]"
    )}>
      <h3 className="text-xs text-muted-foreground mb-3 text-center uppercase tracking-wider font-medium">Hold</h3>
      <div className="flex items-center justify-center min-h-[68px]">
        {piece && piece.type ? (
          <div 
            className="grid gap-[2px] animate-scale-in"
            style={{ 
              gridTemplateColumns: `repeat(${piece.shape[0].length}, 14px)`,
            }}
          >
            {piece.shape.flat().map((cell, index) => (
              <div
                key={index}
                className={cn(
                  'w-[14px] h-[14px] rounded-sm transition-colors',
                  cell && piece.type 
                    ? `${BLOCK_COLORS[piece.type]} tetris-block` 
                    : 'bg-transparent'
                )}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground/40 text-xs font-medium">Empty</div>
        )}
      </div>
    </div>
  );
};
