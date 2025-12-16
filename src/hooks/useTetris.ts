import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrisBlock = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | null;

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: TetrisBlock;
  shape: number[][];
  position: Position;
  rotationState: number; // 0, 1, 2, 3 for T-spin detection
}

const SHAPES: Record<Exclude<TetrisBlock, null>, number[][]> = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
};

// SRS Wall Kick data
const WALL_KICKS: Record<string, Position[][]> = {
  JLSTZ: [
    [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }], // 0->1
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],   // 1->2
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],    // 2->3
    [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }], // 3->0
  ],
  I: [
    [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],   // 0->1
    [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],   // 1->2
    [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],   // 2->3
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],   // 3->0
  ],
};

const PIECE_TYPES: Exclude<TetrisBlock, null>[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export type Board = TetrisBlock[][];

type LastAction = 'none' | 'move' | 'rotate';

const createEmptyBoard = (): Board => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

// 7-bag randomizer for fair piece distribution
const createBag = (): Exclude<TetrisBlock, null>[] => {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

const getRandomPiece = (bag: Exclude<TetrisBlock, null>[]): { piece: Piece; newBag: Exclude<TetrisBlock, null>[] } => {
  let newBag = [...bag];
  if (newBag.length === 0) {
    newBag = createBag();
  }
  const type = newBag.shift()!;
  return {
    piece: {
      type,
      shape: SHAPES[type].map(row => [...row]),
      position: { x: Math.floor((BOARD_WIDTH - SHAPES[type][0].length) / 2), y: 0 },
      rotationState: 0,
    },
    newBag,
  };
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const size = matrix.length;
  const rotated = Array(size).fill(null).map(() => Array(size).fill(0));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      rotated[c][size - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
};

const checkCollision = (board: Board, piece: Piece, offset: Position = { x: 0, y: 0 }): boolean => {
  const { shape, position } = piece;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = position.x + x + offset.x;
        const newY = position.y + y + offset.y;
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
        if (newY >= 0 && board[newY][newX]) return true;
      }
    }
  }
  return false;
};

const mergePieceToBoard = (board: Board, piece: Piece): Board => {
  const newBoard = board.map(row => [...row]);
  const { shape, position, type } = piece;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] && position.y + y >= 0) {
        newBoard[position.y + y][position.x + x] = type;
      }
    }
  }
  return newBoard;
};

const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  return { newBoard, linesCleared };
};

// T-spin detection - check if T piece is locked with 3 corners filled
const detectTSpin = (board: Board, piece: Piece, lastAction: LastAction): 'none' | 'mini' | 'full' => {
  if (piece.type !== 'T' || lastAction !== 'rotate') return 'none';
  
  const { position } = piece;
  // T piece center is at position + 1 in both x and y (for 3x3 matrix)
  const centerX = position.x + 1;
  const centerY = position.y + 1;
  
  // Check the 4 corners around the T center
  const corners = [
    { x: centerX - 1, y: centerY - 1 }, // top-left
    { x: centerX + 1, y: centerY - 1 }, // top-right
    { x: centerX - 1, y: centerY + 1 }, // bottom-left
    { x: centerX + 1, y: centerY + 1 }, // bottom-right
  ];
  
  let filledCorners = 0;
  let frontCornersFilled = 0;
  
  corners.forEach((corner, index) => {
    const isBlocked = 
      corner.x < 0 || corner.x >= BOARD_WIDTH || 
      corner.y >= BOARD_HEIGHT || 
      (corner.y >= 0 && board[corner.y][corner.x] !== null);
    
    if (isBlocked) {
      filledCorners++;
      // Front corners depend on rotation state
      const frontIndices = [[0, 1], [1, 3], [2, 3], [0, 2]][piece.rotationState];
      if (frontIndices.includes(index)) frontCornersFilled++;
    }
  });
  
  if (filledCorners >= 3) {
    return frontCornersFilled >= 2 ? 'full' : 'mini';
  }
  return 'none';
};

// Advanced scoring system
const calculateScore = (
  lines: number, 
  level: number, 
  tSpin: 'none' | 'mini' | 'full',
  isPerfectClear: boolean,
  combo: number,
  isBackToBack: boolean
): number => {
  let baseScore = 0;
  
  // Base line clear scores
  if (tSpin === 'full') {
    const tSpinScores = [400, 800, 1200, 1600]; // T-spin (0 lines), single, double, triple
    baseScore = tSpinScores[lines] || 0;
  } else if (tSpin === 'mini') {
    const miniScores = [100, 200, 400]; // Mini T-spin, single, double
    baseScore = miniScores[lines] || 0;
  } else {
    const normalScores = [0, 100, 300, 500, 800]; // Single, double, triple, tetris
    baseScore = normalScores[lines] || 0;
  }
  
  // Back-to-back bonus (1.5x for consecutive difficult clears)
  if (isBackToBack && (lines === 4 || tSpin !== 'none')) {
    baseScore = Math.floor(baseScore * 1.5);
  }
  
  // Perfect clear bonus
  if (isPerfectClear) {
    const perfectScores = [0, 800, 1200, 1800, 2000];
    baseScore += perfectScores[lines] || 0;
  }
  
  // Combo bonus
  if (combo > 0 && lines > 0) {
    baseScore += 50 * combo;
  }
  
  return baseScore * (level + 1);
};

