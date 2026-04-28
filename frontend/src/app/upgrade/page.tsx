import { AppNav } from "@/components/shared/AppNav";
import { UpgradeToPro } from "@/components/paywall/UpgradeToPro";

export const metadata = {
  title: "Подписка — Выбери свой путь | ChessFlow",
  description: "Номад, Султан или Великий Хан — разблокируй полный арсенал.",
};

export default function UpgradePage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <UpgradeToPro />
      </main>
    </>
  );
}
