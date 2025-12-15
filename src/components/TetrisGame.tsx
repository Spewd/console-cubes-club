import { useTetris } from '@/hooks/useTetris';
import { TetrisBoard } from './TetrisBoard';
import { NextPiece } from './NextPiece';
import { HoldPiece } from './HoldPiece';
import { GameStats } from './GameStats';
import { GameControls } from './GameControls';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TetrisGameProps {
  playerName?: string;
}

export const TetrisGame = ({ playerName = "Player 1" }: TetrisGameProps) => {
  const {
    gameState,
    ghostPosition,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    holdPiece,
  } = useTetris();

  const { board, currentPiece, nextPiece, holdPiece: heldPiece, canHold, score, level, lines, isPlaying, isGameOver, isPaused } = gameState;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center lg:items-start justify-center">
      {/* Left Panel - Hold & Stats */}
      <div className="hidden lg:flex flex-col gap-3 w-[130px]">
        <div className="stats-panel p-2 text-center">
          <span className="text-xs text-muted-foreground">{playerName}</span>
        </div>
        <HoldPiece piece={heldPiece} canHold={canHold} />
        <GameStats score={score} level={level} lines={lines} />
      </div>

      {/* Center - Game Board */}
      <div className="flex-shrink-0">
        <div className="relative">
          <TetrisBoard board={board} currentPiece={currentPiece} ghostPosition={ghostPosition} />
          
          {/* Overlay for game states */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-6 z-20 rounded-lg">
              <h2 className="text-lg font-medium text-foreground">
                Press Start
              </h2>
              <Button variant="default" size="lg" onClick={startGame}>
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-6 z-20 rounded-lg">
              <h2 className="text-xl font-medium text-foreground">
                Paused
              </h2>
              <Button variant="default" size="lg" onClick={togglePause}>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-6 z-20 rounded-lg">
              <h2 className="text-xl font-medium text-destructive">Game Over</h2>
              <p className="text-lg text-muted-foreground">{score.toLocaleString()}</p>
              <Button variant="default" size="lg" onClick={startGame}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Next & Controls */}
      <div className="hidden lg:flex flex-col gap-3 w-[130px]">
        <NextPiece piece={nextPiece} />
        
        <div className="stats-panel p-3">
          <h3 className="text-xs text-muted-foreground tracking-wider mb-2 text-center">Controls</h3>
          <div className="text-xs text-muted-foreground space-y-1 text-center">
            <p>← → Move</p>
            <p>↑ Rotate</p>
            <p>↓ Drop</p>
            <p>Space Slam</p>
            <p>C/Shift Hold</p>
            <p>P Pause</p>
          </div>
        </div>

        {isPlaying && (
          <Button 
            variant="outline" 
            onClick={togglePause}
            className="text-xs"
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        )}
      </div>

      {/* Mobile Stats & Controls */}
      <div className="lg:hidden w-full max-w-xs space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <HoldPiece piece={heldPiece} canHold={canHold} />
          </div>
          <div className="flex-1">
            <NextPiece piece={nextPiece} />
          </div>
        </div>
        <GameStats score={score} level={level} lines={lines} />
        <GameControls
          onMoveLeft={moveLeft}
          onMoveRight={moveRight}
          onMoveDown={moveDown}
          onRotate={rotate}
          onHardDrop={hardDrop}
          onHold={holdPiece}
          disabled={!isPlaying || isPaused}
        />
      </div>
    </div>
  );
};
