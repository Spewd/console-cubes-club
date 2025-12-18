import { useTetris } from '@/hooks/useTetris';
import { TetrisBoard } from './TetrisBoard';
import { NextPiece } from './NextPiece';
import { HoldPiece } from './HoldPiece';
import { GameStats } from './GameStats';
import { GameControls } from './GameControls';
import { ClearFeedback } from './ClearFeedback';
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

  const { board, currentPiece, nextPiece, holdPiece: heldPiece, canHold, score, level, lines, isPlaying, isGameOver, isPaused, clearEvent } = gameState;

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-center lg:items-start justify-center p-4">
      {/* Left Panel - Hold & Stats */}
      <div className="hidden lg:flex flex-col gap-4 w-[140px]">
        <div className="stats-panel p-3 text-center backdrop-blur-sm">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{playerName}</span>
        </div>
        <HoldPiece piece={heldPiece} canHold={canHold} />
        <GameStats score={score} level={level} lines={lines} />
      </div>

      {/* Center - Game Board */}
      <div className="flex-shrink-0">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-border/50 to-transparent rounded-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          <div className="relative">
            <TetrisBoard board={board} currentPiece={currentPiece} ghostPosition={ghostPosition} />
            <ClearFeedback clearEvent={clearEvent} />
            
            {/* Overlay for game states */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 bg-background/98 backdrop-blur-sm flex flex-col items-center justify-center gap-8 z-20 rounded-lg animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                    Ready?
                  </h2>
                  <p className="text-sm text-muted-foreground">Press start to begin</p>
                </div>
                <Button variant="default" size="lg" onClick={startGame} className="px-8 hover-scale">
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            )}

            {isPaused && (
              <div className="absolute inset-0 bg-background/98 backdrop-blur-sm flex flex-col items-center justify-center gap-8 z-20 rounded-lg animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                    Paused
                  </h2>
                  <p className="text-sm text-muted-foreground">Take your time</p>
                </div>
                <Button variant="default" size="lg" onClick={togglePause} className="px-8 hover-scale">
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
              </div>
            )}

            {isGameOver && (
              <div className="absolute inset-0 bg-background/98 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20 rounded-lg animate-fade-in">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-semibold text-destructive tracking-tight">Game Over</h2>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Final Score</p>
                    <p className="text-3xl font-bold text-foreground">{score.toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="default" size="lg" onClick={startGame} className="px-8 hover-scale">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Next & Controls */}
      <div className="hidden lg:flex flex-col gap-4 w-[140px]">
        <NextPiece piece={nextPiece} />
        
        <div className="stats-panel p-4">
          <h3 className="text-xs text-muted-foreground tracking-wider mb-3 text-center uppercase font-medium">Controls</h3>
          <div className="text-xs text-muted-foreground/80 space-y-2 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-foreground/70">← →</span>
              <span>Move</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/70">↑</span>
              <span>Rotate</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/70">↓</span>
              <span>Soft Drop</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/70">Space</span>
              <span>Hard Drop</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/70">C</span>
              <span>Hold</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/70">P</span>
              <span>Pause</span>
            </div>
          </div>
        </div>

        {isPlaying && (
          <Button 
            variant="outline" 
            onClick={togglePause}
            className="text-xs w-full hover-scale"
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        )}
      </div>

      {/* Mobile Stats & Controls */}
      <div className="lg:hidden w-full max-w-xs space-y-4">
        <div className="flex gap-4">
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
