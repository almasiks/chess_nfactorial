"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type GameResult = "white" | "black" | "draw" | null;

interface Props {
  result: GameResult;
  moveCount?: number;
  isCheckmate?: boolean;
  isStalemate?: boolean;
  byTime?: boolean;
}

const WISDOM: Record<string, string[]> = {
  win: [
    "Превосходно! Твоя стратегия была точной. Ты контролировал центр и загнал противника в угол.",
    "Батыр сражается — Батыр побеждает! В этой партии ты принимал решительные решения.",
    "Терпение и твёрдость позиции привели к победе. Этот успех — плод твоей тактики.",
  ],
  loss: [
    "Здесь ты допустил ошибку. Вместо этого хода стоило контролировать центр конём (Тулпаром).",
    "Не унывай — Чингисхан тоже проигрывал первые битвы, прежде чем покорить мир. В следующей партии ты будешь сильнее.",
    "Не атакуй, пока не завершил мобилизацию сил. В первые 10 ходов безопасность — главная цель.",
  ],
  draw: [
    "Равный счёт — два батыра оказались равны по силе. Достойный результат!",
    "Пат — это признак умелой защиты. В следующей партии старайся сохранять контроль над ферзём.",
    "Прежде чем принимать сложные решения, ищи активный ход — это лучше ничьей.",
  ],
};

const TIPS = [
  "♟ Контролируй центр: клетки e4, d4, e5, d5 — это золотая территория.",
  "🏇 Выводи коня (Тулпара) на сильную позицию — нет лучшего маневра.",
  "🛡️ Не атакуй, пока не завершил мобилизацию сил — вожди не торопятся.",
  "⚡ Не выводи ферзя в начале партии — береги его для решающего сражения.",
  "🌙 Следи за игрой до конца — пешка превращается в ферзя!",
  "🔥 Рокировка — важнейший ход для защиты короля.",
  "🎯 Каждый ход должен быть частью большой стратегии.",
];

export function AICoachPanel({ result, moveCount = 0, isCheckmate, isStalemate, byTime }: Props) {
  const [typed, setTyped]   = useState("");
  const [wisdom, setWisdom] = useState("");
  const [tips, setTips]     = useState<string[]>([]);
  const [open, setOpen]     = useState(true);

  useEffect(() => {
    if (!result) return;
    const category = result === "white" ? "win" : result === "black" ? "loss" : "draw";
    const list = WISDOM[category];
    const chosen = list[Math.floor(Math.random() * list.length)];
    setWisdom(chosen);

    const shuffled = [...TIPS].sort(() => Math.random() - 0.5).slice(0, 3);
    setTips(shuffled);
    setOpen(true);
  }, [result]);

  // Typing effect
  useEffect(() => {
    if (!wisdom) return;
    setTyped("");
    let i = 0;
    const iv = setInterval(() => {
      if (i >= wisdom.length) { clearInterval(iv); return; }
      setTyped(wisdom.slice(0, i + 1));
      i++;
    }, 28);
    return () => clearInterval(iv);
  }, [wisdom]);

  if (!result || !open) return null;

  const category = result === "white" ? "win" : result === "black" ? "loss" : "draw";
  const labels = { win: "Победа! 🏆", loss: "Поражение 💪", draw: "Ничья 🤝" };
  const accent  = { win: "#D4AF37", loss: "#00AFCA", draw: "#6b7280" }[category];

  const endReason = isCheckmate ? "Матом" : isStalemate ? "Патом" : byTime ? "По времени" : "Сдачей";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "#0d1117", borderColor: `${accent}33` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧙</span>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: accent }}>
              ИИ-Наставник · Мудрость Кочевника
            </p>
            <p className="text-base font-black text-white">{labels[category]}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-zinc-600 hover:text-zinc-400 text-lg transition-colors leading-none"
        >
          ×
        </button>
      </div>

      {moveCount > 0 && (
        <p className="text-[10px] text-zinc-600 mb-3">
          {moveCount} ходов · {endReason}
        </p>
      )}

      {/* Wisdom with typing cursor */}
      <p className="text-sm text-zinc-300 mb-4 leading-relaxed min-h-[3.5rem]">
        {typed}
        <span className="inline-block w-0.5 h-3.5 bg-current animate-pulse ml-0.5 align-middle" style={{ color: accent }} />
      </p>

      {/* Tips */}
      <div className="space-y-2 border-t pt-3" style={{ borderColor: `${accent}22` }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
          Советы на следующую игру
        </p>
        {tips.map((tip, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.2 }}
            className="text-xs text-zinc-400 leading-relaxed"
          >
            {tip}
          </motion.p>
        ))}
      </div>

      <p className="text-[9px] text-zinc-700 mt-3">
        SteppeChess ИИ-Наставник · Демо-анализ · На основе Мудрости Степи™
      </p>
    </motion.div>
  );
}
