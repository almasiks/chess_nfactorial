"use client";
import { useCallback } from "react";
import { Chess } from "chess.js";

export type BotDifficulty = "easy" | "medium" | "hard";

// Centipawn values for piece types
const PIECE_VAL: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 0,
};

function evalBoard(chess: Chess): number {
  let score = 0;
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq) continue;
      const v = PIECE_VAL[sq.type] ?? 0;
      score += sq.color === "b" ? v : -v;
    }
  }
  return score;
}

export function useBotMove() {
  const getNextMove = useCallback(
    (fen: string, difficulty: BotDifficulty): { from: string; to: string; promotion?: string } | null => {
      const chess = new Chess(fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) return null;

      if (difficulty === "easy") {
        // Completely random — make a small random delay feel more natural
        const m = moves[Math.floor(Math.random() * moves.length)];
        return { from: m.from, to: m.to, promotion: m.promotion };
      }

      if (difficulty === "medium") {
        // Greedy: pick highest-value capture, else pick random non-blunder
        const captures = moves.filter((m) => m.captured);
        if (captures.length > 0) {
          const best = captures.reduce((a, b) =>
            (PIECE_VAL[b.captured ?? ""] ?? 0) > (PIECE_VAL[a.captured ?? ""] ?? 0) ? b : a
          );
          return { from: best.from, to: best.to, promotion: best.promotion };
        }
        // Prefer checks
        const checks = moves.filter((m) => {
          const tmp = new Chess(fen);
          tmp.move({ from: m.from, to: m.to, promotion: "q" });
          return tmp.isCheck();
        });
        if (checks.length > 0) {
          const m = checks[Math.floor(Math.random() * checks.length)];
          return { from: m.from, to: m.to, promotion: m.promotion };
        }
        const m = moves[Math.floor(Math.random() * moves.length)];
        return { from: m.from, to: m.to, promotion: m.promotion };
      }

      // Hard: 1-ply minimax from bot's (black) perspective
      let bestScore = -Infinity;
      let bestMove = moves[0];
      for (const m of moves) {
        const tmp = new Chess(fen);
        tmp.move({ from: m.from, to: m.to, promotion: "q" });
        // Check for immediate checkmate
        if (tmp.isCheckmate()) return { from: m.from, to: m.to, promotion: m.promotion };
        const score = evalBoard(tmp);
        // Bot is black, so higher score (more black material advantage) is better
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
        }
      }
      return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion };
    },
    []
  );

  return { getNextMove };
}
