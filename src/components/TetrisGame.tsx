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

export const TetrisGame = ({ playerName = "PLAYER 1" }: TetrisGameProps) => {
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
        <div className="stats-panel p-2 rounded-sm text-center">
          <span className="font-arcade text-[8px] text-secondary">{playerName}</span>
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
            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-6 z-20 rounded-sm">
              <h2 className="font-arcade text-sm md:text-lg text-primary animate-pulse" style={{ textShadow: 'var(--shadow-neon-cyan)' }}>
                PRESS START
              </h2>
              <Button variant="neon" size="lg" onClick={startGame} className="arcade-button">
                <Play className="w-5 h-5 mr-2" />
                START GAME
              </Button>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-6 z-20 rounded-sm">
              <h2 className="font-arcade text-lg md:text-xl text-accent animate-blink" style={{ textShadow: 'var(--shadow-neon-yellow)' }}>
                PAUSED
              </h2>
              <Button variant="neon" size="lg" onClick={togglePause} className="arcade-button">
                <Play className="w-5 h-5 mr-2" />
                RESUME
              </Button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-6 z-20 rounded-sm">
              <h2 className="font-arcade text-lg md:text-xl text-destructive animate-pulse">GAME OVER</h2>
              <p className="font-arcade text-sm text-accent">{score.toString().padStart(8, '0')}</p>
              <Button variant="neon" size="lg" onClick={startGame} className="arcade-button">
                <RotateCcw className="w-5 h-5 mr-2" />
                PLAY AGAIN
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Next & Controls */}
      <div className="hidden lg:flex flex-col gap-3 w-[130px]">
        <NextPiece piece={nextPiece} />
        
        <div className="stats-panel p-3 rounded-sm">
          <h3 className="font-arcade text-[10px] text-muted-foreground tracking-wider mb-2 text-center">CONTROLS</h3>
          <div className="font-retro text-xs text-muted-foreground space-y-1 text-center">
            <p>← → MOVE</p>
            <p>↑ ROTATE</p>
            <p>↓ DROP</p>
            <p>SPACE SLAM</p>
            <p>C/SHIFT HOLD</p>
            <p>P PAUSE</p>
          </div>
        </div>

        {isPlaying && (
          <Button 
            variant="arcadeSecondary" 
            onClick={togglePause}
            className="arcade-button text-xs"
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? 'RESUME' : 'PAUSE'}
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
