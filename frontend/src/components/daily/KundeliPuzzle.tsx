"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";
import { useLanguage } from "@/context/LanguageContext";
import { TRANSLATIONS } from "@/lib/translations";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ─── Puzzle interfaces ───────────────────────────────────────────────────── */
interface LocalPuzzle {
  id: number;
  fen: string;
  solution_moves: string[];
  title: string;
  themes: string;
  difficulty: "easy" | "medium" | "hard";
  difficulty_display: string;
  rating: number;
  solved_by_me: boolean;
  advisor_intro: string;
  hints: string[];
}

/* ─── Local puzzle bank (API fallback) ───────────────────────────────────── */
const LOCAL_PUZZLES: LocalPuzzle[] = [
  {
    id: 101,
    fen: "5r1k/6pp/8/8/8/8/6PP/3RR1K1 w - - 0 1",
    solution_moves: ["d1d8", "f8d8", "e1e8"],
    title: "Удар по последней горизонтали",
    themes: "Мат в 2, Ладья, Жертва",
    difficulty: "easy",
    difficulty_display: "Лёгкий",
    rating: 1200,
    solved_by_me: false,
    advisor_intro: "Белые ладьи смотрят на 8-ю горизонталь. Она незащищена — это слабость!",
    hints: [
      "Посмотри на 8-ю горизонталь — где стоит чёрный король?",
      "Одна ладья открывает путь другой. Пожертвуй её!",
      "1.Лd8+! Лxd8 2.Лe8# — классический мат с жертвой",
    ],
  },
  {
    id: 102,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2",
    solution_moves: ["d8h4"],
    title: "Удар Батыра",
    themes: "Мат в 1, Ферзь, Диагональ",
    difficulty: "easy",
    difficulty_display: "Лёгкий",
    rating: 800,
    solved_by_me: false,
    advisor_intro: "Белые открыли свою позицию — и за это поплатятся. Ищи удар по диагонали!",
    hints: [
      "Ферзь может атаковать по длинной диагонали — какая линия открыта?",
      "Король белых не может двигаться — все соседние поля заняты или под ударом",
      "Фh4# — ферзь с h4 даёт мат! Это знаменитый «Дурацкий мат»",
    ],
  },
  {
    id: 103,
    fen: "k7/8/KQ6/8/8/8/8/8 w - - 0 1",
    solution_moves: ["b6a7"],
    title: "Коридорный мат",
    themes: "Мат в 1, Ферзь, Король",
    difficulty: "easy",
    difficulty_display: "Лёгкий",
    rating: 900,
    solved_by_me: false,
    advisor_intro: "Ферзь и Король работают в паре. Перекрой все поля вокруг чёрного короля!",
    hints: [
      "Чёрный король на а8 — куда он может сходить?",
      "Твой Король на а6 уже закрывает b7. Ферзю нужно закрыть оставшиеся поля",
      "Фа7# — ферзь встаёт рядом с королём, перекрывая a7, b8 и b8",
    ],
  },
  {
    id: 104,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution_moves: ["h5f7"],
    title: "Scholar's Mate — Удар Учёного",
    themes: "Мат в 1, Слабость f7, Атака",
    difficulty: "medium",
    difficulty_display: "Средний",
    rating: 1100,
    solved_by_me: false,
    advisor_intro: "Поле f7 прикрывает только чёрный король. Слон на с4 и ферзь на h5 смотрят туда...",
    hints: [
      "Где слабое поле в лагере чёрных рядом с королём?",
      "Слон на с4 бьёт по диагонали a2-g8 через f7. Ферзь на h5 тоже смотрит на f7",
      "Фхf7# — ферзь берёт пешку f7, слон прикрывает от взятия королём",
    ],
  },
  {
    id: 105,
    fen: "r3k3/8/4N3/8/8/8/8/4K3 w - - 0 1",
    solution_moves: ["e6c7", "e8d8", "c7a8"],
    title: "Вилка Коня",
    themes: "Вилка, Конь, Выигрыш материала",
    difficulty: "medium",
    difficulty_display: "Средний",
    rating: 1300,
    solved_by_me: false,
    advisor_intro: "Конь — мастер вилок. Найди поле, откуда он атакует и короля, и ладью одновременно!",
    hints: [
      "Конь с е6 может прыгнуть — куда, чтобы атаковать сразу две фигуры?",
      "Поле с7 атакует е8 (король) и а8 (ладья) — это идеальная вилка!",
      "1.Кс7+! Крd8 2.Кха8 — конь выигрывает ладью после вилки с шахом",
    ],
  },
];

