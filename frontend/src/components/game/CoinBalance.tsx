"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CoinBalanceProps {
  balance: number;
  isDeepWork: boolean;
}

export function CoinBalance({ balance, isDeepWork }: CoinBalanceProps) {
  const prevRef = useRef(balance);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    if (balance !== prevRef.current) {
      setDelta(balance - prevRef.current);
      prevRef.current = balance;
      const t = setTimeout(() => setDelta(null), 1800);
      return () => clearTimeout(t);
    }
  }, [balance]);

  return (
    <div className="flex items-center gap-2 relative">
      <span className="text-yellow-400 text-base">🪙</span>
      <motion.span
        key={balance}
        initial={{ scale: 1.3, color: "#facc15" }}
        animate={{ scale: 1, color: isDeepWork ? "#a3a3a3" : "#facc15" }}
        transition={{ duration: 0.4 }}
        className="font-bold tabular-nums text-sm"
      >
        {balance.toLocaleString()} FC
      </motion.span>

      <AnimatePresence>
        {delta !== null && (
          <motion.span
            key="delta"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute -top-5 left-0 text-xs font-bold text-emerald-400 pointer-events-none"
          >
            +{delta}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
