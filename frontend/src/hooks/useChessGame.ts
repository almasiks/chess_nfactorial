"use client";
import { useReducer, useCallback } from "react";
import { Chess } from "chess.js";
import type { GameState, MoveRecord, Player } from "@/types/game";

const defaultPlayer = (
  name: string,
  color: "w" | "b",
  rating: number
): Player => ({
  id: color,
  name,
  color,
  rating,
  timeLeft: 600,
  flowCoins: 0,
  level: 1,
  xp: 0,
  xpToNext: 100,
  avatar: undefined,
});

function buildInitialState(): GameState {
  return {
    fen: new Chess().fen(),
    status: "idle",
    result: null,
    currentTurn: "w",
    moveHistory: [],
    whitePlayer: defaultPlayer("Вы", "w", 1200),
    blackPlayer: defaultPlayer("Бот", "b", 1500),
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    selectedSquare: null,
    lastMove: null,
  };
}

const START_FEN = new Chess().fen();

type Action =
  | { type: "MOVE"; from: string; to: string; promotion?: string }
  | { type: "RESET" }
  | { type: "RESIGN"; color: "w" | "b" }
  | { type: "SELECT_SQUARE"; square: string | null }
  | { type: "UNDO" };

function applyMove(
  state: GameState,
  from: string,
  to: string,
  promotion?: string
): GameState | null {
  const chess = new Chess(state.fen);
  try {
    const move = chess.move({ from, to, promotion: promotion ?? "q" });
    if (!move) return null;

    const record: MoveRecord = {
      san: move.san,
      fen: chess.fen(),
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured,
      promotion: move.promotion,
      moveNumber: Math.ceil((state.moveHistory.length + 1) / 2),
      color: move.color as "w" | "b",
      timestamp: Date.now(),
    };

    let result = state.result;
    let status = state.status;

    if (chess.isCheckmate()) {
      result = move.color === "w" ? "white" : "black";
      status = "finished";
    } else if (chess.isStalemate() || chess.isDraw()) {
      result = "draw";
      status = "finished";
    }

    return {
      ...state,
      fen: chess.fen(),
      status,
      result,
      currentTurn: chess.turn() as "w" | "b",
      moveHistory: [...state.moveHistory, record],
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      lastMove: { from: move.from, to: move.to },
      selectedSquare: null,
    };
  } catch {
    return null;
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "MOVE": {
      if (state.status === "finished") return state;
      const next = applyMove(state, action.from, action.to, action.promotion);
      return next ?? state;
    }
    case "RESET":
      return { ...buildInitialState(), status: "playing" };
    case "RESIGN":
      return {
        ...state,
        status: "finished",
        result: action.color === "w" ? "black" : "white",
      };
    case "SELECT_SQUARE":
      return { ...state, selectedSquare: action.square };
    case "UNDO": {
      // Undo 2 half-moves (player move + bot response)
      const undoCount = Math.min(2, state.moveHistory.length);
      if (undoCount === 0) return state;
      const newHistory = state.moveHistory.slice(0, -undoCount);
      const prevFen = newHistory.length > 0
        ? newHistory[newHistory.length - 1].fen
        : START_FEN;
      const chess = new Chess(prevFen);
      return {
        ...state,
        fen: prevFen,
        moveHistory: newHistory,
        currentTurn: chess.turn() as "w" | "b",
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isStalemate: chess.isStalemate(),
        isDraw: chess.isDraw(),
        result: null,
        status: "playing",
        lastMove: newHistory.length > 0
          ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to }
          : null,
        selectedSquare: null,
      };
    }
    default:
      return state;
  }
}

export function useChessGame() {
  const [state, dispatch] = useReducer(reducer, buildInitialState());

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      const chess = new Chess(state.fen);
      const legal = chess
        .moves({ verbose: true })
        .some((m) => m.from === from && m.to === to);
      if (!legal) return false;
      dispatch({ type: "MOVE", from, to, promotion });
      return true;
    },
    [state.fen]
  );

  const resetGame  = useCallback(() => dispatch({ type: "RESET" }), []);
  const resignGame = useCallback(
    () => dispatch({ type: "RESIGN", color: state.currentTurn }),
    [state.currentTurn]
  );
  const selectSquare = useCallback(
    (square: string | null) => dispatch({ type: "SELECT_SQUARE", square }),
    []
  );
  const undoMove = useCallback(() => dispatch({ type: "UNDO" }), []);

  return { state, makeMove, resetGame, resignGame, selectSquare, undoMove };
}