/* ─── Difficulty colours ──────────────────────────────────────────────────── */
const DIFF_COLORS: Record<string, string> = {
  easy:   "#22c55e",
  medium: "#00AFCA",
  hard:   "#D4AF37",
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export function KundeliPuzzle() {
  const { lang } = useLanguage();
  const tr = TRANSLATIONS[lang];

  const [puzzle, setPuzzle]     = useState<LocalPuzzle | null>(null);
  const [game, setGame]         = useState<Chess>(new Chess());
  const [loading, setLoading]   = useState(true);
  const [moveIndex, setMoveIndex]   = useState(0);
  const [botMsg, setBotMsg]         = useState("");
  const [result, setResult]         = useState<"correct" | "wrong" | null>(null);
  const [asyqsEarned, setAasyqsEarned] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<Record<string, React.CSSProperties>>({});
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(-1);
  const [localPoolIndex, setLocalPoolIndex] = useState(0);

  useEffect(() => { loadPuzzle(); }, []);

  function resetPuzzleState() {
    setResult(null);
    setMoveIndex(0);
    setWrongAttempts(0);
    setSelectedSquare(null);
    setHighlightedSquares({});
    setAasyqsEarned(0);
    setRatingChange(null);
    setHintIndex(-1);
  }

  async function loadPuzzle(nextLocalIdx?: number) {
    setLoading(true);
    resetPuzzleState();
    try {
      const res = await fetch(`${API}/api/puzzles/daily/`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error("api-fail");
      const data = await res.json();
      const p: LocalPuzzle = {
        id: data.id,
        fen: data.fen,
        solution_moves: data.solution_moves,
        title: data.title || tr.puzzle_label,
        themes: data.themes || "",
        difficulty: data.difficulty || "medium",
        difficulty_display: data.difficulty_display || "Средний",
        rating: data.rating || 1200,
        solved_by_me: data.solved_by_me ?? false,
        advisor_intro: "Изучи позицию. Найди лучший ход!",
        hints: data.solution_moves?.map((_: string, i: number) =>
          i === data.solution_moves.length - 1
            ? `Решение: ${data.solution_moves.join(" → ")}`
            : `Подсказка ${i + 1}: ход ${data.solution_moves[i].slice(0, 2)} → ${data.solution_moves[i].slice(2, 4)}`
        ) ?? [],
      };
      setPuzzle(p);
      setGame(new Chess(p.fen));
      setBotMsg(p.advisor_intro);
    } catch {
      const idx = nextLocalIdx ?? localPoolIndex;
      const local = LOCAL_PUZZLES[idx % LOCAL_PUZZLES.length];
      setPuzzle(local);
      setGame(new Chess(local.fen));
      setBotMsg(local.advisor_intro);
      setLocalPoolIndex(idx);
    } finally {
      setLoading(false);
    }
  }

  function nextPuzzle() {
    const nextIdx = (localPoolIndex + 1) % LOCAL_PUZZLES.length;
    setLocalPoolIndex(nextIdx);
    loadPuzzle(nextIdx);
  }

  function showHint() {
    if (!puzzle) return;
    const nextIdx = Math.min(hintIndex + 1, puzzle.hints.length - 1);
    setHintIndex(nextIdx);
    setBotMsg(puzzle.hints[nextIdx]);
  }

  const getSquareStyles = useCallback(() => {
    const styles: Record<string, React.CSSProperties> = { ...highlightedSquares };
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: "rgba(0,175,202,0.45)" };
      try {
        const moves = game.moves({ square: selectedSquare, verbose: true });
        moves.forEach((m) => {
          styles[m.to] = {
            background: game.get(m.to)
              ? "radial-gradient(circle, rgba(239,68,68,0.5) 60%, transparent 65%)"
              : "radial-gradient(circle, rgba(0,175,202,0.4) 28%, transparent 32%)",
            borderRadius: "50%",
          };
        });
      } catch {}
    }
    return styles;
  }, [selectedSquare, highlightedSquares, game]);

  function onSquareClick(square: Square) {
    if (result || !puzzle) return;
    if (selectedSquare) {
      const moved = tryMove(selectedSquare, square);
      if (!moved) {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
      return;
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) setSelectedSquare(square);
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square): boolean {
    if (result || !puzzle) return false;
    return !!tryMove(sourceSquare, targetSquare);
  }

  function tryMove(from: Square, to: Square): boolean {
    if (!puzzle) return false;
    const expectedUci  = puzzle.solution_moves[moveIndex];
    const attemptUci   = from + to;
    const isCorrect    = attemptUci === expectedUci || attemptUci + "q" === expectedUci;

    if (isCorrect) {
      const newGame = new Chess(game.fen());
      const moved   = newGame.move({ from, to, promotion: "q" });
      if (!moved) return false;

      setGame(newGame);
      setSelectedSquare(null);
      setHighlightedSquares({
        [from]: { backgroundColor: "rgba(34,197,94,0.35)" },
        [to]:   { backgroundColor: "rgba(34,197,94,0.35)" },
      });
      setBotMsg("Хороший ход! Продолжай давление!");

      const nextIndex = moveIndex + 1;
      if (nextIndex >= puzzle.solution_moves.length) {
        setTimeout(() => finishPuzzle(newGame, true), 600);
      } else {
        setMoveIndex(nextIndex);
        setTimeout(() => {
          const oppUci = puzzle.solution_moves[nextIndex];
          if (oppUci) {
            const oppFrom = oppUci.slice(0, 2) as Square;
            const oppTo   = oppUci.slice(2, 4) as Square;
            const g2 = new Chess(newGame.fen());
            g2.move({ from: oppFrom, to: oppTo, promotion: "q" });
            setGame(g2);
            setHighlightedSquares({
              [oppFrom]: { backgroundColor: "rgba(212,175,55,0.3)" },
              [oppTo]:   { backgroundColor: "rgba(212,175,55,0.3)" },
            });
            setMoveIndex(nextIndex + 1);
            setBotMsg("Соперник ответил. Твой ход — продолжай!");
          }
        }, 700);
      }
      return true;
    }

    // Wrong move
    setWrongAttempts((w) => w + 1);
    setSelectedSquare(null);
    setHighlightedSquares({
      [from]: { backgroundColor: "rgba(239,68,68,0.3)" },
      [to]:   { backgroundColor: "rgba(239,68,68,0.3)" },
    });
    setBotMsg(tr.puzzle_wrong);
    setTimeout(() => setHighlightedSquares({}), 800);
    return false;
  }

  async function finishPuzzle(finalGame: Chess, correct: boolean) {
    void finalGame;
    setResult(correct ? "correct" : "wrong");
    if (!correct) {
      setRatingChange(-5);
      setBotMsg("Верное решение: " + puzzle!.solution_moves.join(" → "));
      return;
    }
    const penalty = wrongAttempts * 3;
    const gained  = Math.max(20 - penalty, 5);
    setAasyqsEarned(gained);
    const rc = wrongAttempts === 0 ? 8 : wrongAttempts <= 2 ? 4 : 1;
    setRatingChange(rc);
    setBotMsg(`${tr.puzzle_solved} +${gained} Асыков!`);

    try {
      const token = localStorage.getItem("steppechess_access") ?? "";
      await fetch(`${API}/api/puzzles/${puzzle!.id}/solve/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ moves: puzzle!.solution_moves }),
      });
    } catch {}
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-6xl">♟</motion.div>
      <p className="text-zinc-500 text-sm">{tr.puzzle_loading}</p>
    </div>
  );

  if (!puzzle) return null;

  const diffColor  = DIFF_COLORS[puzzle.difficulty] ?? "#00AFCA";
  const playerTurn = game.turn() === "w" ? tr.puzzle_turn_white : tr.puzzle_turn_black;
  const hintsLeft  = puzzle.hints.length - 1 - hintIndex;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#D4AF37" }}>
              {tr.puzzle_label}
            </p>
            <h1 className="text-3xl font-black">{puzzle.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${diffColor}15`, color: diffColor }}>
              {puzzle.difficulty_display}
            </span>
            <span className="text-zinc-500 text-sm">⭐ {puzzle.rating} ELO</span>
            <button
              onClick={() => nextPuzzle()}
              title={tr.puzzle_refresh}
              className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
            >
              🔄
            </button>
          </div>
        </div>
        <p className="text-zinc-500 text-xs mb-4">
          {tr.puzzle_themes} <span style={{ color: "#00AFCA" }}>{puzzle.themes || "Тактика"}</span>
        </p>

        <KazakhDivider color="#D4AF37" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Chessboard */}
          <div className="lg:col-span-3">
            <div
              key={puzzle.id}
              className="rounded-2xl overflow-hidden border p-3 transition-all duration-300"
              style={{
                backgroundColor: "#0d1117",
                borderColor: result === "correct" ? "rgba(34,197,94,0.5)"
                  : result === "wrong" ? "rgba(239,68,68,0.4)"
                  : "rgba(0,175,202,0.2)",
                boxShadow: result === "correct" ? "0 0 40px rgba(34,197,94,0.15)"
                  : result === "wrong" ? "0 0 40px rgba(239,68,68,0.1)"
                  : "0 0 40px rgba(0,175,202,0.08)",
              }}
            >
              {!result && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor: game.turn() === "w" ? "#fff" : "#222",
                      borderColor:     game.turn() === "w" ? "#ccc" : "#888",
                    }}
                  />
                  <span className="text-xs font-bold text-zinc-400">
                    {tr.puzzle_move} {playerTurn}
                  </span>
                  <span className="text-xs text-zinc-600">
                    ({moveIndex}/{puzzle.solution_moves.length})
                  </span>
                </div>
              )}

              <Chessboard
                options={{
                  position: game.fen(),
                  onSquareClick: ({ square }) => onSquareClick(square as Square),
                  onPieceDrop: ({ sourceSquare, targetSquare }) =>
                    targetSquare ? onPieceDrop(sourceSquare as Square, targetSquare as Square) : false,
                  squareStyles: getSquareStyles(),
                  boardOrientation: puzzle.fen.split(" ")[1] === "b" ? "black" : "white",
                  boardStyle: { borderRadius: "12px", overflow: "hidden" },
                  darkSquareStyle:  { backgroundColor: "#1a3a2a" },
                  lightSquareStyle: { backgroundColor: "#4a7c59" },
                  allowDrawingArrows: true,
                }}
              />
            </div>

            {/* Result panel */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-2xl text-center"
                  style={{
                    backgroundColor: result === "correct" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${result === "correct" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}
                >
                  <p className="text-3xl mb-1">{result === "correct" ? "🏆" : "💀"}</p>
                  <p className="font-black text-lg" style={{ color: result === "correct" ? "#22c55e" : "#ef4444" }}>
                    {result === "correct" ? tr.puzzle_solved : tr.puzzle_failed}
                  </p>
                  {result === "correct" && asyqsEarned > 0 && (
                    <p className="text-sm text-zinc-400 mt-1">
                      +{asyqsEarned} Асыков · {ratingChange && ratingChange > 0 ? `+${ratingChange}` : ratingChange} рейтинг
                    </p>
                  )}
                  {result === "wrong" && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Решение: {puzzle.solution_moves.join(" → ")}
                    </p>
                  )}
                  <button
                    onClick={nextPuzzle}
                    className="mt-3 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
                  >
                    {tr.puzzle_next}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Already solved */}
            {puzzle.solved_by_me && !result && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-sm font-bold text-green-400">{tr.puzzle_solved_today}</p>
              </div>
            )}

            {/* AI Advisor */}
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.2)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤖</span>
                <p className="font-black text-sm" style={{ color: "#D4AF37" }}>{tr.puzzle_advisor}</p>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={botMsg}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-zinc-300 text-sm leading-relaxed"
                >
                  {botMsg}
                </motion.p>
              </AnimatePresence>

              {/* Hint button — always visible */}
              {!result && puzzle.hints.length > 0 && (
                <button
                  onClick={showHint}
                  disabled={hintsLeft < 0}
                  className="mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                  style={{
                    backgroundColor: "rgba(212,175,55,0.08)",
                    color: "#D4AF37",
                    border: "1px solid rgba(212,175,55,0.2)",
                  }}
                >
                  {hintIndex < 0 ? tr.puzzle_hint : `${tr.puzzle_hint_more} (${hintsLeft})`}
                </button>
              )}
            </div>

            {/* Progress */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}>
              <p className="text-xs text-zinc-500 mb-3 font-bold uppercase tracking-widest">{tr.puzzle_progress}</p>
              <div className="flex gap-2 flex-wrap">
                {puzzle.solution_moves.filter((_, i) => i % 2 === 0).map((_, i) => {
                  const stepsDone = Math.floor(moveIndex / 2);
                  const done      = i < stepsDone;
                  const current   = i === stepsDone && !result;
                  return (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all"
                      style={{
                        backgroundColor: done ? "rgba(34,197,94,0.2)" : current ? "rgba(0,175,202,0.2)" : "rgba(255,255,255,0.04)",
                        color: done ? "#22c55e" : current ? "#00AFCA" : "#52525b",
                        border: `1px solid ${done ? "rgba(34,197,94,0.4)" : current ? "rgba(0,175,202,0.4)" : "transparent"}`,
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reward */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}>
              <p className="text-xs text-zinc-500 mb-3 font-bold uppercase tracking-widest">{tr.puzzle_reward}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black" style={{ color: "#D4AF37" }}>+20</p>
                  <p className="text-xs text-zinc-500">{tr.puzzle_asyqs}</p>
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: "#00AFCA" }}>+8</p>
                  <p className="text-xs text-zinc-500">{tr.puzzle_rating}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
