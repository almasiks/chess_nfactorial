"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameProvider, useGame } from "@/context/GameProvider";
import { ChessBoard } from "@/components/game/ChessBoard";
import { PlayerCard } from "@/components/game/PlayerCard";
import { MoveHistory } from "@/components/game/MoveHistory";
import { DeepWorkPanel } from "@/components/game/DeepWorkPanel";
import { CoinBalance } from "@/components/game/CoinBalance";
import { AICoachPanel } from "@/components/game/AICoachPanel";
import { Button } from "@/components/ui/button";
import { useBotMove, type BotDifficulty } from "@/hooks/useBotMove";
import type { MoveRecord } from "@/types/game";
import Link from "next/link";

// ─── Captured pieces ──────────────────────────────────────────────────────────
const WHITE_ICONS: Record<string, string> = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" };
const BLACK_ICONS: Record<string, string> = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" };
const PIECE_VALUE: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
const SORT_ORDER = ["q", "r", "b", "n", "p"];

function CapturedPieces({ moves, capturedBy }: { moves: MoveRecord[]; capturedBy: "w" | "b" }) {
  const icons = capturedBy === "w" ? BLACK_ICONS : WHITE_ICONS;
  const captured = moves
    .filter(m => m.color === capturedBy && m.captured)
    .map(m => m.captured!)
    .sort((a, b) => SORT_ORDER.indexOf(a) - SORT_ORDER.indexOf(b));

  const advantage = captured.reduce((sum, p) => sum + (PIECE_VALUE[p] ?? 0), 0);

  if (!captured.length) return <div className="h-5" />;

  return (
    <div className="flex items-center gap-1 px-1 min-h-[20px]">
      <span className="text-sm leading-none opacity-60 flex flex-wrap gap-[1px]">
        {captured.map((p, i) => <span key={i}>{icons[p] ?? "?"}</span>)}
      </span>
      {advantage > 0 && (
        <span className="text-[10px] font-bold text-zinc-500 ml-1">+{advantage}</span>
      )}
    </div>
  );
}

// ─── Game mode types ──────────────────────────────────────────────────────────
type GameMode = "bot_easy" | "bot_medium" | "bot_hard" | "online" | "friend" | "local";

