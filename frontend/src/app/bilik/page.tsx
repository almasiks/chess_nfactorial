import { AppNav } from "@/components/shared/AppNav";
import { BilikHub } from "@/components/bilik/BilikHub";

export const metadata = { title: "Bilik — Хранилище мудрости | ChessFlow" };

export default function BilikPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <BilikHub />
      </main>
    </>
  );
}
