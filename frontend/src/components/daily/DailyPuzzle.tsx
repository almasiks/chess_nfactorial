"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Puzzle {
  id: number;
  fen: string;
  solution_moves: string[];
  themes: string;
  title: string;
  rating: number;
  difficulty: string;
  difficulty_display: string;
  solved_by_me: boolean;
}

const AI_HINTS: Record<number, string[]> = {
  0: [
    "Осмотри поле боя, как Хан осматривает степь — что угрожает твоему врагу?",
    "Твой Тулпар (Конь) может атаковать сразу несколько целей — ищи вилку!",
    "Сначала атакуй самую ценную цель. Шах заставляет короля двигаться.",
  ],
  1: [
    "Хороший ход! Теперь посмотри на открытые линии — они как степные дороги для ладьи.",
    "Твой противник вынужден отступать. Продолжай давление!",
    "Помни: мат в 2 часто требует точной последовательности, не торопись.",
  ],
  2: [
    "Финальный удар! Найди ход, который оставит короля без выхода.",
    "Все фигуры должны работать вместе — как войско Батыра.",
    "Это последний ход — после него Хан падёт!",
  ],
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   "#22c55e",
  medium: "#00AFCA",
  hard:   "#D4AF37",
};

export function DailyPuzzle() {
  const [puzzle, setPuzzle]       = useState<Puzzle | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [moveInput, setMoveInput] = useState("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [hintIdx, setHintIdx]     = useState(0);
  const [result, setResult]       = useState<"correct" | "wrong" | null>(null);
  const [asyqsEarned, setAasyqsEarned] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPuzzle();
  }, []);

  async function fetchPuzzle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/puzzles/daily/`);
      if (!res.ok) throw new Error("Сервер не отвечает");
      const data: Puzzle = await res.json();
      setPuzzle(data);
    } catch {
      setError("Не удалось загрузить задачу. Проверь подключение к серверу.");
    } finally {
      setLoading(false);
    }
  }

  const addMove = useCallback(() => {
    const m = moveInput.trim().toLowerCase();
    if (!m || moveHistory.includes(m)) return;
    const next = [...moveHistory, m];
    setMoveHistory(next);
    setMoveInput("");
    setHintIdx(Math.min(next.length, 2));
  }, [moveInput, moveHistory]);

  async function submitSolution() {
    if (!puzzle || moveHistory.length === 0) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const res = await fetch(`${API}/api/puzzles/${puzzle.id}/solve/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ moves: moveHistory }),
      });
      const data = await res.json();
      setResult(data.correct ? "correct" : "wrong");
      if (data.asyqs_awarded) setAasyqsEarned(data.asyqs_awarded);
    } catch {
      setResult("wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-5xl"
        >
          ♟
        </motion.div>
        <p className="text-zinc-500">Загружаем задачу Батыра...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-4xl">🏕️</p>
        <p className="text-zinc-400">{error}</p>
        <button
          onClick={fetchPuzzle}
          className="px-6 py-2 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!puzzle) return null;

  const currentHints = AI_HINTS[hintIdx] ?? AI_HINTS[2];
  const randomHint = currentHints[Math.floor(Math.random() * currentHints.length)];
  const diffColor = DIFFICULTY_COLORS[puzzle.difficulty] ?? "#00AFCA";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#D4AF37" }}>
              Ежедневная задача
            </p>
            <h1 className="text-4xl font-black">{puzzle.title || "Батыр сынағы"}</h1>
          </div>
          <div className="text-right">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: `${diffColor}15`, color: diffColor }}
            >
              {puzzle.difficulty_display}
            </span>
            <p className="text-zinc-500 text-xs mt-1">{puzzle.rating} ELO</p>
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-2">
          Темы: <span style={{ color: "#00AFCA" }}>{puzzle.themes || "Тактика"}</span>
        </p>

        <KazakhDivider color="#D4AF37" className="mb-8" />

        {/* Already solved */}
        {puzzle.solved_by_me && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-6"
            style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <span className="text-2xl">✅</span>
            <p className="text-sm font-bold text-green-400">Ты уже решил эту задачу сегодня! +20 Асыков начислено.</p>
          </div>
        )}

        {/* FEN display */}
        <div
          className="p-4 rounded-xl mb-6 font-mono text-xs text-zinc-400 break-all"
          style={{ backgroundColor: "#0d1117", border: "1px solid rgba(0,175,202,0.15)" }}
        >
          <span style={{ color: "#00AFCA" }}>FEN: </span>{puzzle.fen}
        </div>

        {/* Move input */}
        {!result && (
          <div className="mb-6">
            <p className="text-sm font-bold text-white mb-3">
              Введи ходы в UCI-нотации (например: <code className="text-sky-400">e2e4</code>):
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={moveInput}
                onChange={(e) => setMoveInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMove()}
                placeholder="e2e4..."
                className="flex-1 px-4 py-3 rounded-xl text-sm font-mono bg-zinc-900 border text-white outline-none focus:border-sky-500 transition-colors"
                style={{ borderColor: "rgba(0,175,202,0.25)" }}
              />
              <button
                onClick={addMove}
                className="px-5 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
              >
                +
              </button>
            </div>

            {/* Move history */}
            {moveHistory.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {moveHistory.map((m, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg font-mono text-sm"
                    style={{ backgroundColor: "rgba(0,175,202,0.1)", color: "#00AFCA" }}
                  >
                    {i + 1}. {m}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={submitSolution}
              disabled={moveHistory.length === 0 || submitting}
              className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}
            >
              {submitting ? "Проверяем..." : "⚔️ Отправить решение"}
            </button>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl text-center mb-6"
              style={{
                backgroundColor: result === "correct" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${result === "correct" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              <p className="text-4xl mb-2">{result === "correct" ? "🏆" : "💀"}</p>
              <p className="text-xl font-black mb-1" style={{ color: result === "correct" ? "#22c55e" : "#ef4444" }}>
                {result === "correct" ? "Маш! Правильно!" : "Неверно"}
              </p>
              {result === "correct" && asyqsEarned > 0 && (
                <p className="text-sm text-zinc-400">+{asyqsEarned} Асыков добавлено в твою казну!</p>
              )}
              {result === "wrong" && (
                <p className="text-sm text-zinc-400">
                  Правильный путь: {puzzle.solution_moves.join(" → ")}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Coach hints */}
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <p className="font-bold text-sm" style={{ color: "#D4AF37" }}>Советник Хана</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${hintIdx}-${randomHint}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-zinc-400 text-sm leading-relaxed italic"
            >
              "{randomHint}"
            </motion.p>
          </AnimatePresence>
          <div className="flex items-center gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setHintIdx(i)}
                className="text-xs px-3 py-1 rounded-lg transition-all"
                style={{
                  backgroundColor: hintIdx === i ? "rgba(212,175,55,0.2)" : "transparent",
                  color: hintIdx === i ? "#D4AF37" : "#52525b",
                  border: `1px solid ${hintIdx === i ? "rgba(212,175,55,0.4)" : "transparent"}`,
                }}
              >
                Шаг {i + 1}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