// ─── Mode selection screen ────────────────────────────────────────────────────
function GameModeSelect({ onSelect }: { onSelect: (m: GameMode) => void }) {
  const [botExpanded, setBotExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="text-2xl">♟</span>
          <span className="font-black text-xl">
            Steppe<span style={{ color: "#00AFCA" }}>Chess</span>
          </span>
        </Link>
        <h1 className="text-4xl font-black text-white mb-2">Выбери режим игры</h1>
        <p className="text-zinc-500 text-sm">Один из трёх путей батыра</p>
      </motion.div>

      {/* Cards */}
      <div className="w-full max-w-lg space-y-4">

        {/* Online */}
        <motion.button
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => onSelect("online")}
          className="w-full p-6 rounded-2xl border text-left transition-all group hover:scale-[1.02]"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.25)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,175,202,0.6)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,175,202,0.25)"; }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🌐</span>
            <div>
              <p className="font-black text-white text-lg">Играть онлайн</p>
              <p className="text-zinc-500 text-sm">Рейтинговый матч с реальным соперником</p>
            </div>
            <span className="ml-auto text-zinc-700 group-hover:text-zinc-400 text-xl">→</span>
          </div>
        </motion.button>

        {/* Bot */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setBotExpanded((v) => !v)}
            className="w-full p-6 rounded-2xl border text-left transition-all group hover:scale-[1.01]"
            style={{
              backgroundColor: "#0d1117",
              borderColor: botExpanded ? "rgba(212,175,55,0.6)" : "rgba(212,175,55,0.25)",
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🤖</span>
              <div>
                <p className="font-black text-white text-lg">Играть с ботом</p>
                <p className="text-zinc-500 text-sm">Выбери сложность противника</p>
              </div>
              <span className="ml-auto text-zinc-400 text-xl transition-transform" style={{ transform: botExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>→</span>
            </div>
          </button>

          <AnimatePresence>
            {botExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {([
                    { mode: "bot_easy"   as GameMode, label: "Лёгкий",  icon: "🐢", desc: "Случайные ходы",         color: "#22c55e" },
                    { mode: "bot_medium" as GameMode, label: "Средний", icon: "⚔️", desc: "Предпочитает взятия",     color: "#00AFCA" },
                    { mode: "bot_hard"   as GameMode, label: "Сложный", icon: "🔥", desc: "Минимакс-оценка позиции", color: "#D4AF37" },
                  ]).map((d) => (
                    <button
                      key={d.mode}
                      onClick={() => onSelect(d.mode)}
                      className="p-4 rounded-xl border text-center transition-all hover:scale-[1.04]"
                      style={{ backgroundColor: "#0d1117", borderColor: `${d.color}33` }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${d.color}88`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${d.color}33`; }}
                    >
                      <p className="text-2xl mb-1">{d.icon}</p>
                      <p className="font-black text-sm" style={{ color: d.color }}>{d.label}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Friend */}
        <motion.button
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => onSelect("friend")}
          className="w-full p-6 rounded-2xl border text-left transition-all group hover:scale-[1.02]"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(129,140,248,0.25)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(129,140,248,0.6)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(129,140,248,0.25)"; }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">👥</span>
            <div>
              <p className="font-black text-white text-lg">Играть с другом</p>
              <p className="text-zinc-500 text-sm">QR-код или ссылка-приглашение</p>
            </div>
            <span className="ml-auto text-zinc-700 group-hover:text-zinc-400 text-xl">→</span>
          </div>
        </motion.button>

        {/* Local */}
        <motion.button
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelect("local")}
          className="w-full p-6 rounded-2xl border text-left transition-all group hover:scale-[1.02]"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.25)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,175,202,0.6)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,175,202,0.25)"; }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🤝</span>
            <div>
              <p className="font-black text-white text-lg">За одним экраном</p>
              <p className="text-zinc-500 text-sm">Два игрока на одном устройстве</p>
            </div>
            <span className="ml-auto text-zinc-700 group-hover:text-zinc-400 text-xl">→</span>
          </div>
        </motion.button>
      </div>

      {/* Tip */}
      <p className="text-zinc-700 text-xs mt-10">
        🏹 После победы над ботом — попробуй <Link href="/kundeli" className="underline hover:text-zinc-500">Батыр сынағы</Link>
      </p>
    </div>
  );
}

// ─── Online stub ──────────────────────────────────────────────────────────────
function OnlineStub({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <p className="text-6xl mb-4">🌐</p>
        <h2 className="text-2xl font-black text-white mb-2">Поиск соперников...</h2>
        <p className="text-zinc-500 text-sm mb-8">
          Сервер ещё пустой — скоро здесь будут тысячи игроков Степи!
        </p>
        <div className="flex gap-2 justify-center mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.4 }}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#00AFCA" }}
            />
          ))}
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-zinc-800"
          style={{ borderColor: "rgba(0,175,202,0.3)", color: "#00AFCA" }}
        >
          ← Назад
        </button>
      </motion.div>
    </div>
  );
}

