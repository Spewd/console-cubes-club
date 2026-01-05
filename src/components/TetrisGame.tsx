import { useEffect, useRef } from 'react';
import { useTetris } from '@/hooks/useTetris';
import { usePlayerSettings } from '@/hooks/usePlayerSettings';
import { useInputHandler } from '@/hooks/useInputHandler';
import { TetrisBoard } from './TetrisBoard';
import { NextPiece } from './NextPiece';
import { HoldPiece } from './HoldPiece';
import { GameStats } from './GameStats';
import { GameControls } from './GameControls';
import { ClearFeedback } from './ClearFeedback';
import { LineClearParticles } from './LineClearParticles';
import { PlayerSettingsDialog } from './PlayerSettings';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Keyboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TetrisGameProps {
  playerName?: string;
  onGameOver?: (score: number, level: number, lines: number) => void;
}

export const TetrisGame = ({ playerName = "Player 1", onGameOver }: TetrisGameProps) => {
  const {
    gameState,
    ghostPosition,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    softDrop,
    rotate,
    rotateCCW,
    hardDrop,
    holdPiece,
  } = useTetris();
  
  const { settings, updateSetting, updateKeyBinding, resetToDefaults, applyPreset } = usePlayerSettings();
  const { user, saveHighScore } = useAuth();
  const { toast } = useToast();
  const hasSubmittedScore = useRef(false);

  const { board, currentPiece, nextPiece, holdPiece: heldPiece, canHold, score, level, lines, isPlaying, isGameOver, isPaused, clearEvent } = gameState;

  // Use the input handler with player settings
  useInputHandler({
    settings,
    isPlaying,
    isPaused,
    onMoveLeft: moveLeft,
    onMoveRight: moveRight,
    onSoftDrop: softDrop,
    onHardDrop: hardDrop,
    onRotateCW: rotate,
    onRotateCCW: rotateCCW,
    onHold: holdPiece,
    onPause: togglePause,
  });

  // Save score when game ends
  useEffect(() => {
    if (isGameOver && !hasSubmittedScore.current && score > 0) {
      hasSubmittedScore.current = true;
      
      if (user) {
        saveHighScore(score, level, lines).then(({ error }) => {
          if (error) {
            console.error('Failed to save score:', error);
          } else {
            toast({
              title: "Score Saved!",
              description: `Your score of ${score.toLocaleString()} has been saved to the leaderboard.`,
            });
          }
        });
      }
      
      onGameOver?.(score, level, lines);
    }
  }, [isGameOver, score, level, lines, user, saveHighScore, onGameOver, toast]);

  // Reset submitted flag when starting a new game
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      hasSubmittedScore.current = false;
    }
  }, [isPlaying, isGameOver]);

  // Format key for display
  const formatKey = (key: string): string => {
    if (key === ' ') return 'Space';
    if (key === 'ArrowUp') return '↑';
    if (key === 'ArrowDown') return '↓';
    if (key === 'ArrowLeft') return '←';
    if (key === 'ArrowRight') return '→';
    if (key.length === 1) return key.toUpperCase();
    return key;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start justify-center p-2 md:p-4">
      {/* Left Panel - Hold & Stats */}
      <div className="hidden lg:flex flex-col gap-4 w-[160px]">
        <div className="stats-panel p-3 text-center flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{playerName}</span>
          <PlayerSettingsDialog
            settings={settings}
            updateSetting={updateSetting}
            updateKeyBinding={updateKeyBinding}
            resetToDefaults={resetToDefaults}
            applyPreset={applyPreset}
          />
        </div>
        <HoldPiece piece={heldPiece} canHold={canHold} />
        <GameStats score={score} level={level} lines={lines} />
      </div>

      {/* Center - Game Board */}
      <div className="flex-shrink-0">
        <div className="relative group">
          {/* Glow effect behind board */}
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative">
            <TetrisBoard board={board} currentPiece={currentPiece} ghostPosition={ghostPosition} clearEvent={clearEvent} />
            <LineClearParticles clearEvent={clearEvent} />
            <ClearFeedback clearEvent={clearEvent} />
            
            {/* Overlay for game states */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 glass flex flex-col items-center justify-center gap-8 z-20 rounded-2xl animate-fade-in">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                    Ready?
                  </h2>
                  <p className="text-sm text-muted-foreground">Press start to begin your game</p>
                </div>
                <Button variant="default" size="lg" onClick={startGame} className="px-10 h-14">
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            )}

            {isPaused && (
              <div className="absolute inset-0 glass flex flex-col items-center justify-center gap-8 z-20 rounded-2xl animate-fade-in">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-chart-4/10 flex items-center justify-center mb-4">
                    <Pause className="w-8 h-8 text-chart-4" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                    Paused
                  </h2>
                  <p className="text-sm text-muted-foreground">Take your time</p>
                </div>
                <Button variant="default" size="lg" onClick={togglePause} className="px-10 h-14">
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
              </div>
            )}

            {isGameOver && (
              <div className="absolute inset-0 glass flex flex-col items-center justify-center gap-6 z-20 rounded-2xl animate-fade-in">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-extrabold text-destructive tracking-tight">Game Over</h2>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Final Score</p>
                    <p className="text-5xl font-extrabold text-gradient-accent tabular-nums">{score.toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="default" size="lg" onClick={startGame} className="px-10 h-14">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Next & Controls */}
      <div className="hidden lg:flex flex-col gap-4 w-[160px]">
        <NextPiece piece={nextPiece} />
        
        <div className="stats-panel p-4">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">Controls</h3>
          </div>
          <div className="text-xs text-muted-foreground space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">
                {formatKey(settings.keyBindings.moveLeft)} {formatKey(settings.keyBindings.moveRight)}
              </span>
              <span>Move</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">
                {formatKey(settings.keyBindings.rotateCW)}
              </span>
              <span>Rotate</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">
                {formatKey(settings.keyBindings.rotateCCW)}
              </span>
              <span>Rotate CCW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">
                {formatKey(settings.keyBindings.softDrop)}
              </span>
              <span>Soft Drop</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">
                {formatKey(settings.keyBindings.hardDrop)}
              </span>
              <span>Hard Drop</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">
                {formatKey(settings.keyBindings.hold)}
              </span>
              <span>Hold</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">
                {formatKey(settings.keyBindings.pause)}
              </span>
              <span>Pause</span>
            </div>
          </div>
        </div>

        {isPlaying && (
          <Button 
            variant="outline" 
            onClick={togglePause}
            className="w-full"
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
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <GameStats score={score} level={level} lines={lines} />
          </div>
          <PlayerSettingsDialog
            settings={settings}
            updateSetting={updateSetting}
            updateKeyBinding={updateKeyBinding}
            resetToDefaults={resetToDefaults}
            applyPreset={applyPreset}
          />
        </div>
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
