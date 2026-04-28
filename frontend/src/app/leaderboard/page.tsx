import { AppNav } from "@/components/shared/AppNav";
import { LeaderboardPage } from "@/components/leaderboard/LeaderboardPage";

export const metadata = {
  title: "Kóshbasshylar — Leaderboard | SteppeChess",
  description: "Almaty, Qazaqstan jane Álem boyynsha shatranjshylar reıtıngi.",
};

export default function LeaderboardRoute() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <LeaderboardPage />
      </main>
    </>
  );
}
