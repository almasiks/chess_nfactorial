"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PomodoroState, DeepWorkState } from "@/types/game";

interface DeepWorkPanelProps {
  pomodoro: PomodoroState;
  deepWork: DeepWorkState;
  onToggle: () => void;
  onToggleLoFi: () => void;
  onPause: () => void;
  onReset: () => void;
}

const phaseLabel: Record<PomodoroState["phase"], string> = {
  work: "Deep Focus",
  short_break: "Short Break",
  long_break: "Long Break",
};

const phaseColor: Record<PomodoroState["phase"], string> = {
  work: "text-indigo-400",
  short_break: "text-emerald-400",
  long_break: "text-cyan-400",
};

function sessionProgress(pomodoro: PomodoroState): number {
  const totalSeconds =
    pomodoro.phase === "work"
      ? 25 * 60
      : pomodoro.phase === "short_break"
      ? 5 * 60
      : 15 * 60;
  const elapsed =
    totalSeconds - (pomodoro.minutesLeft * 60 + pomodoro.secondsLeft);
  return Math.round((elapsed / totalSeconds) * 100);
}

export function DeepWorkPanel({
  pomodoro,
  deepWork,
  onToggle,
  onToggleLoFi,
  onPause,
  onReset,
}: DeepWorkPanelProps) {
  const progress = sessionProgress(pomodoro);

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all duration-500 overflow-hidden ${
        deepWork.isActive
          ? "bg-zinc-950 border-indigo-500/30 shadow-xl shadow-indigo-900/20"
          : "bg-zinc-900/80 border-zinc-700/50"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              deepWork.isActive
                ? { scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-2 h-2 rounded-full ${
              deepWork.isActive ? "bg-indigo-400" : "bg-zinc-600"
            }`}
          />
          <span className="text-sm font-semibold text-white">
            Deep Work Mode
          </span>
        </div>

        <Button
          size="sm"
          onClick={onToggle}
          className={`text-xs transition-all duration-300 ${
            deepWork.isActive
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600"
              : "bg-indigo-600 hover:bg-indigo-500 text-white"
          }`}
        >
          {deepWork.isActive ? "Exit Zen" : "Enter Flow"}
        </Button>
      </div>

      <AnimatePresence>
        {deepWork.isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="px-4 pb-4 space-y-4"
          >
            {/* Pomodoro Timer */}
            <div className="text-center space-y-2">
              <p
                className={`text-xs font-medium uppercase tracking-widest ${
                  phaseColor[pomodoro.phase]
                }`}
              >
                {phaseLabel[pomodoro.phase]} — Session {pomodoro.session}/4
              </p>

              <motion.div
                key={`${pomodoro.minutesLeft}:${pomodoro.secondsLeft}`}
                className="font-mono text-5xl font-bold text-white tabular-nums"
              >
                {String(pomodoro.minutesLeft).padStart(2, "0")}:
                {String(pomodoro.secondsLeft).padStart(2, "0")}
              </motion.div>

              <Progress
                value={progress}
                className="h-1 bg-zinc-800 [&>div]:bg-indigo-500 [&>div]:transition-all [&>div]:duration-1000"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={onPause}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
              >
                {pomodoro.isActive ? "Pause" : "Resume"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReset}
                className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs"
              >
                Reset
              </Button>
            </div>

            {/* Lo-Fi player simulation */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                deepWork.loFiPlaying
                  ? "bg-indigo-950/60 border-indigo-500/30"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <LoFiWave active={deepWork.loFiPlaying} />
                <div>
                  <p className="text-xs font-medium text-white">
                    Lo-Fi Beats to Study
                  </p>
                  <p className="text-xs text-zinc-500">ChessFlow Radio</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleLoFi}
                className="h-8 w-8 p-0 rounded-full hover:bg-indigo-800/40"
              >
                {deepWork.loFiPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <StatPill
                label="Focus Time"
                value={`${Math.floor(pomodoro.totalFocusMinutes)}m`}
              />
              <StatPill
                label="Sessions"
                value={String(pomodoro.session - 1)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-800">
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="text-white font-bold text-sm">{value}</p>
    </div>
  );
}

function LoFiWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-indigo-400 rounded-full"
          animate={
            active
              ? {
                  height: [h * 2, h * 4, h * 2],
                  opacity: [0.6, 1, 0.6],
                }
              : { height: h * 2, opacity: 0.3 }
          }
          transition={{
            repeat: Infinity,
            duration: 0.8 + i * 0.15,
            ease: "easeInOut",
          }}
          style={{ height: h * 2 }}
        />
      ))}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-indigo-300"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-indigo-300"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