// ─── Friend invite stub ───────────────────────────────────────────────────────
function FriendStub({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-6xl mb-4">👥</p>
        <h2 className="text-2xl font-black text-white mb-2">Играть с другом</h2>
        <p className="text-zinc-500 text-sm mb-6">
          Перейди в раздел «Играть с другом» для генерации QR-кода
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/play"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
          >
            Открыть QR-приглашение
          </Link>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl text-sm font-bold border transition-all hover:bg-zinc-800"
            style={{ borderColor: "rgba(0,175,202,0.3)", color: "#00AFCA" }}
          >
            ← Назад
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────
export default function GamePage() {
  const [mode, setMode] = useState<GameMode | null>(null);

  if (!mode) return <GameModeSelect onSelect={setMode} />;
  if (mode === "online") return <OnlineStub onBack={() => setMode(null)} />;
  if (mode === "friend") return <FriendStub onBack={() => setMode(null)} />;
  if (mode === "local")  return (
    <GameProvider>
      <LocalGameLayout onBack={() => setMode(null)} />
    </GameProvider>
  );

  const difficulty: BotDifficulty =
    mode === "bot_easy" ? "easy" : mode === "bot_medium" ? "medium" : "hard";

  return (
    <GameProvider>
      <GameLayout difficulty={difficulty} onBack={() => setMode(null)} />
    </GameProvider>
  );
}

// ─── Local (pass-and-play) layout ─────────────────────────────────────────────
const INITIAL_TIME = 600; // 10 minutes per side

function LocalGameLayout({ onBack }: { onBack: () => void }) {
  const { game, resetGame, resignGame, undoMove } = useGame();

  const [boardFlipped, setBoardFlipped] = useState(false);
  const [whiteTime, setWhiteTime]       = useState(INITIAL_TIME);
  const [blackTime, setBlackTime]       = useState(INITIAL_TIME);
  const [byTime, setByTime]             = useState(false);
  const resignRef = useRef(resignGame);
  resignRef.current = resignGame;

  useEffect(() => {
    if (game.status === "playing" && game.moveHistory.length === 0) {
      setWhiteTime(INITIAL_TIME); setBlackTime(INITIAL_TIME); setByTime(false);
    }
  }, [game.status, game.moveHistory.length]);

  useEffect(() => {
    if (game.status !== "playing") return;
    const id = setInterval(() => {
      if (game.currentTurn === "w") setWhiteTime(t => Math.max(0, t - 1));
      else setBlackTime(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [game.status, game.currentTurn]);

  useEffect(() => {
    if (game.status !== "playing") return;
    if (whiteTime === 0 || blackTime === 0) { setByTime(true); resignRef.current(); }
  }, [whiteTime, blackTime, game.status]);

  const p1 = { ...game.whitePlayer, timeLeft: whiteTime, username: "Игрок 1" };
  const p2 = { ...game.blackPlayer, timeLeft: blackTime, username: "Игрок 2" };
  // When flipped: black is shown at the bottom (p2 is "active bottom")
  const topPlayer    = boardFlipped ? p1 : p2;
  const bottomPlayer = boardFlipped ? p2 : p1;
  const topColor     = boardFlipped ? "w" : "b";
  const bottomColor  = boardFlipped ? "b" : "w";

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors">← Меню</button>
          <span className="font-black text-lg tracking-tight hidden sm:block">
            Steppe<span style={{ color: "#00AFCA" }}>Chess</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: "rgba(0,175,202,0.1)", color: "#00AFCA", border: "1px solid rgba(0,175,202,0.3)" }}>
            🤝 За одним экраном
          </span>
        </div>
        {game.status === "playing" && (
          <p className="text-xs font-bold" style={{ color: game.currentTurn === "w" ? "#e2e8f0" : "#374151" }}>
            Ход: {game.currentTurn === "w" ? "Игрок 1 (Белые)" : "Игрок 2 (Чёрные)"}
          </p>
        )}
      </header>

      {/* Main — mobile-first flex-col, desktop flex-row */}
      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 p-3 lg:p-6 overflow-auto">

        {/* Top player card (black by default, white if flipped) */}
        <div className="w-full lg:w-52 lg:self-center">
          <PlayerCard
            player={topPlayer}
            isActive={game.currentTurn === topColor && game.status === "playing"}
            isDeepWork={false}
          />
          <div className="mt-1">
            <CapturedPieces moves={game.moveHistory} capturedBy={topColor} />
          </div>
        </div>

        {/* Board column */}
        <div className="w-[95vw] sm:w-[85vw] lg:w-auto lg:flex-1 max-w-[560px]">
          <ChessBoard orientation={boardFlipped ? "black" : "white"} byTime={byTime} />

          {/* Check indicator */}
          {game.isCheck && game.status === "playing" && (
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: 3, duration: 0.4 }}
              className="text-center text-xs font-black text-red-400 mt-2"
            >
              ШАХ!
            </motion.p>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            <Button
              size="sm"
              onClick={() => setBoardFlipped(f => !f)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-700"
            >
              ⇄ Перевернуть доску
            </Button>
            <Button
              size="sm"
              onClick={resetGame}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-700"
            >
              Новая игра
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resignGame}
              disabled={game.status !== "playing"}
              className="border-zinc-700 text-zinc-400 hover:bg-red-950/40 hover:border-red-500/40 hover:text-red-400 text-xs"
            >
              Сдаться
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={undoMove}
              disabled={game.moveHistory.length < 1 || game.status === "finished"}
              className="border-zinc-700 text-zinc-400 hover:bg-indigo-950/40 hover:border-indigo-500/40 hover:text-indigo-300 text-xs"
            >
              ↩ Вернуть ход
            </Button>
          </div>
        </div>

        {/* Bottom player card (white by default, black if flipped) */}
        <div className="w-full lg:w-52 lg:self-center">
          <div className="mb-1">
            <CapturedPieces moves={game.moveHistory} capturedBy={bottomColor} />
          </div>
          <PlayerCard
            player={bottomPlayer}
            isActive={game.currentTurn === bottomColor && game.status === "playing"}
            isDeepWork={false}
            flipped
          />
        </div>
      </div>
    </div>
  );
}

// ─── Bot game layout ───────────────────────────────────────────────────────────

function GameLayout({
  difficulty,
  onBack,
}: {
  difficulty: BotDifficulty;
  onBack: () => void;
}) {
  const {
    game,
    pomodoro,
    deepWork,
    coinBalance,
    toggleDeepWork,
    toggleLoFi,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    resetGame,
    resignGame,
    makeMove,
    undoMove,
  } = useGame();

  const { getNextMove } = useBotMove();
  const botThinking = useRef(false);

  // ── Chess clocks ────────────────────────────────────────────────────────────
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [byTime, setByTime]       = useState(false);

  // Use a ref so the forfeit effect always sees the latest resignGame
  const resignRef = useRef(resignGame);
  resignRef.current = resignGame;

  // Reset clocks whenever a new game starts
  useEffect(() => {
    if (game.status === "playing" && game.moveHistory.length === 0) {
      setWhiteTime(INITIAL_TIME);
      setBlackTime(INITIAL_TIME);
      setByTime(false);
    }
  }, [game.status, game.moveHistory.length]);

  // Tick the active player's clock every second
  useEffect(() => {
    if (game.status !== "playing") return;
    const id = setInterval(() => {
      if (game.currentTurn === "w") {
        setWhiteTime(t => Math.max(0, t - 1));
      } else {
        setBlackTime(t => Math.max(0, t - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [game.status, game.currentTurn]);

  // Detect time forfeit
  useEffect(() => {
    if (game.status !== "playing") return;
    if (whiteTime === 0 || blackTime === 0) {
      setByTime(true);
      resignRef.current();
    }
  }, [whiteTime, blackTime, game.status]);

  // ── Bot move ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      game.status !== "playing" ||
      game.currentTurn !== "b" ||
      botThinking.current
    )
      return;

    botThinking.current = true;
    const delay = difficulty === "hard" ? 600 : difficulty === "medium" ? 500 : 400;

    const id = setTimeout(() => {
      const mv = getNextMove(game.fen, difficulty);
      if (mv) makeMove(mv.from, mv.to, mv.promotion);
      botThinking.current = false;
    }, delay);

    return () => {
      clearTimeout(id);
      botThinking.current = false;
    };
  }, [game.currentTurn, game.status, game.fen, difficulty, getNextMove, makeMove]);

  const DIFF_LABEL: Record<BotDifficulty, string> = {
    easy: "🐢 Лёгкий",
    medium: "⚔️ Средний",
    hard: "🔥 Сложный",
  };

  // Override timeLeft on player objects with live clock values
  const blackPlayer = { ...game.blackPlayer, timeLeft: blackTime };
  const whitePlayer = { ...game.whitePlayer, timeLeft: whiteTime };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      animate={{ backgroundColor: deepWork.isActive ? "#050507" : "#09090b" }}
      transition={{ duration: 0.8 }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!deepWork.zenMode && (
          <motion.header
            key="header"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors"
              >
                ← Меню
              </button>
              <span className="font-black text-lg tracking-tight">
                Steppe<span style={{ color: "#00AFCA" }}>Chess</span>
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}
              >
                Бот · {DIFF_LABEL[difficulty]}
              </span>
            </div>

            <CoinBalance balance={coinBalance} isDeepWork={false} />
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar */}
        <motion.aside
          layout
          animate={{ width: deepWork.zenMode ? 0 : undefined, opacity: deepWork.zenMode ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-64 shrink-0 flex flex-col gap-2 p-4 border-r border-zinc-800/60 overflow-hidden"
        >
          {/* Black (bot) — top */}
          <PlayerCard
            player={blackPlayer}
            isActive={game.currentTurn === "b" && game.status === "playing"}
            isDeepWork={deepWork.isActive}
          />
          <CapturedPieces moves={game.moveHistory} capturedBy="b" />

          {/* Controls */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={resetGame}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-700"
              >
                Новая игра
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resignGame}
                disabled={game.status !== "playing"}
                className="flex-1 border-zinc-700 text-zinc-400 hover:bg-red-950/40 hover:border-red-500/40 hover:text-red-400 text-xs"
              >
                Сдаться
              </Button>
            </div>

            {/* Undo — only meaningful in bot mode */}
            <Button
              size="sm"
              variant="outline"
              onClick={undoMove}
              disabled={game.moveHistory.length < 1 || game.status === "finished"}
              className="w-full border-zinc-700 text-zinc-400 hover:bg-indigo-950/40 hover:border-indigo-500/40 hover:text-indigo-300 text-xs"
            >
              ↩ Вернуть ход
            </Button>
          </div>

          <CapturedPieces moves={game.moveHistory} capturedBy="w" />
          {/* White (you) — bottom */}
          <PlayerCard
            player={whitePlayer}
            isActive={game.currentTurn === "w" && game.status === "playing"}
            isDeepWork={deepWork.isActive}
            flipped
          />

          {game.status === "playing" && (
            <div className="text-center">
              <p className="text-xs text-zinc-500">
                {game.currentTurn === "w" ? "Ваш ход" : "Бот думает..."}
              </p>
              {game.isCheck && (
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: 3, duration: 0.4 }}
                  className="text-xs font-bold text-red-400 mt-1"
                >
                  ШАХ!
                </motion.p>
              )}
            </div>
          )}
        </motion.aside>

        {/* Board */}
        <main className="flex-1 flex items-center justify-center p-6 min-w-0">
          <div className="w-full max-w-[560px]">
            <AnimatePresence>
              {deepWork.zenMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between mb-4"
                >
                  <button
                    onClick={toggleDeepWork}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    ← Выйти из Дзен
                  </button>
                  <CoinBalance balance={coinBalance} isDeepWork />
                </motion.div>
              )}
            </AnimatePresence>
            <ChessBoard byTime={byTime} />
          </div>
        </main>

        {/* Right sidebar */}
        <motion.aside
          layout
          animate={{ width: deepWork.zenMode ? 0 : undefined, opacity: deepWork.zenMode ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-64 shrink-0 flex flex-col gap-3 p-4 border-l border-zinc-800/60 overflow-hidden"
        >
          <DeepWorkPanel
            pomodoro={pomodoro}
            deepWork={deepWork}
            onToggle={toggleDeepWork}
            onToggleLoFi={toggleLoFi}
            onPause={pomodoro.isActive ? pausePomodoro : startPomodoro}
            onReset={resetPomodoro}
          />

          {/* AI Coach after game ends */}
          <AnimatePresence>
            {game.status === "finished" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AICoachPanel
                  result={game.result as "white" | "black" | "draw" | null}
                  moveCount={game.moveHistory.length}
                  isCheckmate={game.isCheckmate}
                  isStalemate={game.isStalemate}
                  byTime={byTime}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-h-0">
            <MoveHistory moves={game.moveHistory} isDeepWork={deepWork.isActive} />
          </div>

          {/* Leaderboard teaser */}
          <AnimatePresence>
            {!deepWork.isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Лидерборд
                  </h4>
                  <Link href="/leaderboard" className="text-xs" style={{ color: "#00AFCA" }}>
                    Все →
                  </Link>
                </div>
                {["AltynKhan #1", "SteppeBatyr #2", "NomadRider #3"].map((name, i) => (
                  <div key={name} className="flex items-center gap-2 py-1.5 text-xs">
                    <span className="text-zinc-600 w-4">{i + 1}.</span>
                    <span className="text-zinc-300 flex-1">{name.split(" ")[0]}</span>
                    <span className="font-mono" style={{ color: "#D4AF37" }}>
                      {2480 - i * 170}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      </div>
    </motion.div>
  );
}
