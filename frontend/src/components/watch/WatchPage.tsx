"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";

const STREAMS = [
  {
    id: "chess24",
    title: "World Chess Championship 2025",
    channel: "Chess24",
    viewers: "14 200",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCp4E7FFIpJ70ajPMQiXiHOQ&autoplay=0",
    live: true,
    flag: "🌍",
  },
  {
    id: "levitov",
    title: "Levitov Chess — Ход Конём",
    channel: "Levitov Chess",
    viewers: "3 800",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCmDHDdA26D2OWpXlODhTeIA&autoplay=0",
    live: true,
    flag: "🇰🇿",
  },
  {
    id: "chessdotcom",
    title: "Speed Chess Championship",
    channel: "Chess.com",
    viewers: "9 100",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCuCA6I-NkwMHPm7QVhxOJVA&autoplay=0",
    live: true,
    flag: "🏆",
  },
];

const LIVE_GAMES = [
  { white: "АсанŪлы М.",  black: "Дарья К.", moves: 24, time: "5+3",  rating: "1840 vs 1790" },
  { white: "Тимур Б.",    black: "Алия С.",  moves: 11, time: "10+5", rating: "2100 vs 2050" },
  { white: "Номад_777",   black: "KhanX",    moves: 38, time: "3+2",  rating: "1550 vs 1610" },
  { white: "Степной_Хан", black: "Батыр_99", moves: 7,  time: "15+10",rating: "1920 vs 1880" },
];

export function WatchPage() {
  const [active, setActive] = useState(STREAMS[0]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#00AFCA" }}>
          Прямой эфир
        </p>
        <h1 className="text-4xl font-black mb-2">Смотреть</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Трансляции чемпионатов и партии игроков платформы в реальном времени.
        </p>

        <KazakhDivider className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden border mb-4"
              style={{ borderColor: "rgba(0,175,202,0.2)", backgroundColor: "#0d1117" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b"
                   style={{ borderColor: "rgba(0,175,202,0.1)" }}>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: "#22c55e" }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#22c55e" }} />
                  </span>
                  <span className="text-sm font-bold text-white">{active.title}</span>
                </div>
                <span className="text-xs text-zinc-400">{active.viewers} зрителей</span>
              </div>
              <div className="aspect-video bg-zinc-950 flex items-center justify-center">
                <iframe
                  src={active.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={active.title}
                />
              </div>
            </div>

            {/* Stream selector */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {STREAMS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    borderColor: active.id === s.id ? "#00AFCA" : "rgba(0,175,202,0.15)",
                    backgroundColor: active.id === s.id ? "rgba(0,175,202,0.1)" : "#0d1117",
                    color: active.id === s.id ? "#00AFCA" : "#71717a",
                  }}
                >
                  <span>{s.flag}</span>
                  <span>{s.channel}</span>
                  {s.live && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                      LIVE
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Live games */}
          <div>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: "#00AFCA" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#00AFCA" }} />
              </span>
              Live Now
            </h2>
            <div className="space-y-3">
              {LIVE_GAMES.map((g, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl border cursor-pointer hover:border-sky-500/40 transition-all"
                  style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.12)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{ backgroundColor: "rgba(0,175,202,0.1)", color: "#00AFCA" }}
                    >
                      {g.time}
                    </span>
                    <span className="text-xs text-zinc-500">{g.moves} ходов</span>
                  </div>
                  <p className="text-sm font-bold text-white">♙ {g.white}</p>
                  <p className="text-sm text-zinc-400">♟ {g.black}</p>
                  <p className="text-xs text-zinc-600 mt-1">{g.rating}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
