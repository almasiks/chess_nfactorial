import { AppNav } from "@/components/shared/AppNav";
import { DailyPuzzle } from "@/components/daily/DailyPuzzle";

export const metadata = { title: "Батыр сынағы — Ежедневная задача | ChessFlow" };

export default function DailyPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <DailyPuzzle />
      </main>
    </>
  );
}
