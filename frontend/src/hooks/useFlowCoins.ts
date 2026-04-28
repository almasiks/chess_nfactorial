"use client";
import { useReducer, useCallback } from "react";
import type { CoinsTransaction } from "@/types/game";

interface CoinsState {
  balance: number;
  history: CoinsTransaction[];
}

type Action = { type: "AWARD"; amount: number; reason: string };

function reducer(state: CoinsState, action: Action): CoinsState {
  switch (action.type) {
    case "AWARD": {
      const tx: CoinsTransaction = {
        id: `${Date.now()}-${Math.random()}`,
        amount: action.amount,
        reason: action.reason,
        timestamp: Date.now(),
      };
      return {
        balance: state.balance + action.amount,
        history: [tx, ...state.history].slice(0, 50),
      };
    }
    default:
      return state;
  }
}

export function useFlowCoins(initial = 0) {
  const [state, dispatch] = useReducer(reducer, {
    balance: initial,
    history: [],
  });

  const award = useCallback((amount: number, reason: string) => {
    dispatch({ type: "AWARD", amount, reason });
  }, []);

  return { balance: state.balance, history: state.history, award };
}
