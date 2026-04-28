"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface PlayerResult {
  id: number;
  username: string;
  rating: number;
  level: string;
  level_display: string;
}

const LEVEL_COLORS: Record<string, string> = {
  nomad:  "#6b7280",
  sarbaz: "#00AFCA",
  batyr:  "#818cf8",
  khan:   "#D4AF37",
};

type Tab = "search" | "qr";

export function PlayWithFriend() {
  const [tab, setTab]           = useState<Tab>("search");
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<PlayerResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [challenged, setChallenged] = useState<string | null>(null);
  const [token, setToken]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [quickRoomId, setQuickRoomId] = useState<string | null>(null);

  function generateQuickRoom() {
    const id = crypto.randomUUID();
    setQuickRoomId(id);
  }

  function getOrigin() {
    if (typeof window !== "undefined") return window.location.origin;
    return "http://localhost:3000";
  }

  async function search() {
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("steppechess_access") ?? "";
      const res = await fetch(`${API}/api/users/search/?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function sendChallenge(username: string) {
    const accessToken = localStorage.getItem("steppechess_access") ?? "";
    const res = await fetch(`${API}/api/users/friends/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ receiver_username: username }),
    });
    const data = await res.json();
    setChallenged(username);
    setToken(data.token ?? null);
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const challengeUrl = token ? `${getOrigin()}/game?challenge=${token}` : "";
  const quickRoomUrl = quickRoomId ? `${getOrigin()}/game?room=${quickRoomId}` : "";

  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#00AFCA" }}>
          Социальная игра
        </p>
        <h1 className="text-4xl font-black mb-2">Игра с другом</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Найди друга по имени пользователя или создай QR-код для быстрого приглашения.
        </p>

        <KazakhDivider className="mb-6" />

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {([["search", "🔍 Поиск соперника"], ["qr", "📱 Быстрый QR"]] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: tab === key ? "linear-gradient(135deg,#00AFCA,#0088a0)" : "rgba(0,175,202,0.08)",
                color: tab === key ? "#fff" : "#00AFCA",
                border: "1px solid rgba(0,175,202,0.2)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Tab: Search ───────────────────────────────────────────── */}
          {tab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
            >
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Введи имя пользователя..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors"
                  style={{ borderColor: "rgba(0,175,202,0.25)" }}
                />
                <button
                  onClick={search}
                  disabled={loading || query.trim().length < 2}
                  className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
                >
                  {loading ? "..." : "Найти"}
                </button>
              </div>

              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 mb-8"
                  >
                    {results.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-4 rounded-xl border"
                        style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.15)" }}
                      >
                        <div>
                          <p className="font-bold text-white">{p.username}</p>
                          <p className="text-xs" style={{ color: LEVEL_COLORS[p.level] ?? "#fff" }}>
                            {p.level_display} · {p.rating} ELO
                          </p>
                        </div>
                        <button
                          onClick={() => sendChallenge(p.username)}
                          className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-80"
                          style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
                        >
                          ⚔️ Вызвать
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {challenged && token && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl border text-center"
                    style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.3)" }}
                  >
                    <p className="text-2xl mb-2">⚔️</p>
                    <p className="font-bold text-white mb-1">Вызов отправлен!</p>
                    <p className="text-zinc-400 text-sm mb-6">
                      Ждём ответа от <span style={{ color: "#D4AF37" }}>{challenged}</span>
                    </p>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-2xl" style={{ backgroundColor: "#f8f8f8" }}>
                        <QRCodeSVG
                          value={challengeUrl}
                          size={160}
                          bgColor="#f8f8f8"
                          fgColor="#09090b"
                          level="M"
                        />
                      </div>
                    </div>
                    <p className="text-zinc-500 text-xs mb-4">Сканируй QR-код, чтобы присоединиться</p>

                    <div className="flex gap-2">
                      <code
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 truncate"
                        style={{ backgroundColor: "#1a1a2e" }}
                      >
                        {challengeUrl}
                      </code>
                      <button
                        onClick={() => copyLink(challengeUrl)}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{
                          background: copied ? "rgba(34,197,94,0.2)" : "rgba(212,175,55,0.15)",
                          color: copied ? "#22c55e" : "#D4AF37",
                          border: `1px solid ${copied ? "#22c55e44" : "#D4AF3744"}`,
                        }}
                      >
                        {copied ? "✓" : "Копировать"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {results.length === 0 && !challenged && (
                <div className="text-center py-16 text-zinc-600">
                  <p className="text-5xl mb-4">🏕️</p>
                  <p className="text-sm">Введи имя пользователя и нажми «Найти»</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Tab: Quick QR ─────────────────────────────────────────── */}
          {tab === "qr" && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="text-center"
            >
              {!quickRoomId ? (
                <div className="py-16">
                  <p className="text-5xl mb-6">📱</p>
                  <p className="text-white font-bold text-lg mb-2">Быстрый QR-матч</p>
                  <p className="text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
                    Создай уникальную игровую комнату — друг отсканирует QR-код и сразу присоединится.
                    Авторизация не нужна.
                  </p>
                  <button
                    onClick={generateQuickRoom}
                    className="px-8 py-4 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)", boxShadow: "0 8px 32px rgba(212,175,55,0.25)" }}
                  >
                    ✦ Создать комнату
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8"
                >
                  <p className="font-bold text-white text-lg mb-2">Комната готова!</p>
                  <p className="text-zinc-400 text-sm mb-6">
                    Друг отсканирует QR-код и присоединится к твоей игре
                  </p>

                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: "#f8f8f8" }}>
                      <QRCodeSVG
                        value={quickRoomUrl}
                        size={200}
                        bgColor="#f8f8f8"
                        fgColor="#09090b"
                        level="M"
                      />
                    </div>
                  </div>

                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="flex gap-2">
                      <code
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 truncate"
                        style={{ backgroundColor: "#1a1a2e" }}
                      >
                        {quickRoomUrl}
                      </code>
                      <button
                        onClick={() => copyLink(quickRoomUrl)}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{
                          background: copied ? "rgba(34,197,94,0.2)" : "rgba(0,175,202,0.15)",
                          color: copied ? "#22c55e" : "#00AFCA",
                          border: `1px solid ${copied ? "#22c55e44" : "rgba(0,175,202,0.3)"}`,
                        }}
                      >
                        {copied ? "✓" : "Копировать"}
                      </button>
                    </div>

                    <div
                      className="text-xs rounded-lg px-4 py-3"
                      style={{ backgroundColor: "rgba(0,175,202,0.08)", color: "#00AFCA", border: "1px solid rgba(0,175,202,0.2)" }}
                    >
                      Комната: {quickRoomId.slice(0, 8)}...
                    </div>

                    <button
                      onClick={() => setQuickRoomId(null)}
                      className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      Создать новую комнату
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
