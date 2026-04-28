"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { TRANSLATIONS, type Lang } from "@/lib/translations";
import { AuthModals } from "@/components/auth/AuthModals";

const LANGS: Lang[] = ["RU", "KZ", "EN"];

const NAV_LINKS = [
  { href: "/",        key: "nav_home",    icon: "🏠" },
  { href: "/game",    key: "nav_play",    icon: "♟" },
  { href: "/kundeli", key: "nav_batyr",   icon: "🏹" },
  { href: "/bilim",   key: "nav_learn",   icon: "📜" },
  { href: "/store",   key: "nav_shop",    icon: "🛍️" },
  { href: "/profile", key: "nav_profile", icon: "👤" },
] as const;

const AVATAR_EMOJIS: Record<string, string> = {
  sarbaz: "⚔️", batyr: "🏹", khan: "👑",
  princess: "🌸", berkut: "🦅", tulpar: "🐴",
};

function getOrUpdateStreak(): number {
  try {
    const today     = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
    const raw   = localStorage.getItem("steppechess_streak");
    const saved: { date: string; count: number } = raw
      ? JSON.parse(raw)
      : { date: "", count: 0 };
    if (saved.date === today) return saved.count;
    const newCount = saved.date === yesterday ? saved.count + 1 : 1;
    localStorage.setItem("steppechess_streak", JSON.stringify({ date: today, count: newCount }));
    return newCount;
  } catch { return 1; }
}

export function AppNav() {
  const pathname = usePathname();
  const { isLoggedIn, user, logout, loading } = useAuth();
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState("♟");
  const [displayName, setDisplayName] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("steppechess_profile") ?? "{}");
      if (saved.avatarKey && AVATAR_EMOJIS[saved.avatarKey]) setAvatarEmoji(AVATAR_EMOJIS[saved.avatarKey]);
      if (saved.displayName) setDisplayName(saved.displayName);
    } catch {}
    setStreak(getOrUpdateStreak());
  }, [isLoggedIn]);

  const shownName = displayName || user?.username || "";

  return (
    <>
      <nav
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ backgroundColor: "rgba(9,9,11,0.92)", borderColor: "rgba(0,175,202,0.15)" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">♟</span>
          <span className="font-black text-lg tracking-tight hidden sm:block">
            Steppe<span style={{ color: "#00AFCA" }}>Chess</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  color:           active ? "#00AFCA" : "#71717a",
                  backgroundColor: active ? "rgba(0,175,202,0.1)" : "transparent",
                }}
              >
                <span>{l.icon}</span>
                <span className="hidden sm:block">{t[l.key]}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: lang + streak + auth */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language switcher */}
          <div
            className="hidden md:flex items-center rounded-lg overflow-hidden border text-[10px] font-bold"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-2 py-1 transition-colors"
                style={{
                  backgroundColor: lang === l ? "rgba(0,175,202,0.15)" : "transparent",
                  color:           lang === l ? "#00AFCA" : "#52525b",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Streak badge */}
          {streak > 0 && (
            <div
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
              style={{ backgroundColor: "rgba(249,115,22,0.12)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.2)" }}
            >
              🔥 {streak}
            </div>
          )}

          {!loading && (
            isLoggedIn && user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-zinc-800/60"
                >
                  <span>{avatarEmoji}</span>
                  <span className="hidden sm:block text-zinc-300">{shownName}</span>
                  <span className="font-bold" style={{ color: "#D4AF37" }}>{user.asyqs} 🪙</span>
                </Link>
                {!user.is_pro && (
                  <Link
                    href="/upgrade"
                    className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all hover:opacity-80 hidden sm:block"
                    style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)", color: "#09090b" }}
                  >
                    Sultan ✦
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {t.nav_logout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthModal("login")}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border transition-all hover:border-zinc-500 hover:text-white"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "#a1a1aa" }}
                >
                  {t.nav_login}
                </button>
                <button
                  onClick={() => setAuthModal("register")}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
                >
                  {t.nav_register}
                </button>
                <Link
                  href="/upgrade"
                  className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all hover:opacity-80 hidden sm:block"
                  style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)", color: "#09090b" }}
                >
                  Sultan ✦
                </Link>
              </>
            )
          )}
        </div>
      </nav>

      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitchMode={setAuthModal}
      />
    </>
  );
}
