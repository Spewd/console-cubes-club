import { useState, useCallback, useEffect } from 'react';

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
}

const SHAPES: Record<Exclude<TetrisBlock, null>, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const PIECE_TYPES: Exclude<TetrisBlock, null>[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export type Board = TetrisBlock[][];

const createEmptyBoard = (): Board => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

const getRandomPiece = (): Piece => {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return {
    type,
    shape: SHAPES[type],
    position: { x: Math.floor((BOARD_WIDTH - SHAPES[type][0].length) / 2), y: 0 }
  };
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
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

const calculateScore = (lines: number, level: number): number => {
  const points = [0, 40, 100, 300, 1200];
  return points[lines] * (level + 1);
};

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece;
  score: number;
  level: number;
  lines: number;
  isPlaying: boolean;
  isGameOver: boolean;
  isPaused: boolean;
}

export const useTetris = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: getRandomPiece(),
    score: 0,
    level: 0,
    lines: 0,
    isPlaying: false,
    isGameOver: false,
    isPaused: false,
  });

  const startGame = useCallback(() => {
    const firstPiece = getRandomPiece();
    setGameState({
      board: createEmptyBoard(),
      currentPiece: firstPiece,
      nextPiece: getRandomPiece(),
      score: 0,
      level: 0,
      lines: 0,
      isPlaying: true,
      isGameOver: false,
      isPaused: false,
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const moveLeft = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      if (!checkCollision(prev.board, prev.currentPiece, { x: -1, y: 0 })) {
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
      const rotatedShape = rotateMatrix(prev.currentPiece.shape);
      const rotatedPiece = { ...prev.currentPiece, shape: rotatedShape };
      if (!checkCollision(prev.board, rotatedPiece)) {
        return { ...prev, currentPiece: rotatedPiece };
      }
      return prev;
    });
  }, []);

  const moveDown = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      
      if (!checkCollision(prev.board, prev.currentPiece, { x: 0, y: 1 })) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...prev.currentPiece.position, y: prev.currentPiece.position.y + 1 }
          }
        };
      }
      
      // Piece has landed
      const newBoard = mergePieceToBoard(prev.board, prev.currentPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      const newScore = prev.score + calculateScore(linesCleared, prev.level);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10);
      
      const nextPiece = prev.nextPiece;
      
      // Check game over
      if (checkCollision(clearedBoard, nextPiece)) {
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel,
          isPlaying: false,
          isGameOver: true,
        };
      }
      
      return {
        ...prev,
        board: clearedBoard,
        currentPiece: nextPiece,
        nextPiece: getRandomPiece(),
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || !prev.isPlaying) return prev;
      
      let dropDistance = 0;
      while (!checkCollision(prev.board, prev.currentPiece, { x: 0, y: dropDistance + 1 })) {
        dropDistance++;
      }
      
      const droppedPiece = {
        ...prev.currentPiece,
        position: { ...prev.currentPiece.position, y: prev.currentPiece.position.y + dropDistance }
      };
      
      const newBoard = mergePieceToBoard(prev.board, droppedPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      const newScore = prev.score + calculateScore(linesCleared, prev.level) + dropDistance * 2;
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10);
      
      const nextPiece = prev.nextPiece;
      
      if (checkCollision(clearedBoard, nextPiece)) {
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel,
          isPlaying: false,
          isGameOver: true,
        };
      }
      
      return {
        ...prev,
        board: clearedBoard,
        currentPiece: nextPiece,
        nextPiece: getRandomPiece(),
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, []);

  // Auto drop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const speed = Math.max(100, 1000 - gameState.level * 100);
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
          moveDown();
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause]);

  return {
    gameState,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
  };
};
