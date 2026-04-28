"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";

/* ─── Термины ─────────────────────────────────────────────────────────────── */
const TERMS = [
  { kaz: "Шах",       en: "Check",     fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", desc: "Атака на короля противника. Он обязан ответить на угрозу.", tip: "Король белых атакован — нужно уйти, закрыться или взять фигуру." },
  { kaz: "Мат",       en: "Checkmate", fen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4", desc: "Позиция, когда шах нельзя отразить — игра окончена.", tip: "Чёрный король под шахом, нет ни одного легального хода." },
  { kaz: "Пат",       en: "Stalemate", fen: "8/8/8/8/8/8/6Q1/k6K b - - 0 1",   desc: "Ход невозможен, но шаха нет — ничья.", tip: "Ход чёрных, но у короля a1 нет легальных ходов и шаха нет — пат!" },
  { kaz: "Рокировка", en: "Castling",  fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5", desc: "Ход ладьи и короля одновременно для защиты короля.", tip: "Белые могут рокироваться в короткую сторону: Ke1-g1, Ra1 остаётся." },
  { kaz: "Вилка",     en: "Fork",      fen: "r1bq1b1r/pppp1kpp/2n2n2/4N3/3PP3/8/PPP2PPP/RNBQKB1R w KQ - 2 6",   desc: "Одна фигура атакует двух противников одновременно.", tip: "Конь на e5 атакует и короля на f7, и ферзя на d8." },
  { kaz: "Связка",    en: "Pin",       fen: "r1bqk2r/ppp2ppp/2nb1n2/3pp3/1b2P3/3P1N2/PPP1BPPP/RNBQK2R w KQkq - 2 6", desc: "Фигура не может ходить, не открывая более ценную фигуру.", tip: "Конь f3 связан — если он уйдёт, белый король окажется под шахом." },
  { kaz: "Гамбит",    en: "Gambit",    fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",    desc: "Жертва материала ради позиционного преимущества.", tip: "Ферзевый гамбит: белые предлагают пешку c4 ради контроля центра." },
  { kaz: "Цугцванг",  en: "Zugzwang",  fen: "8/8/p7/8/8/8/6k1/6K1 w - - 0 1",    desc: "Любой ход ухудшает позицию. Двигаться — вредно.", tip: "Белый король вынужден двигаться — любой ход уступает оппозицию." },
];

/* ─── Дебюты ─────────────────────────────────────────────────────────────── */
const DEBUTS = [
  {
    name: "Сицилианская защита",
    icon: "🗡️",
    color: "#00AFCA",
    steps: [
      { label: "1. e4",  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",           bot: "Белые занимают центр пешкой e4 — классическое начало!" },
      { label: "1... c5", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",          bot: "Хороший выбор! Чёрные борются за центр асимметрично — пешка c5 атакует d4." },
      { label: "2. Кf3",  fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",         bot: "Конь развивается на f3 — атакует d4 и e5. Классический ход Батыра!" },
      { label: "2... d6", fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",        bot: "Чёрные укрепляют центр. Позиция острая — жди сложной борьбы!" },
    ],
  },
  {
    name: "Испанская партия",
    icon: "⚔️",
    color: "#D4AF37",
    steps: [
      { label: "1. e4",   fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",            bot: "Классическое начало — e4 открывает линии для слона и ферзя." },
      { label: "1... e5", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",           bot: "Чёрные симметрично отвечают e5. Начинается открытая игра!" },
      { label: "2. Кf3",  fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",          bot: "Конь нападает на e5. Отличный выбор! Белые берут инициативу." },
      { label: "2... Кc6",fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",        bot: "Конь защищает пешку e5. Хороший выбор! Чёрные держат позицию." },
      { label: "3. Сb5",  fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",       bot: "Испанский слон! Он давит на коня c6, который защищает e5 — долгосрочное давление как у Хана." },
    ],
  },
  {
    name: "Ферзевый гамбит",
    icon: "🏹",
    color: "#818cf8",
    steps: [
      { label: "1. d4",  fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",             bot: "d4 — закрытое начало. Белые контролируют центр с d4." },
      { label: "1... d5",fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2",            bot: "Чёрные тоже занимают центр — симметричная борьба!" },
      { label: "2. c4",  fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",            bot: "Ферзевый гамбит! Белые предлагают пешку c4 ради контроля центра. Как Батыр жертвует позицией для победы!" },
    ],
  },
];

/* ─── Академия: фигуры ────────────────────────────────────────────────────── */
interface PieceDef {
  name: string;
  symbol: string;
  fen: string;
  square: string;
  moveSquares: string[];
  captureSquares: string[];
  desc: string;
  tip: string;
  color: string;
}

const ACADEMY_PIECES: PieceDef[] = [
  {
    name: "Пешка",
    symbol: "♙",
    fen: "k7/8/8/2p1p3/4P3/8/8/4K3 w - - 0 1",
    square: "e4",
    moveSquares: ["e5"],
    captureSquares: ["d5", "f5"],
    desc: "Душа шахмат. Ходит только вперёд — на одно поле, с начальной позиции на два. Бьёт по диагонали.",
    tip: "Размещай пешки на e4 и d4 — они контролируют центр. Пешка на последней линии превращается в ферзя!",
    color: "#22c55e",
  },
  {
    name: "Конь (Тулпар)",
    symbol: "♘",
    fen: "k7/8/8/8/4N3/8/8/4K3 w - - 0 1",
    square: "e4",
    moveSquares: ["d2", "f2", "c3", "g3", "c5", "g5", "d6", "f6"],
    captureSquares: [],
    desc: "Единственная фигура, способная перепрыгивать через другие. Ходит буквой «Г»: 2 клетки в одну сторону + 1 в другую.",
    tip: "Конь на краю доски теряет силу. Старайся держать его ближе к центру — с e4 он контролирует 8 клеток!",
    color: "#00AFCA",
  },
  {
    name: "Слон",
    symbol: "♗",
    fen: "k7/8/8/8/4B3/8/8/4K3 w - - 0 1",
    square: "e4",
    moveSquares: ["d3", "c2", "b1", "f3", "g2", "h1", "d5", "c6", "b7", "a8", "f5", "g6", "h7"],
    captureSquares: [],
    desc: "Двигается по диагоналям своего цвета. Дальнобойный юнит — контролирует длинные диагонали.",
    tip: "Слон всю игру остаётся на своём цвете. Имей двух слонов — они вместе контролируют все поля!",
    color: "#D4AF37",
  },
  {
    name: "Ладья",
    symbol: "♖",
    fen: "k7/8/8/8/4R3/8/8/4K3 w - - 0 1",
    square: "e4",
    moveSquares: ["e1", "e2", "e3", "e5", "e6", "e7", "e8", "a4", "b4", "c4", "d4", "f4", "g4", "h4"],
    captureSquares: [],
    desc: "Мощная фигура, ходит по вертикалям и горизонталям на любое расстояние. Участвует в рокировке.",
    tip: "Ставь ладью на открытые линии — там, где нет пешек. Две ладьи, поддерживающие друг друга, неуязвимы!",
    color: "#818cf8",
  },
  {
    name: "Ферзь",
    symbol: "♛",
    fen: "k7/8/8/8/4Q3/8/8/4K3 w - - 0 1",
    square: "e4",
    moveSquares: ["e1","e2","e3","e5","e6","e7","e8","a4","b4","c4","d4","f4","g4","h4","d3","c2","b1","f3","g2","h1","d5","c6","b7","a8","f5","g6","h7"],
    captureSquares: [],
    desc: "Самая сильная фигура. Сочетает мощь Ладьи и Слона — ходит в любом направлении на любое расстояние.",
    tip: "Не выводи ферзя слишком рано — его будут атаковать, теряя темп. Ферзь раскрывается в разгар битвы!",
    color: "#ef4444",
  },
  {
    name: "Король",
    symbol: "♔",
    fen: "k7/8/8/8/4K3/8/8/8 w - - 0 1",
    square: "e4",
    moveSquares: ["d3", "e3", "f3", "d4", "f4", "d5", "e5", "f5"],
    captureSquares: [],
    desc: "Главная фигура. Ходит на одну клетку в любом направлении. Его гибель означает конец игры.",
    tip: "В начале партии прячь короля за рокировкой. В эндшпиле король становится активной фигурой — выводи его вперёд!",
    color: "#D4AF37",
  },
];

/* ─── PieceAcademy ────────────────────────────────────────────────────────── */
function PieceAcademy() {
  const [selected, setSelected] = useState(0);
  const piece = ACADEMY_PIECES[selected];

  const squareStyles: Record<string, React.CSSProperties> = {
    [piece.square]: {
      backgroundColor: `${piece.color}30`,
      border: `3px solid ${piece.color}88`,
      borderRadius: "4px",
    },
  };
  piece.moveSquares.forEach(sq => {
    squareStyles[sq] = {
      background: `radial-gradient(circle, ${piece.color}55 28%, transparent 32%)`,
      borderRadius: "50%",
    };
  });
  piece.captureSquares.forEach(sq => {
    squareStyles[sq] = {
      background: `radial-gradient(circle, rgba(239,68,68,0.55) 60%, transparent 65%)`,
      borderRadius: "50%",
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: selector + theory */}
      <div className="lg:col-span-2 space-y-4">
        {/* Piece grid */}
        <div className="grid grid-cols-3 gap-3">
          {ACADEMY_PIECES.map((p, i) => (
            <motion.button
              key={p.name}
              onClick={() => setSelected(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl border text-center transition-all"
              style={{
                backgroundColor: selected === i ? `${p.color}12` : "#0d1117",
                borderColor: selected === i ? `${p.color}66` : `${p.color}20`,
                boxShadow: selected === i ? `0 0 24px ${p.color}18` : "none",
              }}
            >
              <p className="text-3xl mb-1">{p.symbol}</p>
              <p className="text-[11px] font-bold leading-tight" style={{ color: selected === i ? p.color : "#71717a" }}>
                {p.name.split(" ")[0]}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Theory */}
        <AnimatePresence mode="wait">
          <motion.div
            key={piece.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: "#0d1117", borderColor: `${piece.color}25` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{piece.symbol}</span>
              <p className="font-black text-sm" style={{ color: piece.color }}>{piece.name}</p>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-3">{piece.desc}</p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-500"
                 style={{ borderTop: `1px solid ${piece.color}15` }}>
              <span style={{ color: piece.color }}>●</span> ход
              {piece.captureSquares.length > 0 && (
                <><span className="text-red-500">●</span> взятие</>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Khan's Advisor */}
        <AnimatePresence mode="wait">
          <motion.div
            key={piece.name + "_tip"}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span>🤖</span>
              <span className="text-xs font-bold" style={{ color: "#00AFCA" }}>Советник Хана</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{piece.tip}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: board */}
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={piece.name}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#0d1117", borderColor: `${piece.color}28` }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: `${piece.color}18` }}>
              <p className="font-black text-sm" style={{ color: piece.color }}>
                Ходы фигуры: {piece.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Закрашенные клетки показывают возможные ходы
              </p>
            </div>
            <div className="p-3">
              <Chessboard
                options={{
                  position: piece.fen,
                  squareStyles,
                  boardStyle: { borderRadius: "10px", overflow: "hidden" },
                  darkSquareStyle: { backgroundColor: "#1a3a2a" },
                  lightSquareStyle: { backgroundColor: "#4a7c59" },
                  allowDragging: false,
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
type Tab = "terms" | "debuts" | "academy";

export function BilimHub() {
  const [activeTab, setActiveTab]   = useState<Tab>("terms");
  const [flipped, setFlipped]       = useState<number | null>(null);
  const [activeTerm, setActiveTerm] = useState<(typeof TERMS)[0] | null>(null);
  const [activeDebut, setActiveDebut] = useState(0);
  const [stepIdx, setStepIdx]       = useState(0);
  const [selectedSq, setSelectedSq] = useState<Square | null>(null);
  const [, setSqStyles]             = useState<Record<string, React.CSSProperties>>({});

  const debut = DEBUTS[activeDebut];
  const currentStep = debut.steps[stepIdx];

  function handleTermClick(i: number) {
    setFlipped(flipped === i ? null : i);
    setActiveTerm(flipped === i ? null : TERMS[i]);
    setSelectedSq(null);
  }

  const getTermSquareStyles = useCallback(() => {
    if (!selectedSq) return {};
    const g = new Chess(activeTerm?.fen ?? "start");
    const styles: Record<string, React.CSSProperties> = {
      [selectedSq]: { backgroundColor: "rgba(0,175,202,0.4)" },
    };
    try {
      g.moves({ square: selectedSq, verbose: true }).forEach((m) => {
        styles[m.to] = {
          background: g.get(m.to)
            ? "radial-gradient(circle, rgba(212,175,55,0.6) 60%, transparent 65%)"
            : "radial-gradient(circle, rgba(0,175,202,0.4) 28%, transparent 32%)",
          borderRadius: "50%",
        };
      });
    } catch { /* ignore */ }
    return styles;
  }, [selectedSq, activeTerm]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "terms",   label: "📖 Термины" },
    { id: "debuts",  label: "♟ Мудрость Ханов" },
    { id: "academy", label: "⚔️ Академия" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>Хранилище мудрости</p>
        <h1 className="text-4xl font-black mb-1">Академия Степи</h1>
        <p className="text-zinc-400 text-sm mb-6">Интерактивные уроки с визуализацией позиций на доске</p>
        <KazakhDivider color="#D4AF37" className="mb-8" />

        {/* Tabs */}
        <div className="flex p-1 rounded-xl mb-8 w-fit" style={{ backgroundColor: "#0d1117", border: "1px solid rgba(212,175,55,0.2)" }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setActiveTerm(null); setFlipped(null); setStepIdx(0); }}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
              style={{
                backgroundColor: activeTab === id ? "rgba(212,175,55,0.15)" : "transparent",
                color: activeTab === id ? "#D4AF37" : "#71717a",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── TERMS ─────────────────────────────────────────────────── */}
          {activeTab === "terms" && (
            <motion.div key="terms" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 grid grid-cols-2 gap-3 content-start">
                {TERMS.map((t, i) => (
                  <motion.div key={t.en} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => handleTermClick(i)}
                    className="cursor-pointer p-4 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.02] select-none"
                    style={{
                      backgroundColor: "#0d1117",
                      borderColor: flipped === i ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.12)",
                      boxShadow: flipped === i ? "0 0 20px rgba(212,175,55,0.1)" : "none",
                      minHeight: 90,
                    }}>
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg,transparent,#D4AF3755,transparent)" }} />
                    <AnimatePresence mode="wait">
                      {flipped !== i ? (
                        <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <p className="text-xl font-black mb-0.5" style={{ color: "#D4AF37" }}>{t.kaz}</p>
                          <p className="text-zinc-600 text-xs">{t.en}</p>
                        </motion.div>
                      ) : (
                        <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <p className="text-xs text-zinc-400 leading-snug">{t.desc}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {activeTerm ? (
                    <motion.div key={activeTerm.en} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.25)" }}>
                        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
                          <p className="font-black" style={{ color: "#D4AF37" }}>{activeTerm.kaz} — {activeTerm.en}</p>
                        </div>
                        <div className="p-3">
                          <Chessboard
                            options={{
                              position: activeTerm.fen,
                              onSquareClick: ({ square }) => {
                                const g = new Chess(activeTerm.fen);
                                const p = g.get(square as Square);
                                if (p) { setSelectedSq(square as Square); } else { setSelectedSq(null); setSqStyles({}); }
                              },
                              squareStyles: getTermSquareStyles(),
                              boardStyle: { borderRadius: "10px", overflow: "hidden" },
                              darkSquareStyle: { backgroundColor: "#1a3a2a" },
                              lightSquareStyle: { backgroundColor: "#4a7c59" },
                              allowDrawingArrows: true,
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>🤖</span>
                          <span className="text-xs font-bold" style={{ color: "#00AFCA" }}>Советник Хана</span>
                        </div>
                        <p className="text-zinc-300 text-sm">{activeTerm.tip}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-center text-zinc-600">
                      <p className="text-5xl mb-3">📜</p>
                      <p className="text-sm">Выбери термин — увидишь позицию на доске</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ─── DEBUTS ────────────────────────────────────────────────── */}
          {activeTab === "debuts" && (
            <motion.div key="debuts" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {DEBUTS.map((d, i) => (
                  <button key={d.name} onClick={() => { setActiveDebut(i); setStepIdx(0); }}
                    className="w-full text-left p-4 rounded-xl border transition-all"
                    style={{
                      backgroundColor: "#0d1117",
                      borderColor: activeDebut === i ? `${d.color}66` : `${d.color}18`,
                      boxShadow: activeDebut === i ? `0 0 20px ${d.color}12` : "none",
                    }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{d.icon}</span>
                      <div>
                        <p className="font-black text-sm" style={{ color: d.color }}>{d.name}</p>
                        <p className="text-xs text-zinc-500">{d.steps.length} шагов</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#0d1117", borderColor: `${debut.color}25` }}>
                  <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: `${debut.color}15` }}>
                    <span className="text-2xl">{debut.icon}</span>
                    <p className="font-black" style={{ color: debut.color }}>{debut.name}</p>
                  </div>
                  <div className="p-3">
                    <Chessboard
                      options={{
                        position: currentStep.fen,
                        boardStyle: { borderRadius: "10px", overflow: "hidden" },
                        darkSquareStyle: { backgroundColor: "#1a3a2a" },
                        lightSquareStyle: { backgroundColor: "#4a7c59" },
                        allowDragging: false,
                        allowDrawingArrows: true,
                      }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={stepIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border" style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>🤖</span>
                      <span className="text-xs font-bold" style={{ color: "#00AFCA" }}>Советник Хана</span>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">{currentStep.bot}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-2 flex-wrap">
                  {debut.steps.map((s, i) => (
                    <button key={i} onClick={() => setStepIdx(i)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
                      style={{
                        backgroundColor: stepIdx === i ? `${debut.color}20` : "rgba(255,255,255,0.03)",
                        color: stepIdx === i ? debut.color : "#52525b",
                        border: `1px solid ${stepIdx === i ? `${debut.color}44` : "transparent"}`,
                      }}>
                      {s.label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-all"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#71717a" }}>←</button>
                  <button onClick={() => setStepIdx(Math.min(debut.steps.length - 1, stepIdx + 1))} disabled={stepIdx === debut.steps.length - 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-all"
                    style={{ background: `linear-gradient(135deg,${debut.color},${debut.color}bb)`, color: "#fff" }}>→</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ACADEMY ───────────────────────────────────────────────── */}
          {activeTab === "academy" && (
            <motion.div key="academy" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <PieceAcademy />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
