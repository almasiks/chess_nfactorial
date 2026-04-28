import { AppNav } from "@/components/shared/AppNav";
import { WatchPage } from "@/components/watch/WatchPage";

export const metadata = { title: "ChessFlow — Прямой эфир" };

export default function WatchRoute() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <WatchPage />
      </main>
    </>
  );
}
