"use client";
import { useCallback, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameProvider";

const ZEN_BOARD = {
  lightSquareStyle: { backgroundColor: "#1c1c1e" },
  darkSquareStyle: { backgroundColor: "#0a0a0b" },
};

const DEFAULT_BOARD = {
  lightSquareStyle: { backgroundColor: "#e2e0f0" },
  darkSquareStyle: { backgroundColor: "#6c63b0" },
};

interface ChessBoardProps {
  byTime?: boolean;
  orientation?: "white" | "black";
}

export function ChessBoard({ byTime, orientation = "white" }: ChessBoardProps) {
  const { game, deepWork, makeMove } = useGame();
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({});
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const getMoveOptions = useCallback(
    (square: string) => {
      const chess = new Chess(game.fen);
      const moves = chess.moves({ square: square as Square, verbose: true });
      if (!moves.length) return;

      const squares: Record<string, React.CSSProperties> = {};
      squares[square] = {
        background: "rgba(99,102,241,0.4)",
        borderRadius: "4px",
      };

      moves.forEach((m) => {
        squares[m.to] = {
          background: chess.get(m.to as Square)
            ? "radial-gradient(circle, rgba(239,68,68,0.6) 70%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.5) 30%, transparent 30%)",
          borderRadius: "50%",
        };
      });

      setOptionSquares(squares);
      setSelectedPiece(square);
    },
    [game.fen]
  );

  const onSquareClick = useCallback(
    ({ square }: { piece?: unknown; square: string }) => {
      if (game.status === "finished") return;

      if (selectedPiece) {
        const moved = makeMove(selectedPiece, square);
        if (moved) {
          setOptionSquares({});
          setSelectedPiece(null);
          return;
        }
      }
      getMoveOptions(square);
    },
    [selectedPiece, makeMove, getMoveOptions, game.status]
  );

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: unknown;
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!targetSquare) return false;
      const moved = makeMove(sourceSquare, targetSquare);
      setOptionSquares({});
      setSelectedPiece(null);
      return moved;
    },
    [makeMove]
  );

  const lastMoveSquares: Record<string, React.CSSProperties> = game.lastMove
    ? {
        [game.lastMove.from]: { background: "rgba(99,102,241,0.25)" },
        [game.lastMove.to]: { background: "rgba(99,102,241,0.35)" },
      }
    : {};

  const boardStyle = deepWork.isActive ? ZEN_BOARD : DEFAULT_BOARD;

  return (
    <motion.div
      layout
      className="relative w-full max-w-[560px] aspect-square mx-auto"
      animate={{
        filter: deepWork.isActive
          ? "saturate(0.6) brightness(0.85)"
          : "saturate(1) brightness(1)",
      }}
      transition={{ duration: 0.6 }}
    >
      {/* Check highlight ring */}
      {game.isCheck && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute inset-0 rounded-lg ring-4 ring-red-500/60 pointer-events-none z-10"
        />
      )}

      <Chessboard
        options={{
          position: game.fen,
          onSquareClick,
          onPieceDrop,
          boardOrientation: orientation,
          squareStyles: { ...lastMoveSquares, ...optionSquares },
          lightSquareStyle: boardStyle.lightSquareStyle,
          darkSquareStyle: boardStyle.darkSquareStyle,
          animationDurationInMs: 200,
        }}
      />

      {/* Game over overlay */}
      {game.status === "finished" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-20"
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-2">
              {game.result === "draw"
                ? "Ничья!"
                : game.result === "white"
                ? "Победа!"
                : "Поражение"}
            </p>
            <p className="text-zinc-400 text-sm">
              {game.isCheckmate
                ? "Матом"
                : game.isStalemate
                ? "Патом"
                : game.isDraw
                ? "Ничьей"
                : byTime
                ? "По времени"
                : "Сдачей"}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
