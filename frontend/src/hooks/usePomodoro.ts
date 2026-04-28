"use client";
import { useReducer, useEffect, useRef, useCallback } from "react";
import type { PomodoroState } from "@/types/game";

const WORK_MINUTES = 25;
const SHORT_BREAK = 5;
const LONG_BREAK = 15;
const SESSIONS_BEFORE_LONG = 4;

const initialState: PomodoroState = {
  isActive: false,
  isPaused: false,
  minutesLeft: WORK_MINUTES,
  secondsLeft: 0,
  session: 1,
  phase: "work",
  totalFocusMinutes: 0,
};

type Action =
  | { type: "TICK" }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "NEXT_PHASE" };

function getPhaseMinutes(phase: PomodoroState["phase"]): number {
  if (phase === "work") return WORK_MINUTES;
  if (phase === "short_break") return SHORT_BREAK;
  return LONG_BREAK;
}

function reducer(state: PomodoroState, action: Action): PomodoroState {
  switch (action.type) {
    case "START":
      return { ...state, isActive: true, isPaused: false };

    case "PAUSE":
      return { ...state, isPaused: true, isActive: false };

    case "RESET":
      return { ...initialState };

    case "TICK": {
      if (state.secondsLeft > 0) {
        const addedFocus = state.phase === "work" ? 1 / 60 : 0;
        return {
          ...state,
          secondsLeft: state.secondsLeft - 1,
          totalFocusMinutes: state.totalFocusMinutes + addedFocus,
        };
      }
      if (state.minutesLeft > 0) {
        const addedFocus = state.phase === "work" ? 1 : 0;
        return {
          ...state,
          minutesLeft: state.minutesLeft - 1,
          secondsLeft: 59,
          totalFocusMinutes: state.totalFocusMinutes + addedFocus,
        };
      }
      // Timer finished — dispatch NEXT_PHASE externally
      return state;
    }

    case "NEXT_PHASE": {
      if (state.phase === "work") {
        const completedSession = state.session;
        const nextPhase: PomodoroState["phase"] =
          completedSession >= SESSIONS_BEFORE_LONG ? "long_break" : "short_break";
        return {
          ...state,
          phase: nextPhase,
          minutesLeft: getPhaseMinutes(nextPhase),
          secondsLeft: 0,
          isActive: true,
          isPaused: false,
        };
      }
      // Break finished → back to work
      const nextSession =
        state.phase === "long_break" ? 1 : state.session + 1;
      return {
        ...state,
        phase: "work",
        minutesLeft: WORK_MINUTES,
        secondsLeft: 0,
        session: nextSession,
        isActive: false, // pause between sessions
        isPaused: true,
      };
    }

    default:
      return state;
  }
}

export function usePomodoro() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isActive, state.isPaused]);

  // Auto-advance when timer reaches 0
  useEffect(() => {
    if (state.isActive && state.minutesLeft === 0 && state.secondsLeft === 0) {
      dispatch({ type: "NEXT_PHASE" });
    }
  }, [state.isActive, state.minutesLeft, state.secondsLeft]);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, start, pause, reset };
}
