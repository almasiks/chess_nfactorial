"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Player } from "@/types/game";

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isDeepWork: boolean;
  flipped?: boolean;
}

export function PlayerCard({ player, isActive, isDeepWork, flipped }: PlayerCardProps) {
  const minutes = Math.floor(player.timeLeft / 60);
  const seconds = player.timeLeft % 60;
  const xpPercent = Math.round((player.xp / player.xpToNext) * 100);
  const isLowTime = player.timeLeft < 30 && player.timeLeft > 0;

  return (
    <motion.div
      layout
      className={`rounded-xl p-4 border transition-all duration-500 ${
        isDeepWork
          ? "bg-zinc-900/80 border-zinc-700"
          : isActive
          ? "bg-indigo-950/60 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
          : "bg-zinc-900/60 border-zinc-800"
      } ${flipped ? "order-last" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
            isActive ? "border-indigo-400" : "border-zinc-600"
          } ${player.color === "w" ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"}`}
        >
          {player.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm truncate">
              {player.name}
            </span>
            <Badge
              variant="outline"
              className="text-xs border-indigo-500/40 text-indigo-300 shrink-0"
            >
              Lv.{player.level}
            </Badge>
          </div>
          <span className="text-zinc-400 text-xs">{player.rating} ELO</span>
        </div>

        {/* Clock — pulses red when < 30 s and active */}
        <motion.div
          animate={isLowTime && isActive ? { opacity: [1, 0.35, 1] } : {}}
          transition={isLowTime && isActive ? { repeat: Infinity, duration: 0.7 } : {}}
          className={`font-mono text-lg font-bold tabular-nums px-2 py-1 rounded-lg ${
            isLowTime && isActive
              ? "bg-red-600 text-white"
              : isActive
              ? "bg-indigo-600 text-white"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </motion.div>
      </div>

      {/* XP Bar — hidden in Deep Work zen */}
      {!isDeepWork && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-1"
        >
          <div className="flex justify-between text-xs text-zinc-500">
            <span>XP</span>
            <span>
              {player.xp}/{player.xpToNext}
            </span>
          </div>
          <Progress
            value={xpPercent}
            className="h-1.5 bg-zinc-800 [&>div]:bg-indigo-500"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
