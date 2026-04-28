export type PieceColor = "w" | "b";
export type GameStatus = "idle" | "playing" | "paused" | "finished";
export type GameResult = "white" | "black" | "draw" | null;

export interface Player {
  id: string;
  name: string;
  rating: number;
  avatar?: string;
  color: PieceColor;
  timeLeft: number; // seconds
  flowCoins: number;
  level: number;
  xp: number;
  xpToNext: number;
}

export interface MoveRecord {
  san: string;          // Standard Algebraic Notation e.g. "e4"
  fen: string;          // FEN after move
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  moveNumber: number;
  color: PieceColor;
  timestamp: number;
}

export interface PomodoroState {
  isActive: boolean;
  isPaused: boolean;
  minutesLeft: number;
  secondsLeft: number;
  session: number;       // 1–4 before long break
  phase: "work" | "short_break" | "long_break";
  totalFocusMinutes: number;
}

export interface DeepWorkState {
  isActive: boolean;
  loFiPlaying: boolean;
  zenMode: boolean;
}

export interface GameState {
  fen: string;
  status: GameStatus;
  result: GameResult;
  currentTurn: PieceColor;
  moveHistory: MoveRecord[];
  whitePlayer: Player;
  blackPlayer: Player;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  selectedSquare: string | null;
  lastMove: { from: string; to: string } | null;
}

export interface CoinsTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

export interface GameContextValue {
  // State
  game: GameState;
  pomodoro: PomodoroState;
  deepWork: DeepWorkState;
  coinBalance: number;
  coinHistory: CoinsTransaction[];

  // Game actions
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  resetGame: () => void;
  resignGame: () => void;
  undoMove: () => void;

  // Deep Work actions
  toggleDeepWork: () => void;
  toggleLoFi: () => void;

  // Pomodoro actions
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;

  // Coin actions
  awardCoins: (amount: number, reason: string) => void;
}
