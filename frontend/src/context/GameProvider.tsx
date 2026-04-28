"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { GameContextValue, DeepWorkState } from "@/types/game";
import { useChessGame } from "@/hooks/useChessGame";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useFlowCoins } from "@/hooks/useFlowCoins";

// ─── Coin rewards ────────────────────────────────────────────────────────────
const COINS_WIN = 50;
const COINS_DRAW = 15;
const COINS_FOCUS_PER_MIN = 2; // awarded each completed pomodoro work session

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Core slices
  const chess = useChessGame();
  const pomodoro = usePomodoro();
  const coins = useFlowCoins(100); // start with 100 FC

  // Deep Work state
  const [deepWork, setDeepWork] = useState<DeepWorkState>({
    isActive: false,
    loFiPlaying: false,
    zenMode: false,
  });

  // ── Coin awards tied to game events ──────────────────────────────────────
  const prevResultRef = useRef(chess.state.result);
  useEffect(() => {
    const result = chess.state.result;
    if (result && result !== prevResultRef.current) {
      if (result === "white") coins.award(COINS_WIN, "Victory!");
      else if (result === "draw") coins.award(COINS_DRAW, "Draw — good fight");
      prevResultRef.current = result;
    }
  }, [chess.state.result, coins]);

  // Award coins for completed pomodoro work sessions
  const prevPhaseRef = useRef(pomodoro.state.phase);
  const prevSessionRef = useRef(pomodoro.state.session);
  useEffect(() => {
    const { phase, session, totalFocusMinutes } = pomodoro.state;
    // Transitioned away from "work" → award coins
    if (prevPhaseRef.current === "work" && phase !== "work") {
      const earned = Math.round(COINS_FOCUS_PER_MIN * 25); // 25 min session
      coins.award(earned, `Focus session #${prevSessionRef.current} complete`);
    }
    prevPhaseRef.current = phase;
    prevSessionRef.current = session;
  }, [pomodoro.state, coins]);

  // ── Deep Work toggle ──────────────────────────────────────────────────────
  const toggleDeepWork = useCallback(() => {
    setDeepWork((prev) => {
      const next = !prev.isActive;
      if (next) {
        // Entering Deep Work: auto-start pomodoro
        pomodoro.start();
        return { isActive: true, loFiPlaying: true, zenMode: true };
      } else {
        // Exiting: pause pomodoro, stop music
        pomodoro.pause();
        return { isActive: false, loFiPlaying: false, zenMode: false };
      }
    });
  }, [pomodoro]);

  const toggleLoFi = useCallback(() => {
    setDeepWork((prev) => ({ ...prev, loFiPlaying: !prev.loFiPlaying }));
  }, []);

  // ── Start game on mount ───────────────────────────────────────────────────
  useEffect(() => {
    chess.resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: GameContextValue = {
    game: chess.state,
    pomodoro: pomodoro.state,
    deepWork,
    coinBalance: coins.balance,
    coinHistory: coins.history,

    makeMove: chess.makeMove,
    resetGame: chess.resetGame,
    resignGame: chess.resignGame,
    undoMove: chess.undoMove,

    toggleDeepWork,
    toggleLoFi,

    startPomodoro: pomodoro.start,
    pausePomodoro: pomodoro.pause,
    resetPomodoro: pomodoro.reset,

    awardCoins: coins.award,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
