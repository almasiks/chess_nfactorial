import { AppNav } from "@/components/shared/AppNav";
import { PlayWithFriend } from "@/components/play/PlayWithFriend";

export const metadata = { title: "ChessFlow — Вызов на партию" };

export default function PlayPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <PlayWithFriend />
      </main>
    </>
  );
}
