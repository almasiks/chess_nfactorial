import { AppNav } from "@/components/shared/AppNav";
import { KundeliPuzzle } from "@/components/daily/KundeliPuzzle";

export const metadata = { title: "Испытание Батыра | Steppe Chess" };

export default function KundeliPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <KundeliPuzzle />
      </main>
    </>
  );
}
