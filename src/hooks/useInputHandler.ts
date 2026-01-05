import { useEffect, useRef, useCallback } from 'react';
import { PlayerSettings, KeyBindings } from './usePlayerSettings';

interface InputHandlerProps {
  settings: PlayerSettings;
  isPlaying: boolean;
  isPaused: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onRotate180: () => void;
  onHold: () => void;
  onPause: () => void;
}

export const useInputHandler = ({
  settings,
  isPlaying,
  isPaused,
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onRotate180,
  onHold,
  onPause,
}: InputHandlerProps) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const dasTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrTimerRef = useRef<NodeJS.Timeout | null>(null);
  const softDropTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDirectionRef = useRef<'left' | 'right' | null>(null);
  const dasChargedRef = useRef(false);

  const { das, arr, dcd, sdf, keyBindings, primaryRotation } = settings;

  const clearTimers = useCallback(() => {
    if (dasTimerRef.current) {
      clearTimeout(dasTimerRef.current);
      dasTimerRef.current = null;
    }
    if (arrTimerRef.current) {
      clearInterval(arrTimerRef.current);
      arrTimerRef.current = null;
    }
    if (softDropTimerRef.current) {
      clearInterval(softDropTimerRef.current);
      softDropTimerRef.current = null;
    }
    dasChargedRef.current = false;
  }, []);

  const startARR = useCallback((moveFunc: () => void) => {
    if (arrTimerRef.current) clearInterval(arrTimerRef.current);
    
    if (arr === 0) {
      // Instant movement - move as fast as possible
      arrTimerRef.current = setInterval(() => {
        moveFunc();
      }, 1);
    } else {
      arrTimerRef.current = setInterval(() => {
        moveFunc();
      }, arr);
    }
  }, [arr]);

  const startDAS = useCallback((direction: 'left' | 'right', moveFunc: () => void) => {
    // If switching directions, apply DCD
    const delay = currentDirectionRef.current && currentDirectionRef.current !== direction ? dcd : 0;
    
    currentDirectionRef.current = direction;
    dasChargedRef.current = false;
    
    // Clear existing timers
    if (dasTimerRef.current) clearTimeout(dasTimerRef.current);
    if (arrTimerRef.current) clearInterval(arrTimerRef.current);
    
    // Immediate first move
    moveFunc();
    
    // Start DAS timer (with optional DCD)
    dasTimerRef.current = setTimeout(() => {
      dasChargedRef.current = true;
      startARR(moveFunc);
    }, das + delay);
  }, [das, dcd, startARR]);

  const startSoftDrop = useCallback(() => {
    if (softDropTimerRef.current) clearInterval(softDropTimerRef.current);
    
    if (sdf === 'instant') {
      // Do nothing - let the game's normal drop handle it, 
      // but we'll call soft drop rapidly
      softDropTimerRef.current = setInterval(() => {
        onSoftDrop();
      }, 1);
    } else {
      // SDF is a multiplier - higher = faster
      const interval = Math.max(1, Math.floor(50 / sdf));
      softDropTimerRef.current = setInterval(() => {
        onSoftDrop();
      }, interval);
    }
    
    // First immediate drop
    onSoftDrop();
  }, [sdf, onSoftDrop]);

  const getActionForKey = useCallback((key: string): keyof KeyBindings | null => {
    const normalizedKey = key.toLowerCase();
    for (const [action, binding] of Object.entries(keyBindings)) {
      if (binding.toLowerCase() === normalizedKey || binding === key) {
        return action as keyof KeyBindings;
      }
    }
    return null;
  }, [keyBindings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      
      // Prevent default for game keys
      const action = getActionForKey(key);
      if (action) {
        e.preventDefault();
      }

      // Handle pause even when not playing or paused
      if (action === 'pause' && isPlaying) {
        onPause();
        return;
      }

      if (!isPlaying || isPaused) return;
      
      // Prevent key repeat from browser
      if (keysPressed.current.has(key)) return;
      keysPressed.current.add(key);

      switch (action) {
        case 'moveLeft':
          startDAS('left', onMoveLeft);
          break;
        case 'moveRight':
          startDAS('right', onMoveRight);
          break;
        case 'softDrop':
          startSoftDrop();
          break;
        case 'hardDrop':
          onHardDrop();
          break;
        case 'rotateCW':
          primaryRotation === 'cw' ? onRotateCW() : onRotateCCW();
          break;
        case 'rotateCCW':
          primaryRotation === 'cw' ? onRotateCCW() : onRotateCW();
          break;
        case 'rotate180':
          onRotate180();
          break;
        case 'hold':
          onHold();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      keysPressed.current.delete(key);
      
      const action = getActionForKey(key);
      
      if (action === 'moveLeft' || action === 'moveRight') {
        // Check if opposite direction is still held
        const leftHeld = keysPressed.current.has(keyBindings.moveLeft);
        const rightHeld = keysPressed.current.has(keyBindings.moveRight);
        
        if (action === 'moveLeft' && rightHeld) {
          // Switch to right
          startDAS('right', onMoveRight);
        } else if (action === 'moveRight' && leftHeld) {
          // Switch to left
          startDAS('left', onMoveLeft);
        } else {
          // No direction held, stop DAS/ARR
          if (dasTimerRef.current) {
            clearTimeout(dasTimerRef.current);
            dasTimerRef.current = null;
          }
          if (arrTimerRef.current) {
            clearInterval(arrTimerRef.current);
            arrTimerRef.current = null;
          }
          currentDirectionRef.current = null;
          dasChargedRef.current = false;
        }
      }
      
      if (action === 'softDrop') {
        if (softDropTimerRef.current) {
          clearInterval(softDropTimerRef.current);
          softDropTimerRef.current = null;
        }
      }
    };

    const handleBlur = () => {
      keysPressed.current.clear();
      clearTimers();
      currentDirectionRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      clearTimers();
    };
  }, [
    isPlaying,
    isPaused,
    keyBindings,
    primaryRotation,
    getActionForKey,
    startDAS,
    startSoftDrop,
    onMoveLeft,
    onMoveRight,
    onHardDrop,
    onRotateCW,
    onRotateCCW,
    onRotate180,
    onHold,
    onPause,
    clearTimers,
  ]);

  // Clear timers when paused or game ends
  useEffect(() => {
    if (!isPlaying || isPaused) {
      clearTimers();
      keysPressed.current.clear();
      currentDirectionRef.current = null;
    }
  }, [isPlaying, isPaused, clearTimers]);
};
