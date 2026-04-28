"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationPrompt() {
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading]     = useState(false);

  const show = isSupported && permission === "default" && !dismissed;

  async function handleAllow() {
    setLoading(true);
    await requestPermission();
    setLoading(false);
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 64 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 64 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
        >
          <div
            className="rounded-2xl border p-4 shadow-2xl"
            style={{
              backgroundColor: "#0d1117",
              borderColor: "rgba(0, 175, 202, 0.3)",
              boxShadow: "0 0 40px rgba(0,175,202,0.15)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                style={{ backgroundColor: "rgba(0,175,202,0.15)" }}
              >
                ♟
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-0.5">
                  Уведомления о ходах
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Получай сигнал когда соперник сделал ход — не пропусти момент
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAllow}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #00AFCA, #0088a0)" }}
              >
                {loading ? "..." : "Разрешить"}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2.5 rounded-xl text-zinc-400 text-sm hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-all"
              >
                Позже
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
