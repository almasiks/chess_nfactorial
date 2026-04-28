"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ── Kazakh Levels ─────────────────────────────────────────────────────────────
const LEVELS = [
  {
    id: "nomad",
    title: "Номад",
    subtitle: "Начинающий",
    description: "Только начинаю путь в Великой Степи",
    detail: "Не умею играть — научи меня всему с нуля",
    icon: "🏕️",
    gradient: "from-amber-900/40 to-amber-800/20",
    border: "border-amber-700/40",
    accent: "text-amber-400",
    ring: "ring-amber-500/50",
    xp: "0–500 XP",
  },
  {
    id: "sarbaz",
    title: "Сарбаз",
    subtitle: "Воин Степи",
    description: "Знаю основы и правила сражения",
    detail: "Знаю как ходят фигуры, делаю первые тактические шаги",
    icon: "⚔️",
    gradient: "from-sky-900/40 to-sky-800/20",
    border: "border-sky-600/40",
    accent: "text-sky-400",
    ring: "ring-sky-500/50",
    xp: "500–2000 XP",
  },
  {
    id: "batyr",
    title: "Батыр",
    subtitle: "Герой Орды",
    description: "Владею тактикой и стратегией набегов",
    detail: "Знаю тактики, вилки, связки и основы дебютов",
    icon: "🦅",
    gradient: "from-indigo-900/40 to-indigo-800/20",
    border: "border-indigo-500/40",
    accent: "text-indigo-400",
    ring: "ring-indigo-500/50",
    xp: "2000–6000 XP",
  },
  {
    id: "khan",
    title: "Хан",
    subtitle: "Повелитель Степи",
    description: "Турнирный игрок, ведущий орду к победе",
    detail: "Играю на турнирах, изучаю теорию, знаю эндшпиль",
    icon: "👑",
    gradient: "from-yellow-900/40 to-yellow-800/20",
    border: "border-yellow-500/40",
    accent: "text-yellow-400",
    ring: "ring-yellow-500/50",
    xp: "6000+ XP",
  },
] as const;

// ── Kazakh Cities ─────────────────────────────────────────────────────────────
const CITIES = [
  { id: "almaty",          label: "Алматы" },
  { id: "astana",          label: "Астана" },
  { id: "shymkent",        label: "Шымкент" },
  { id: "karaganda",       label: "Қарағанды" },
  { id: "aktobe",          label: "Ақтөбе" },
  { id: "taraz",           label: "Тараз" },
  { id: "pavlodar",        label: "Павлодар" },
  { id: "ust_kamenogorsk", label: "Өскемен" },
  { id: "semey",           label: "Семей" },
  { id: "atyrau",          label: "Атырау" },
  { id: "other",           label: "Басқа қала" },
];

type Step = "level" | "city" | "done";

interface OnboardingData {
  level: string;
  city: string;
}

interface OnboardingFlowProps {
  onComplete?: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("level");
  const [selected, setSelected]   = useState<OnboardingData>({ level: "", city: "" });
  const [isLoading, setIsLoading] = useState(false);

  async function handleFinish() {
    setIsLoading(true);
    try {
      // POST /api/users/onboarding/
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/onboarding/`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(selected),
      });
      setStep("done");
      onComplete?.(selected);
      setTimeout(() => router.push("/game"), 1800);
    } catch {
      // continue anyway in dev
      setStep("done");
      setTimeout(() => router.push("/game"), 1800);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00AFCA]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="text-2xl font-black tracking-tight">
            <span style={{ color: "#00AFCA" }}>Chess</span>
            <span className="text-white">Flow</span>
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "level" && (
            <LevelStep
              key="level"
              selected={selected.level}
              onSelect={(level) => setSelected((p) => ({ ...p, level }))}
              onNext={() => setStep("city")}
            />
          )}
          {step === "city" && (
            <CityStep
              key="city"
              selected={selected.city}
              onSelect={(city) => setSelected((p) => ({ ...p, city }))}
              onBack={() => setStep("level")}
              onNext={handleFinish}
              isLoading={isLoading}
            />
          )}
          {step === "done" && <DoneStep key="done" level={selected.level} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────── Level Step ───────────────────────────────────────
function LevelStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: string;
  onSelect: (l: string) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          Кто ты в Великой Степи?
        </h1>
        <p className="text-zinc-400 text-sm">
          Выбери свой уровень — это поможет нам подобрать соперников и тренировки
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-8">
        {LEVELS.map((lvl, i) => (
          <motion.button
            key={lvl.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(lvl.id)}
            className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 bg-gradient-to-r ${lvl.gradient} ${lvl.border} ${
              selected === lvl.id
                ? `ring-2 ${lvl.ring} border-transparent`
                : "hover:border-white/20"
            }`}
          >
            <span className="text-3xl shrink-0">{lvl.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className={`font-bold text-lg ${lvl.accent}`}>{lvl.title}</span>
                <span className="text-zinc-400 text-xs">{lvl.subtitle}</span>
              </div>
              <p className="text-white text-sm font-medium">{lvl.description}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{lvl.detail}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-zinc-600 text-xs">{lvl.xp}</span>
              {selected === lvl.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1 w-5 h-5 rounded-full bg-white flex items-center justify-center ml-auto"
                >
                  <svg className="w-3 h-3 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={onNext}
        className="w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: selected ? "linear-gradient(135deg, #00AFCA, #0088a0)" : undefined,
          backgroundColor: selected ? undefined : "#27272a",
          color: "white",
        }}
      >
        Продолжить →
      </button>
    </motion.div>
  );
}

// ─────────────────────────── City Step ────────────────────────────────────────
function CityStep({
  selected,
  onSelect,
  onBack,
  onNext,
  isLoading,
}: {
  selected: string;
  onSelect: (c: string) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          Твой город?
        </h1>
        <p className="text-zinc-400 text-sm">
          Мы покажем тебя в городском лидерборде — борись за звание лучшего в своём городе
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {CITIES.map((city, i) => (
          <motion.button
            key={city.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(city.id)}
            className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
              selected === city.id
                ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {city.label}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-all font-medium"
        >
          ← Назад
        </button>
        <button
          disabled={!selected || isLoading}
          onClick={onNext}
          className="flex-1 py-4 rounded-xl font-bold text-base text-white transition-all disabled:opacity-40"
          style={{ background: selected ? "linear-gradient(135deg, #D4AF37, #b8962e)" : "#27272a" }}
        >
          {isLoading ? "Сохраняем..." : "Начать путь 🏇"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────── Done Step ────────────────────────────────────────
function DoneStep({ level }: { level: string }) {
  const lvl = LEVELS.find((l) => l.id === level);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.8 }}
        className="text-7xl mb-6"
      >
        {lvl?.icon ?? "♟"}
      </motion.div>
      <h2 className="text-3xl font-black text-white mb-2">
        Добро пожаловать, {lvl?.title}!
      </h2>
      <p className="text-zinc-400">
        Твой путь в Великой Степи начинается...
      </p>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.6, ease: "linear" }}
        className="h-1 bg-gradient-to-r from-[#00AFCA] to-[#D4AF37] rounded-full mt-8"
      />
    </motion.div>
  );
}
