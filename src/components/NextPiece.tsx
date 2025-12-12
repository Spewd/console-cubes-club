import { Piece, TetrisBlock } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface NextPieceProps {
  piece: Piece;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i',
  O: 'bg-tetris-o',
  T: 'bg-tetris-t',
  S: 'bg-tetris-s',
  Z: 'bg-tetris-z',
  J: 'bg-tetris-j',
  L: 'bg-tetris-l',
};

export const NextPiece = ({ piece }: NextPieceProps) => {
  const { shape, type } = piece;
  const maxSize = 4;

  return (
    <div className="border-2 border-primary p-3">
      <h3 className="font-arcade text-xs text-primary neon-glow mb-2 text-center">NEXT</h3>
      <div className="flex items-center justify-center">
        <div 
          className="grid gap-px"
          style={{ 
            gridTemplateColumns: `repeat(${shape[0].length}, 16px)`,
          }}
        >
          {shape.flat().map((cell, index) => (
            <div
              key={index}
              className={cn(
                'w-4 h-4',
                cell && type ? `${BLOCK_COLORS[type]} tetris-block` : 'bg-transparent'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
