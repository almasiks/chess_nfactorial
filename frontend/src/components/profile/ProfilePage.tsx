"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";

type Tab = "overview" | "games" | "stats" | "friends" | "rewards" | "kaganates";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",  label: "Обзор",      icon: "👤" },
  { id: "games",     label: "Партии",     icon: "♟" },
  { id: "stats",     label: "Статистика", icon: "📊" },
  { id: "friends",   label: "Друзья",     icon: "⚔️" },
  { id: "rewards",   label: "Награды",    icon: "🏆" },
  { id: "kaganates", label: "Каганаты",   icon: "🏰" },
];

// Preset Kazakh hero avatars
const AVATARS = [
  { key: "sarbaz",    emoji: "⚔️", label: "Сарбаз"   },
  { key: "batyr",     emoji: "🏹", label: "Батыр"    },
  { key: "khan",      emoji: "👑", label: "Хан"      },
  { key: "princess",  emoji: "🌸", label: "Ханша"    },
  { key: "berkut",    emoji: "🦅", label: "Беркут"   },
  { key: "tulpar",    emoji: "🐴", label: "Тулпар"   },
];

const DEFAULT_PROFILE = {
  displayName: "ДемоИгрок",
  avatarKey:   "batyr",
  level:       "Батыр",
  levelColor:  "#818cf8",
  rating:      1840,
  asyqs:       350,
  xp:          3200,
  city:        "Алматы",
  is_pro:      false,
  registered:  "27 апр. 2026 г.",
  friends:     0,
  views:       0,
  games_played:  0,
  games_won:     0,
  games_drawn:   0,
};

const DEMO_GAMES = [
  { white: "ДемоИгрок", black: "KhanX",     result: "white_win", date: "27.04.2026", moves: 34, time: "10+5" },
  { white: "Степняк99",  black: "ДемоИгрок", result: "black_win", date: "27.04.2026", moves: 52, time: "5+3"  },
  { white: "ДемоИгрок", black: "Тулпар777", result: "draw",       date: "26.04.2026", moves: 78, time: "15+10" },
];

const REWARDS = [
  { icon: "🏹", name: "Первый Батыр сынағы", desc: "Решена первая ежедневная задача", date: "27.04.2026", color: "#D4AF37" },
  { icon: "⚔️", name: "Первая победа",        desc: "Выиграна первая партия",          date: "27.04.2026", color: "#00AFCA" },
  { icon: "🏕️", name: "Номад",                desc: "Начало пути в Великой Степи",     date: "27.04.2026", color: "#6b7280" },
];

