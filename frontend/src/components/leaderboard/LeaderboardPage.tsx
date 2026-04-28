"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";
import { useLanguage } from "@/context/LanguageContext";
import { TRANSLATIONS } from "@/lib/translations";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface LeaderboardEntry {
  id: number;
  username: string;
  rating: number;
  asyqs: number;
  level: string;
  city: string;
  city_display: string;
  games_won: number;
}

type FilterKey = "almaty" | "qazaqstan" | "alem";

const LEVEL_COLORS: Record<string, string> = {
  nomad:  "#6b7280",
  sarbaz: "#00AFCA",
  batyr:  "#818cf8",
  khan:   "#D4AF37",
};

const LEVEL_LABELS: Record<string, string> = {
  nomad:  "Номад",
  sarbaz: "Сарбаз",
  batyr:  "Батыр",
  khan:   "Хан",
};

const RANK_STYLE: Record<number, { bg: string; color: string; icon: string }> = {
  1: { bg: "rgba(212,175,55,0.15)", color: "#D4AF37", icon: "🥇" },
  2: { bg: "rgba(160,160,160,0.1)", color: "#a0a0a0", icon: "🥈" },
  3: { bg: "rgba(176,105,44,0.1)",  color: "#b0692c", icon: "🥉" },
};

const DEMO_PLAYERS: LeaderboardEntry[] = [
  { id: 0,  username: "AlmasM",       rating: 2540, asyqs: 18500, level: "khan",  city: "almaty",   city_display: "Алматы",    games_won: 381 },
  { id: 1,  username: "AltynKhan",    rating: 2480, asyqs: 14200, level: "khan",  city: "almaty",   city_display: "Алматы",    games_won: 312 },
  { id: 2,  username: "SteppeBatyr",  rating: 2310, asyqs: 9800,  level: "khan",  city: "astana",   city_display: "Астана",    games_won: 241 },
  { id: 3,  username: "NomadRider",   rating: 2205, asyqs: 7600,  level: "batyr", city: "almaty",   city_display: "Алматы",    games_won: 198 },
  { id: 4,  username: "Sarbaz_kz",    rating: 2180, asyqs: 6100,  level: "batyr", city: "shymkent", city_display: "Шымкент",   games_won: 175 },
  { id: 5,  username: "QazaqKnight",  rating: 2044, asyqs: 4900,  level: "batyr", city: "almaty",   city_display: "Алматы",    games_won: 156 },
  { id: 6,  username: "TauKapshan",   rating: 1980, asyqs: 3800,  level: "sarbaz",city: "karaganda",city_display: "Қарағанды", games_won: 130 },
  { id: 7,  username: "AruakhFighter",rating: 1870, asyqs: 3100,  level: "sarbaz",city: "astana",   city_display: "Астана",    games_won: 108 },
  { id: 8,  username: "ZhuldyzCe",    rating: 1750, asyqs: 2400,  level: "sarbaz",city: "almaty",   city_display: "Алматы",    games_won: 87  },
  { id: 9,  username: "DalaNomad",    rating: 1620, asyqs: 1800,  level: "sarbaz",city: "atyrau",   city_display: "Атырау",    games_won: 62  },
  { id: 10, username: "NewWarrior",   rating: 1100, asyqs: 800,   level: "nomad", city: "almaty",   city_display: "Алматы",    games_won: 18  },
];