// Calculate ghost piece position
const getGhostPosition = (board: Board, piece: Piece): Position => {
  let dropDistance = 0;
  while (!checkCollision(board, piece, { x: 0, y: dropDistance + 1 })) {
    dropDistance++;
  }
  return {
    x: piece.position.x,
    y: piece.position.y + dropDistance
  };
};

// Speed curve (milliseconds per drop)
const getDropSpeed = (level: number): number => {
  // Classic NES-style speed curve
  const speeds = [800, 717, 633, 550, 467, 383, 300, 217, 133, 100, 83, 83, 83, 67, 67, 67, 50, 50, 50, 33];
  return speeds[Math.min(level, speeds.length - 1)];
};

export interface ClearEvent {
  type: 'lines' | 'tspin' | 'tspin-mini' | 'perfect';
  lines: number;
  combo: number;
  isBackToBack: boolean;
  points: number;
  timestamp: number;
}

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece;
  holdPiece: Piece | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  isPlaying: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  combo: number;
  lastClearWasDifficult: boolean;
  bag: Exclude<TetrisBlock, null>[];
  clearEvent: ClearEvent | null;
}

export const useTetris = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: { type: 'T', shape: SHAPES.T, position: { x: 0, y: 0 }, rotationState: 0 },
    holdPiece: null,
    canHold: true,
    score: 0,
    level: 0,
    lines: 0,
    isPlaying: false,
    isGameOver: false,
    isPaused: false,
    combo: -1,
    lastClearWasDifficult: false,
    bag: [],
    clearEvent: null,
  });
  
  const lastActionRef = useRef<LastAction>('none');

  // Calculate ghost piece position
  const ghostPosition = useMemo(() => {
    if (!gameState.currentPiece) return null;
    return getGhostPosition(gameState.board, gameState.currentPiece);
  }, [gameState.board, gameState.currentPiece]);

  const startGame = useCallback(() => {
    const initialBag = createBag();
    const { piece: firstPiece, newBag: bag1 } = getRandomPiece(initialBag);
    const { piece: nextPiece, newBag: bag2 } = getRandomPiece(bag1);
    
    setGameState({
      board: createEmptyBoard(),
      currentPiece: firstPiece,
      nextPiece: nextPiece,
      holdPiece: null,
      canHold: true,
      score: 0,
      level: 0,
      lines: 0,
      isPlaying: true,
      isGameOver: false,
      isPaused: false,
      combo: -1,
      lastClearWasDifficult: false,
      bag: bag2,
      clearEvent: null,
    });
    lastActionRef.current = 'none';
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const holdPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying || !prev.canHold) return prev;
      
      const currentType = prev.currentPiece.type;
      if (!currentType) return prev;
      
      if (prev.holdPiece) {
        const heldType = prev.holdPiece.type as Exclude<TetrisBlock, null>;
        const newCurrentPiece: Piece = {
          type: heldType,
          shape: SHAPES[heldType].map(row => [...row]),
          position: { x: Math.floor((BOARD_WIDTH - SHAPES[heldType][0].length) / 2), y: 0 },
          rotationState: 0,
        };
        
        return {
          ...prev,
          currentPiece: newCurrentPiece,
          holdPiece: {
            type: currentType,
            shape: SHAPES[currentType].map(row => [...row]),
            position: { x: 0, y: 0 },
            rotationState: 0,
          },
          canHold: false,
        };
      } else {
        const { piece: newNext, newBag } = getRandomPiece(prev.bag);
        return {
          ...prev,
          currentPiece: prev.nextPiece,
          nextPiece: newNext,
          holdPiece: {
            type: currentType,
            shape: SHAPES[currentType].map(row => [...row]),
            position: { x: 0, y: 0 },
            rotationState: 0,
          },
          canHold: false,
          bag: newBag,
        };
      }
    });
    lastActionRef.current = 'none';
  }, []);

  const moveLeft = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      if (!checkCollision(prev.board, prev.currentPiece, { x: -1, y: 0 })) {
        lastActionRef.current = 'move';
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...prev.currentPiece.position, x: prev.currentPiece.position.x - 1 }
          }
        };
      }
      return prev;
    });
  }, []);

  const moveRight = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      if (!checkCollision(prev.board, prev.currentPiece, { x: 1, y: 0 })) {
        lastActionRef.current = 'move';
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...prev.currentPiece.position, x: prev.currentPiece.position.x + 1 }
          }
        };
      }
      return prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      if (prev.currentPiece.type === 'O') return prev; // O piece doesn't rotate
      
      const rotatedShape = rotateMatrix(prev.currentPiece.shape);
      const newRotationState = (prev.currentPiece.rotationState + 1) % 4;
      
      // Get wall kick data
      const kickData = prev.currentPiece.type === 'I' ? WALL_KICKS.I : WALL_KICKS.JLSTZ;
      const kicks = kickData[prev.currentPiece.rotationState];
      
      // Try each kick position
      for (const kick of kicks) {
        const testPiece: Piece = {
          ...prev.currentPiece,
          shape: rotatedShape,
          position: {
            x: prev.currentPiece.position.x + kick.x,
            y: prev.currentPiece.position.y + kick.y,
          },
          rotationState: newRotationState,
        };
        
        if (!checkCollision(prev.board, testPiece)) {
          lastActionRef.current = 'rotate';
          return { ...prev, currentPiece: testPiece };
        }
      }
      
      return prev;
    });
  }, []);

  const lockPiece = useCallback((prev: GameState, piece: Piece, dropBonus: number = 0): GameState => {
    const tSpin = detectTSpin(prev.board, piece, lastActionRef.current);
    const newBoard = mergePieceToBoard(prev.board, piece);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    
    // Check for perfect clear
    const isPerfectClear = clearedBoard.every(row => row.every(cell => cell === null));
    
    // Update combo
    const newCombo = linesCleared > 0 ? prev.combo + 1 : -1;
    
    // Check back-to-back
    const isDifficultClear = linesCleared === 4 || tSpin !== 'none';
    const isBackToBack = prev.lastClearWasDifficult && isDifficultClear;
    
    const scoreGain = calculateScore(linesCleared, prev.level, tSpin, isPerfectClear, newCombo, isBackToBack) + dropBonus;
    const newScore = prev.score + scoreGain;
    const newLines = prev.lines + linesCleared;
    const newLevel = Math.floor(newLines / 10);
    
    const { piece: nextPiece, newBag } = getRandomPiece(prev.bag);
    
    // Create clear event for visual feedback
    let clearEvent: ClearEvent | null = null;
    if (linesCleared > 0 || tSpin !== 'none' || isPerfectClear) {
      clearEvent = {
        type: isPerfectClear ? 'perfect' : tSpin === 'full' ? 'tspin' : tSpin === 'mini' ? 'tspin-mini' : 'lines',
        lines: linesCleared,
        combo: newCombo,
        isBackToBack,
        points: scoreGain,
        timestamp: Date.now(),
      };
    }
    
    // Check game over
    if (checkCollision(clearedBoard, prev.nextPiece)) {
      return {
        ...prev,
        board: clearedBoard,
        currentPiece: null,
        score: newScore,
        lines: newLines,
        level: newLevel,
        isPlaying: false,
        isGameOver: true,
        combo: newCombo,
        lastClearWasDifficult: linesCleared > 0 ? isDifficultClear : prev.lastClearWasDifficult,
        clearEvent,
      };
    }
    
    return {
      ...prev,
      board: clearedBoard,
      currentPiece: prev.nextPiece,
      nextPiece: nextPiece,
      score: newScore,
      lines: newLines,
      level: newLevel,
      canHold: true,
      combo: newCombo,
      lastClearWasDifficult: linesCleared > 0 ? isDifficultClear : prev.lastClearWasDifficult,
      bag: newBag,
      clearEvent,
    };
  }, []);

  const moveDown = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      
      if (!checkCollision(prev.board, prev.currentPiece, { x: 0, y: 1 })) {
        lastActionRef.current = 'move';
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...prev.currentPiece.position, y: prev.currentPiece.position.y + 1 }
          }
        };
      }
      
      // Piece has landed
      const result = lockPiece(prev, prev.currentPiece);
      lastActionRef.current = 'none';
      return result;
    });
  }, [lockPiece]);

  const softDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      
      if (!checkCollision(prev.board, prev.currentPiece, { x: 0, y: 1 })) {
        lastActionRef.current = 'move';
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...prev.currentPiece.position, y: prev.currentPiece.position.y + 1 }
          },
          score: prev.score + 1, // 1 point per soft drop cell
        };
      }
      
      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      
      let dropDistance = 0;
      while (!checkCollision(prev.board, prev.currentPiece, { x: 0, y: dropDistance + 1 })) {
        dropDistance++;
      }
      
      const droppedPiece: Piece = {
        ...prev.currentPiece,
        position: { ...prev.currentPiece.position, y: prev.currentPiece.position.y + dropDistance }
      };
      
      const result = lockPiece(prev, droppedPiece, dropDistance * 2); // 2 points per cell for hard drop
      lastActionRef.current = 'none';
      return result;
    });
  }, [lockPiece]);

  // Auto drop with proper speed curve
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const speed = getDropSpeed(gameState.level);
    const interval = setInterval(moveDown, speed);
    
    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.isPaused, gameState.level, moveDown]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          holdPiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, moveLeft, moveRight, softDrop, rotate, hardDrop, togglePause, holdPiece]);

  return {
    gameState,
    ghostPosition,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown: softDrop,
    rotate,
    hardDrop,
    holdPiece,
  };
};
