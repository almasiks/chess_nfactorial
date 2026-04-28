"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppNav } from "@/components/shared/AppNav";
import { Footer } from "@/components/shared/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { TRANSLATIONS } from "@/lib/translations";

const STATS_NUMS = ["12 400+", "2.1M", "98 000"];

export default function LandingPage() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const STATS = [
    [STATS_NUMS[0], t.stat_players],
    [STATS_NUMS[1], t.stat_asyqs],
    [STATS_NUMS[2], t.stat_games],
  ];

  const FEATURES = [
    { icon: "⚔️", title: t.feat_friend_title, desc: t.feat_friend_desc, href: "/play",        accent: "#00AFCA" },
    { icon: "📜", title: t.feat_learn_title,  desc: t.feat_learn_desc,  href: "/bilim",       accent: "#D4AF37" },
    { icon: "🏹", title: t.feat_batyr_title,  desc: t.feat_batyr_desc,  href: "/kundeli",     accent: "#00AFCA" },
    { icon: "🏆", title: t.feat_leader_title, desc: t.feat_leader_desc, href: "/leaderboard", accent: "#D4AF37" },
  ];

  const TIERS = [
    { name: t.tier_nomad_name,  price: t.tier_nomad_price,  desc: t.tier_nomad_desc,  color: "#6b7280", popular: false },
    { name: t.tier_sultan_name, price: t.tier_sultan_price, desc: t.tier_sultan_desc, color: "#00AFCA", popular: true  },
    { name: t.tier_khan_name,   price: t.tier_khan_price,   desc: t.tier_khan_desc,   color: "#D4AF37", popular: false },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden flex flex-col">
      <AppNav />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
               style={{ backgroundColor: "#00AFCA" }} />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8"
               style={{ backgroundColor: "#D4AF37" }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 opacity-40"
             style={{ background: "linear-gradient(90deg,transparent,#00AFCA,#D4AF37,#00AFCA,transparent)" }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-4 tracking-tight">
            Steppe{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg,#00AFCA,#D4AF37)" }}
            >
              Chess
            </span>
          </h1>

          <p className="text-lg font-semibold mb-3" style={{ color: "#D4AF37" }}>
            {t.hero_subtitle}
          </p>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.hero_desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/game"
              className="px-8 py-4 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 text-white"
              style={{
                background: "linear-gradient(135deg,#00AFCA,#0088a0)",
                boxShadow: "0 8px 32px rgba(0,175,202,0.3)",
              }}
            >
              {t.hero_cta_play}
            </Link>
            <Link
              href="/kundeli"
              className="px-8 py-4 font-semibold rounded-xl transition-all border text-zinc-200 hover:bg-zinc-800"
              style={{ borderColor: "rgba(212,175,55,0.3)" }}
            >
              {t.hero_cta_challenge}
            </Link>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="mt-20 text-9xl select-none"
          style={{ opacity: 0.12, filter: "drop-shadow(0 0 40px #00AFCA)" }}
        >
          ♛
        </motion.div>
      </section>

      {/* Stats */}
      <section
        className="border-y py-10"
        style={{ borderColor: "rgba(0,175,202,0.12)", backgroundColor: "rgba(0,175,202,0.03)" }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center px-6">
          {STATS.map(([num, label]) => (
            <div key={label}>
              <p className="text-3xl font-black" style={{ color: "#00AFCA" }}>{num}</p>
              <p className="text-zinc-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <OrnamentDivider />

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#D4AF37" }}>
              {t.feat_label}
            </p>
            <h2 className="text-4xl font-black">{t.feat_heading}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={f.href}
                  className="block p-6 rounded-2xl border transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: "#0d1117", borderColor: `${f.accent}22` }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${f.accent}66`;
                    (e.currentTarget as HTMLElement).style.boxShadow   = `0 0 32px ${f.accent}18`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${f.accent}22`;
                    (e.currentTarget as HTMLElement).style.boxShadow   = "none";
                  }}
                >
                  <span className="text-4xl mb-4 block">{f.icon}</span>
                  <h3 className="text-lg font-bold mb-2" style={{ color: f.accent }}>{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <OrnamentDivider />

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#00AFCA" }}>
            {t.pricing_label}
          </p>
          <h2 className="text-4xl font-black mb-12">{t.pricing_heading}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border text-left relative"
                style={{ borderColor: `${tier.color}33`, backgroundColor: "#0d1117" }}
              >
                {tier.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#00AFCA", color: "#09090b" }}
                  >
                    {t.pricing_popular}
                  </span>
                )}
                <p className="text-lg font-black mb-1" style={{ color: tier.color }}>{tier.name}</p>
                <p className="text-2xl font-black text-white mb-4">{tier.price}</p>
                <div className="h-px mb-4" style={{ backgroundColor: `${tier.color}22` }} />
                <p className="text-zinc-500 text-sm leading-relaxed">{tier.desc}</p>
              </motion.div>
            ))}
          </div>

          <Link
            href="/upgrade"
            className="inline-block px-10 py-4 font-bold rounded-xl text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg,#D4AF37,#b8962e)",
              boxShadow: "0 8px 32px rgba(212,175,55,0.25)",
            }}
          >
            {t.pricing_cta}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center py-4 px-8 opacity-30">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
      <svg width="48" height="24" viewBox="0 0 48 24" className="mx-4" fill="#D4AF37">
        <path d="M24 2 L28 8 L36 8 L30 13 L32 20 L24 16 L16 20 L18 13 L12 8 L20 8 Z" />
      </svg>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
    </div>
  );
}