export function LeaderboardPage() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<FilterKey>("almaty");
  const [players, setPlayers]     = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]     = useState(false);

  const TABS: { key: FilterKey; label: string; icon: string }[] = [
    { key: "almaty",    label: t.lb_almaty, icon: "🏙️" },
    { key: "qazaqstan", label: t.lb_kz,     icon: "🦅" },
    { key: "alem",      label: t.lb_world,  icon: "🌍" },
  ];

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  async function fetchLeaderboard(filter: FilterKey) {
    setLoading(true);
    try {
      const url =
        filter === "alem" || filter === "qazaqstan"
          ? `${API}/api/users/leaderboard/`
          : `${API}/api/users/leaderboard/?city=${filter}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setPlayers(list.length > 0 ? list : getDemoData(filter));
    } catch {
      setPlayers(getDemoData(filter));
    } finally {
      setLoading(false);
    }
  }

  function getDemoData(filter: FilterKey): LeaderboardEntry[] {
    if (filter === "almaty") return DEMO_PLAYERS.filter((p) => p.city === "almaty");
    return DEMO_PLAYERS;
  }

  return (
    <div className="min-h-[80vh] max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>
          {t.lb_label}
        </p>
        <h1 className="text-4xl font-black mb-2">{t.lb_heading}</h1>
        <p className="text-zinc-400 text-sm mb-8">{t.lb_desc}</p>

        <KazakhDivider className="mb-6" />

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeTab === tab.key
                  ? "linear-gradient(135deg,#D4AF37,#b8962e)"
                  : "rgba(212,175,55,0.08)",
                color: activeTab === tab.key ? "#09090b" : "#D4AF37",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 px-5 mb-2">
          <div className="w-8 shrink-0" />
          <div className="w-10 shrink-0" />
          <p className="flex-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">{t.lb_player}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 w-16 text-right">ELO</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 w-16 text-right hidden sm:block">Асыки</p>
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl animate-pulse"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player, idx) => {
                  const rank       = idx + 1;
                  const rankStyle  = RANK_STYLE[rank];
                  const levelLabel = LEVEL_LABELS[player.level] ?? player.level;
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:scale-[1.01]"
                      style={{
                        backgroundColor: player.username === "AlmasM"
                          ? "rgba(0,175,202,0.06)"
                          : rankStyle?.bg ?? "#0d1117",
                        borderColor: player.username === "AlmasM"
                          ? "rgba(0,175,202,0.3)"
                          : rankStyle ? `${rankStyle.color}33` : "rgba(0,175,202,0.1)",
                      }}
                    >
                      <div className="w-8 text-center shrink-0">
                        {rankStyle ? (
                          <span className="text-xl">{rankStyle.icon}</span>
                        ) : (
                          <span className="text-zinc-500 font-bold text-sm">{rank}</span>
                        )}
                      </div>

                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm"
                        style={{
                          backgroundColor: `${LEVEL_COLORS[player.level] ?? "#6b7280"}22`,
                          color:           LEVEL_COLORS[player.level] ?? "#6b7280",
                          border:          `2px solid ${LEVEL_COLORS[player.level] ?? "#6b7280"}44`,
                        }}
                      >
                        {player.username.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white truncate">{player.username}</p>
                          {player.username === "AlmasM" && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: "rgba(0,175,202,0.15)", color: "#00AFCA" }}
                            >
                              {t.lb_creator}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">
                          <span style={{ color: LEVEL_COLORS[player.level] ?? "#6b7280" }}>
                            {levelLabel}
                          </span>
                          {player.city_display ? ` · ${player.city_display}` : ""}
                          {" · "}{player.games_won} {t.lb_wins}
                        </p>
                      </div>

                      <div className="text-right shrink-0 w-16">
                        <p className="font-black text-lg leading-none" style={{ color: rankStyle?.color ?? "#00AFCA" }}>
                          {player.rating}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">ELO</p>
                      </div>

                      <div className="text-right shrink-0 w-16 hidden sm:block">
                        <p className="font-bold text-sm" style={{ color: "#D4AF37" }}>
                          {player.asyqs.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">Асыков</p>
                      </div>
                    </motion.div>
                  );
                })}

                {players.length === 0 && (
                  <div className="text-center py-16 text-zinc-600">
                    <p className="text-5xl mb-4">🏕️</p>
                    <p className="text-sm">В этой категории пока нет игроков</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-5 rounded-2xl border text-center"
          style={{ borderColor: "rgba(0,175,202,0.2)", backgroundColor: "rgba(0,175,202,0.04)" }}
        >
          <p className="text-sm font-bold text-white mb-1">{t.lb_cta_title}</p>
          <p className="text-xs text-zinc-400 mb-4">{t.lb_cta_desc}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/game"
              className="px-5 py-2 rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
            >
              {t.lb_play}
            </Link>
            <Link
              href="/kundeli"
              className="px-5 py-2 rounded-lg text-xs font-bold"
              style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}
            >
              {t.lb_batyr}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
