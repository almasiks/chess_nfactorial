"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";

const TERMS = [
  { kaz: "Шах",      ru: "Шах",       en: "Check",    desc: "Атака на короля противника. Он обязан ответить на угрозу." },
  { kaz: "Мат",      ru: "Мат",       en: "Checkmate", desc: "Позиция, когда шах нельзя отразить — игра окончена." },
  { kaz: "Пат",      ru: "Пат",       en: "Stalemate", desc: "Ход невозможен, но шаха нет — ничья." },
  { kaz: "Рокировка",ru: "Рокировка", en: "Castling",  desc: "Ход ладьи и короля одновременно для защиты короля." },
  { kaz: "Гамбит",   ru: "Гамбит",    en: "Gambit",   desc: "Жертва материала ради позиционного преимущества." },
  { kaz: "Вилка",    ru: "Вилка",     en: "Fork",     desc: "Фигура атакует двух противников одновременно." },
  { kaz: "Булавка",  ru: "Связка",    en: "Pin",      desc: "Фигура не может ходить, не открывая более ценную фигуру." },
  { kaz: "Цугцванг", ru: "Цугцванг",  en: "Zugzwang", desc: "Любой ход ухудшает позицию. Двигаться — вредно." },
];

const DEBUTS = [
  {
    name: "Сицилианская защита",
    moves: "1. e4 c5",
    icon: "🗡️",
    color: "#00AFCA",
    desc: "Острый и популярный дебют. Чёрные с первого хода борются за центр асимметрично — уклоняясь от симметрии.",
    tip: "Тулпар любит острые позиции — выбирай сицилку когда хочешь победить!",
  },
  {
    name: "Испанская партия",
    moves: "1. e4 e5 2. Кf3 Кc6 3. Сb5",
    icon: "⚔️",
    color: "#D4AF37",
    desc: "Классика открытых игр. Белые сразу давят на центр и развивают слона — долгосрочное давление.",
    tip: "Как Хан контролирует степь — постепенно, без спешки.",
  },
  {
    name: "Ферзевый гамбит",
    moves: "1. d4 d5 2. c4",
    icon: "🏹",
    color: "#818cf8",
    desc: "Белые жертвуют пешку c4 ради контроля центра. Позиционная, стратегическая игра.",
    tip: "Как Батыр жертвует скоростью ради силы — берёт позицию, а не пешку.",
  },
  {
    name: "Гамбит Эванса",
    moves: "1. e4 e5 2. Кf3 Кc6 3. Сc4 Сc5 4. b4!?",
    icon: "🔥",
    color: "#f97316",
    desc: "Романтический гамбит XIX века. Белые жертвуют пешку b4 для бурного развития.",
    tip: "Для Номада с огнём в душе — атака любой ценой!",
  },
];

export function BilikHub() {
  const [activeTab, setActiveTab] = useState<"terms" | "debuts">("terms");
  const [flipped, setFlipped]     = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>
          Хранилище мудрости
        </p>
        <h1 className="text-4xl font-black mb-2">Bilik — Знания</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Карточки терминов и уроки дебютов в стиле старинных казахских свитков.
        </p>

        <KazakhDivider color="#D4AF37" className="mb-8" />

        {/* Tabs */}
        <div
          className="flex p-1 rounded-xl mb-8 w-fit"
          style={{ backgroundColor: "#0d1117", border: "1px solid rgba(212,175,55,0.2)" }}
        >
          {[
            { id: "terms",  label: "📖 Термины" },
            { id: "debuts", label: "♟ Дебюты Ханов" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as "terms" | "debuts")}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: activeTab === t.id ? "rgba(212,175,55,0.15)" : "transparent",
                color: activeTab === t.id ? "#D4AF37" : "#71717a",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "terms" && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {TERMS.map((term, i) => (
                <motion.div
                  key={term.en}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setFlipped(flipped === i ? null : i)}
                  className="cursor-pointer p-5 rounded-2xl border transition-all hover:scale-[1.02] select-none"
                  style={{
                    backgroundColor: "#0d1117",
                    borderColor: flipped === i ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.12)",
                    boxShadow: flipped === i ? "0 0 24px rgba(212,175,55,0.1)" : "none",
                    minHeight: 120,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Scroll-like top border */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(90deg,transparent,#D4AF3766,transparent)" }}
                  />
                  <AnimatePresence mode="wait">
                    {flipped !== i ? (
                      <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="text-2xl font-black mb-1" style={{ color: "#D4AF37" }}>{term.kaz}</p>
                        <p className="text-zinc-500 text-xs">{term.en} · нажми чтобы открыть</p>
                      </motion.div>
                    ) : (
                      <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="text-sm font-bold text-white mb-2">{term.ru}</p>
                        <p className="text-zinc-400 text-sm leading-relaxed">{term.desc}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "debuts" && (
            <motion.div
              key="debuts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-xs text-zinc-500 mb-6">
                «Мудрость Ханов» — краткие уроки по ключевым дебютам шахматного наследия
              </p>
              {DEBUTS.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl border relative overflow-hidden"
                  style={{ backgroundColor: "#0d1117", borderColor: `${d.color}22` }}
                >
                  {/* Scroll lines */}
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                       style={{ background: `linear-gradient(90deg,transparent,${d.color}55,transparent)` }} />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5"
                       style={{ background: `linear-gradient(90deg,transparent,${d.color}33,transparent)` }} />

                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{d.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-white">{d.name}</h3>
                        <code
                          className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{ backgroundColor: `${d.color}15`, color: d.color }}
                        >
                          {d.moves}
                        </code>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-3">{d.desc}</p>
                      <div
                        className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs italic"
                        style={{ backgroundColor: `${d.color}0d`, color: d.color }}
                      >
                        <span className="shrink-0">💬</span>
                        <span>{d.tip}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
