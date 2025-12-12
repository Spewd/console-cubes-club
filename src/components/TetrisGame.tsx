import { useTetris } from '@/hooks/useTetris';
import { TetrisBoard } from './TetrisBoard';
import { NextPiece } from './NextPiece';
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
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
  } = useTetris();

  const { board, currentPiece, nextPiece, score, level, lines, isPlaying, isGameOver, isPaused } = gameState;

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
      {/* Left Panel - Stats */}
      <div className="flex flex-col gap-4 order-2 lg:order-1">
        <div className="border-2 border-secondary p-2">
          <span className="font-arcade text-xs text-secondary neon-glow-purple">{playerName}</span>
        </div>
        <GameStats score={score} level={level} lines={lines} />
        <NextPiece piece={nextPiece} />
      </div>

      {/* Center - Game Board */}
      <div className="order-1 lg:order-2">
        <div className="relative">
          <TetrisBoard board={board} currentPiece={currentPiece} />
          
          {/* Overlay for game states */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-4 z-20">
              <h2 className="font-arcade text-lg text-primary neon-glow">PRESS START</h2>
              <Button variant="neon" size="lg" onClick={startGame} className="arcade-button">
                <Play className="w-5 h-5 mr-2" />
                START GAME
              </Button>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-4 z-20">
              <h2 className="font-arcade text-xl text-accent neon-glow-yellow animate-blink">PAUSED</h2>
              <Button variant="neon" size="lg" onClick={togglePause} className="arcade-button">
                <Play className="w-5 h-5 mr-2" />
                RESUME
              </Button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-4 z-20">
              <h2 className="font-arcade text-xl text-destructive animate-pulse">GAME OVER</h2>
              <p className="font-retro text-2xl text-accent">SCORE: {score}</p>
              <Button variant="neon" size="lg" onClick={startGame} className="arcade-button">
                <RotateCcw className="w-5 h-5 mr-2" />
                PLAY AGAIN
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Controls */}
      <div className="flex flex-col gap-4 order-3">
        <div className="border-2 border-primary p-2">
          <h3 className="font-arcade text-xs text-primary neon-glow mb-2 text-center">CONTROLS</h3>
          <div className="font-retro text-sm text-muted-foreground space-y-1">
            <p>← → : MOVE</p>
            <p>↑ : ROTATE</p>
            <p>↓ : SOFT DROP</p>
            <p>SPACE : HARD DROP</p>
            <p>P : PAUSE</p>
          </div>
        </div>

        {isPlaying && (
          <Button 
            variant="arcadeSecondary" 
            onClick={togglePause}
            className="arcade-button"
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </Button>
        )}

        {/* Mobile Controls */}
        <div className="lg:hidden">
          <GameControls
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onMoveDown={moveDown}
            onRotate={rotate}
            onHardDrop={hardDrop}
            disabled={!isPlaying || isPaused}
          />
        </div>
      </div>
    </div>
  );
};