const KAGANATES = [
  { name: "Казахстан Шахмат", members: 234, icon: "🇰🇿", color: "#00AFCA" },
  { name: "Алматы Клуб",      members: 89,  icon: "🏙️", color: "#D4AF37" },
];

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / Math.max(max, 1)) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-2 rounded-full"
          style={{ background: `linear-gradient(90deg,${color},${color}88)` }}
        />
      </div>
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────
function EditModal({
  displayName,
  avatarKey,
  onSave,
  onClose,
}: {
  displayName: string;
  avatarKey: string;
  onSave: (name: string, avatarKey: string) => void;
  onClose: () => void;
}) {
  const [name, setName]     = useState(displayName);
  const [avatar, setAvatar] = useState(avatarKey);

  function handleSave() {
    if (name.trim().length < 2) return;
    onSave(name.trim(), avatar);
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.3)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">Редактировать профиль</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">×</button>
        </div>

        {/* Current avatar preview */}
        <div className="flex justify-center mb-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: "rgba(0,175,202,0.08)", border: "2px solid rgba(0,175,202,0.3)" }}
          >
            {AVATARS.find((a) => a.key === avatar)?.emoji ?? "♟"}
          </div>
        </div>

        {/* Avatar grid */}
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Выбери героя</p>
        <div className="grid grid-cols-6 gap-2 mb-6">
          {AVATARS.map((a) => (
            <button
              key={a.key}
              onClick={() => setAvatar(a.key)}
              title={a.label}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:scale-110"
              style={{
                backgroundColor: avatar === a.key ? "rgba(0,175,202,0.15)" : "rgba(255,255,255,0.03)",
                border: `2px solid ${avatar === a.key ? "rgba(0,175,202,0.6)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-[9px] text-zinc-500 leading-none">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Display name */}
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Имя игрока</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors mb-5"
          style={{ borderColor: "rgba(0,175,202,0.25)" }}
          placeholder="Минимум 2 символа..."
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={name.trim().length < 2}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm font-bold border transition-all hover:bg-zinc-800"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#71717a" }}
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export function ProfilePage() {
  const [tab, setTab]             = useState<Tab>("overview");
  const [editOpen, setEditOpen]   = useState(false);
  const [displayName, setDisplayName] = useState(DEFAULT_PROFILE.displayName);
  const [avatarKey, setAvatarKey] = useState(DEFAULT_PROFILE.avatarKey);

  const p = { ...DEFAULT_PROFILE, displayName, avatarKey };
  const avatarEmoji = AVATARS.find((a) => a.key === avatarKey)?.emoji ?? "♟";

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("steppechess_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.avatarKey)   setAvatarKey(parsed.avatarKey);
      } catch { /* ignore */ }
    }
  }, []);

  function handleSave(name: string, key: string) {
    setDisplayName(name);
    setAvatarKey(key);
    localStorage.setItem("steppechess_profile", JSON.stringify({ displayName: name, avatarKey: key }));
  }

  return (
    <>
      <AnimatePresence>
        {editOpen && (
          <EditModal
            displayName={displayName}
            avatarKey={avatarKey}
            onSave={handleSave}
            onClose={() => setEditOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden mb-6"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.2)" }}
        >
          {/* Banner */}
          <div
            className="h-28 relative"
            style={{ background: "linear-gradient(135deg,rgba(0,175,202,0.3),rgba(212,175,55,0.2),rgba(9,9,11,0))" }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5"
                 style={{ background: "linear-gradient(90deg,transparent,#00AFCA,#D4AF37,transparent)" }} />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-4xl font-black cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: "#1a1a2e", borderColor: "#0d1117" }}
                  onClick={() => setEditOpen(true)}
                  title="Изменить аватар"
                >
                  {avatarEmoji}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-950"
                  style={{ backgroundColor: "#22c55e" }}
                />
              </div>
              <button
                onClick={() => setEditOpen(true)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style={{ border: "1px solid rgba(0,175,202,0.3)", color: "#00AFCA", backgroundColor: "rgba(0,175,202,0.06)" }}
              >
                ✏️ Редактировать
              </button>
            </div>

            {/* Name + badges */}
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">{displayName}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${p.levelColor}15`, color: p.levelColor }}>
                {p.level}
              </span>
              {p.is_pro && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                  Sultan ✦
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-sm mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
              Онлайн · {p.city}
            </p>
            <p className="text-zinc-600 text-xs mb-4">Дата регистрации: {p.registered}</p>

            <KazakhDivider className="mb-4" />

            {/* Counters */}
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                ["⭐", p.rating,  "Рейтинг"],
                ["🪙", p.asyqs,   "Асыков"],
                ["👥", p.friends, "Друзей"],
                ["👁",  p.views,  "Просмотров"],
              ].map(([icon, val, label]) => (
                <div key={String(label)}>
                  <p className="text-xl font-black text-white">{icon} {val}</p>
                  <p className="text-zinc-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div
          className="flex p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide gap-0.5"
          style={{ backgroundColor: "#0d1117", border: "1px solid rgba(0,175,202,0.12)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
              style={{
                backgroundColor: tab === t.id ? "rgba(0,175,202,0.15)" : "transparent",
                color: tab === t.id ? "#00AFCA" : "#71717a",
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}>
                  <p className="font-black text-sm text-zinc-400 uppercase tracking-widest">Прогрессия</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black" style={{ color: p.levelColor }}>{p.level}</p>
                      <p className="text-xs text-zinc-500">{p.xp} / 6000 XP до Хана</p>
                    </div>
                    <span className="text-5xl opacity-30">🦅</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.xp / 6000) * 100}%` }}
                      transition={{ duration: 1 }}
                      className="h-2 rounded-full"
                      style={{ background: `linear-gradient(90deg,${p.levelColor},${p.levelColor}88)` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-600">{6000 - p.xp} XP до следующего уровня</p>
                </div>

                <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.15)" }}>
                  <p className="font-black text-sm text-zinc-400 uppercase tracking-widest">Казна Асыков</p>
                  <p className="text-4xl font-black" style={{ color: "#D4AF37" }}>🪙 {p.asyqs}</p>
                  <p className="text-xs text-zinc-500">Заработано за задачи и победы</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[["Побед", p.games_won], ["Ничьих", p.games_drawn], ["Поражений", p.games_played - p.games_won - p.games_drawn]].map(([l, v]) => (
                      <div key={String(l)} className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                        <p className="font-black text-white">{v}</p>
                        <p className="text-zinc-600">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── GAMES ── */}
            {tab === "games" && (
              <div className="space-y-3">
                {DEMO_GAMES.map((g, i) => {
                  const isWin  = (g.result === "white_win" && g.white === displayName) || (g.result === "black_win" && g.black === displayName);
                  const isDraw = g.result === "draw";
                  const res    = isWin ? "Победа" : isDraw ? "Ничья" : "Поражение";
                  const resColor = isWin ? "#22c55e" : isDraw ? "#D4AF37" : "#ef4444";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between p-4 rounded-xl border"
                      style={{ backgroundColor: "#0d1117", borderColor: `${resColor}22` }}
                    >
                      <div>
                        <p className="font-bold text-white text-sm">♙ {g.white} vs ♟ {g.black}</p>
                        <p className="text-xs text-zinc-500">{g.date} · {g.time} · {g.moves} ходов</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black" style={{ backgroundColor: `${resColor}15`, color: resColor }}>
                        {res}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── STATS ── */}
            {tab === "stats" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}>
                  <p className="font-black text-sm text-zinc-400 uppercase tracking-widest mb-5">Результаты</p>
                  <StatBar label="Победы"    value={p.games_won}    max={Math.max(p.games_played, 1)} color="#22c55e" />
                  <StatBar label="Ничьи"     value={p.games_drawn}  max={Math.max(p.games_played, 1)} color="#D4AF37" />
                  <StatBar label="Поражения" value={Math.max(p.games_played - p.games_won - p.games_drawn, 0)} max={Math.max(p.games_played, 1)} color="#ef4444" />
                </div>
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.15)" }}>
                  <p className="font-black text-sm text-zinc-400 uppercase tracking-widest mb-5">Прогресс рейтинга</p>
                  <div className="space-y-2">
                    {[["Текущий", p.rating, "#00AFCA"], ["Пиковый", p.rating, "#D4AF37"], ["Начальный", 800, "#6b7280"]].map(([l, v, c]) => (
                      <div key={String(l)} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">{l}</span>
                        <span className="font-black" style={{ color: c as string }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── FRIENDS ── */}
            {tab === "friends" && (
              <EmptyState icon="⚔️" text="Друзей пока нет. Найди соперника на странице Играть с другом!" />
            )}

            {/* ── REWARDS ── */}
            {tab === "rewards" && (
              <div className="space-y-3">
                {REWARDS.map((r, i) => (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-4 rounded-xl border"
                    style={{ backgroundColor: "#0d1117", borderColor: `${r.color}22` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                         style={{ backgroundColor: `${r.color}15` }}>{r.icon}</div>
                    <div className="flex-1">
                      <p className="font-black text-white text-sm">{r.name}</p>
                      <p className="text-xs text-zinc-500">{r.desc}</p>
                    </div>
                    <span className="text-xs text-zinc-600">{r.date}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── KAGANATES ── */}
            {tab === "kaganates" && (
              <div className="space-y-4">
                <p className="text-zinc-500 text-sm mb-4">Каганаты — сообщества игроков платформы (аналог клубов).</p>
                {KAGANATES.map((k, i) => (
                  <motion.div
                    key={k.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between p-5 rounded-xl border"
                    style={{ backgroundColor: "#0d1117", borderColor: `${k.color}22` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{k.icon}</span>
                      <div>
                        <p className="font-black text-white">{k.name}</p>
                        <p className="text-xs text-zinc-500">{k.members} участников</p>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                      style={{ background: `linear-gradient(135deg,${k.color},${k.color}bb)`, color: "#fff" }}
                    >
                      Открыть
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-20 text-zinc-600">
      <p className="text-5xl mb-3">{icon}</p>
      <p className="text-sm">{text}</p>
    </div>
  );
}
