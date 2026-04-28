"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";
import { PaymentModal } from "./PaymentModal";

const TIERS = [
  {
    id:       "nomad",
    name:     "Номад",
    subtitle: "Путь начинается здесь",
    icon:     "🏕️",
    price:    { monthly: 0,    yearly: 0 },
    color:    "#6b7280",
    features: [
      "Неограниченные рейтинговые партии",
      "Таблица лидеров по городам",
      "Базовый профиль игрока",
      "Ежедневная задача Батыра",
      "Bilik — карточки терминов",
    ],
    cta: "Текущий план",
    disabled: true,
  },
  {
    id:       "sultan",
    name:     "Султан",
    subtitle: "Оружие Великого Воина",
    icon:     "⚔️",
    price:    { monthly: 1990, yearly: 15900 },
    color:    "#00AFCA",
    popular:  true,
    features: [
      "Всё из тарифа Номад",
      "AI Coach — анализ партий",
      "Расширенная статистика Deep Work",
      "История всех партий",
      "Приоритетный матчмейкинг",
      "Таблица Султанов",
    ],
    cta: "Стать Султаном",
    disabled: false,
  },
  {
    id:       "great_khan",
    name:     "Великий Хан",
    subtitle: "Властелин Степи",
    icon:     "👑",
    price:    { monthly: 4990, yearly: 39900 },
    color:    "#D4AF37",
    popular:  false,
    features: [
      "Всё из тарифа Султан",
      'Скин "Алтын Адам" (Золотой Человек)',
      "Закрытые турниры Ханов",
      "VIP-матчи с приглашением",
      "Персональная страница профиля",
      "Бейдж Великого Хана навсегда",
    ],
    cta: "Стать Великим Ханом",
    disabled: false,
  },
];

export function UpgradeToPro({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const [billing, setBilling]   = useState<"monthly" | "yearly">("monthly");
  const [selected, setSelected] = useState<typeof TIERS[0] | null>(null);

  return (
    <div className={`${isModal ? "" : "min-h-screen"} bg-zinc-950 text-white`}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {isModal && onClose && (
          <div className="flex justify-end mb-6">
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-sm">
              ✕ Закрыть
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#D4AF37" }}>
            Подписка ChessFlow
          </p>
          <h1 className="text-5xl font-black mb-3">Выбери свой путь</h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            От кочевника до Властелина Степи — каждый тариф открывает новые горизонты.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div
            className="flex p-1 rounded-xl"
            style={{ backgroundColor: "#0d1117", border: "1px solid rgba(212,175,55,0.2)" }}
          >
            {[
              { id: "monthly", label: "В месяц" },
              { id: "yearly",  label: "В год  −20%" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBilling(b.id as "monthly" | "yearly")}
                className="px-6 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  backgroundColor: billing === b.id ? "rgba(212,175,55,0.15)" : "transparent",
                  color: billing === b.id ? "#D4AF37" : "#71717a",
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <KazakhDivider color="#D4AF37" className="mb-10" />

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {TIERS.map((tier, i) => {
            const price = tier.price[billing];
            const isYearly = billing === "yearly";
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-px"
                style={{
                  background: tier.popular
                    ? `linear-gradient(135deg,${tier.color}66,${tier.color}22,${tier.color}44)`
                    : `linear-gradient(135deg,${tier.color}22,transparent)`,
                }}
              >
                {tier.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black whitespace-nowrap"
                    style={{ backgroundColor: tier.color, color: "#09090b" }}
                  >
                    Популярный
                  </div>
                )}
                <div className="rounded-2xl p-6 h-full" style={{ backgroundColor: "#0d1117" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{tier.icon}</span>
                    <div>
                      <p className="font-black text-lg" style={{ color: tier.color }}>{tier.name}</p>
                      <p className="text-xs text-zinc-500">{tier.subtitle}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={billing}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                      >
                        {price === 0 ? (
                          <p className="text-3xl font-black text-white">Бесплатно</p>
                        ) : (
                          <>
                            <p className="text-3xl font-black text-white">
                              {isYearly
                                ? `${Math.round(price / 12).toLocaleString("ru")}₸`
                                : `${price.toLocaleString("ru")}₸`}
                              <span className="text-base font-normal text-zinc-500">/мес</span>
                            </p>
                            {isYearly && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {price.toLocaleString("ru")}₸ в год
                              </p>
                            )}
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <ul className="space-y-2 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span style={{ color: tier.color }} className="shrink-0 mt-0.5">✓</span>
                        <span className="text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={tier.disabled}
                    onClick={() => !tier.disabled && setSelected(tier)}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={
                      tier.disabled
                        ? { backgroundColor: "#27272a", color: "#71717a" }
                        : {
                            background: `linear-gradient(135deg,${tier.color},${tier.color}bb)`,
                            color: tier.id === "great_khan" ? "#09090b" : "#fff",
                          }
                    }
                  >
                    {tier.cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-zinc-600 text-xs">
          Оплата через Kaspi Pay · Отменить можно в любой момент · Первый месяц в подарок новым пользователям
        </p>
      </div>

      <AnimatePresence>
        {selected && (
          <PaymentModal
            tier={selected}
            billing={billing}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
