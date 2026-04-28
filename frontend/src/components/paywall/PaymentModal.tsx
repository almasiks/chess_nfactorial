"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Tier {
  id: string;
  name: string;
  icon: string;
  color: string;
  price: { monthly: number; yearly: number };
}

interface Props {
  tier: Tier;
  billing: "monthly" | "yearly";
  onClose: () => void;
}

type Step = "confirm" | "processing" | "done" | "error";

export function PaymentModal({ tier, billing, onClose }: Props) {
  const [step, setStep]     = useState<Step>("confirm");
  const [phone, setPhone]   = useState("");
  const price = tier.price[billing];
  const totalPrice = billing === "yearly" ? price : price;

  async function handlePay() {
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const token = localStorage.getItem("access_token") ?? "";
      const ref = `KASPI-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const res = await fetch(`${API}/api/users/subscription/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tier: tier.id, payment_ref: ref }),
      });
      if (res.ok) {
        setStep("done");
      } else {
        setStep("error");
      }
    } catch {
      setStep("error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ backgroundColor: "#0d1117", borderColor: `${tier.color}44` }}
      >
        {step === "confirm" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{tier.icon}</span>
              <div>
                <p className="font-black text-xl text-white">{tier.name}</p>
                <p className="text-sm" style={{ color: tier.color }}>
                  {totalPrice.toLocaleString("ru")}₸ / {billing === "monthly" ? "месяц" : "год"}
                </p>
              </div>
            </div>

            <div
              className="p-4 rounded-xl mb-5"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs text-zinc-500 mb-3 font-bold uppercase tracking-widest">Оплата через Kaspi Pay</p>
              <input
                type="tel"
                placeholder="+7 (___) ___ __ __"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors font-mono"
                style={{ borderColor: "rgba(0,175,202,0.25)" }}
              />
              <p className="text-xs text-zinc-600 mt-2">
                На номер придёт SMS с подтверждением платежа
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-400 border border-zinc-800 hover:bg-zinc-900 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handlePay}
                className="flex-1 py-3 rounded-xl text-sm font-black transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg,${tier.color},${tier.color}bb)`,
                  color: tier.id === "great_khan" ? "#09090b" : "#fff",
                }}
              >
                Оплатить {totalPrice.toLocaleString("ru")}₸
              </button>
            </div>

            <p className="text-center text-zinc-700 text-xs mt-4">
              Первый месяц бесплатно · Отменить в любое время
            </p>
          </>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="text-5xl mx-auto mb-4"
            >
              ♟
            </motion.div>
            <p className="font-bold text-white mb-2">Обрабатываем платёж...</p>
            <p className="text-zinc-500 text-sm">Kaspi Pay подтверждает транзакцию</p>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-6xl mx-auto mb-4"
            >
              {tier.icon}
            </motion.div>
            <p className="text-2xl font-black text-white mb-2">Добро пожаловать, {tier.name}!</p>
            <p className="text-zinc-400 text-sm mb-6">
              Подписка активирована. Твоя казна пополнена силой Великой Степи.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg,${tier.color},${tier.color}bb)` }}
            >
              Начать играть →
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-8">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="font-bold text-white mb-2">Ошибка платежа</p>
            <p className="text-zinc-400 text-sm mb-6">
              Не удалось подключиться к серверу. Попробуй позже.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 text-sm hover:bg-zinc-900 transition-all">
                Закрыть
              </button>
              <button onClick={() => setStep("confirm")} className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all" style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}>
                Повторить
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
