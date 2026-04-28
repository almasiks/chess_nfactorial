"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { MoveRecord } from "@/types/game";

interface MoveHistoryProps {
  moves: MoveRecord[];
  isDeepWork: boolean;
}

export function MoveHistory({ moves, isDeepWork }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  // Group into pairs: [white, black]
  const pairs: Array<[MoveRecord, MoveRecord | undefined]> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div
      className={`rounded-xl border flex flex-col h-full transition-all duration-500 ${
        isDeepWork
          ? "bg-zinc-900/60 border-zinc-800"
          : "bg-zinc-900/80 border-zinc-700/50"
      }`}
    >
      {!isDeepWork && (
        <>
          <div className="p-3 pb-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Move History
            </h3>
          </div>
          <Separator className="bg-zinc-800" />
        </>
      )}

      <ScrollArea className="flex-1 p-3">
        {pairs.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center mt-4">
            No moves yet
          </p>
        ) : (
          <div className="space-y-0.5">
            <AnimatePresence initial={false}>
              {pairs.map(([white, black], idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-[2rem_1fr_1fr] gap-1 items-center"
                >
                  <span className="text-zinc-600 text-xs tabular-nums">
                    {idx + 1}.
                  </span>
                  <MoveCell move={white} isLatest={idx === pairs.length - 1 && !black} />
                  {black ? (
                    <MoveCell move={black} isLatest={idx === pairs.length - 1} />
                  ) : (
                    <span />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function MoveCell({
  move,
  isLatest,
}: {
  move: MoveRecord;
  isLatest: boolean;
}) {
  return (
    <span
      className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors ${
        isLatest
          ? "bg-indigo-500/20 text-indigo-300 font-semibold"
          : "text-zinc-300 hover:text-white"
      }`}
    >
      {move.san}
    </span>
  );
}
