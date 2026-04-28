import { AppNav } from "@/components/shared/AppNav";
import { BilimHub } from "@/components/bilim/BilimHub";

export const metadata = { title: "Bilim — Хранилище мудрости | ChessFlow" };

export default function BilimPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <BilimHub />
      </main>
    </>
  );
}
