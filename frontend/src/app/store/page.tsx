import { AppNav } from "@/components/shared/AppNav";
import { StorePage } from "@/components/store/StorePage";

export const metadata = {
  title: "Жібек Жолы Базары — Silk Road Bazaar | ChessFlow",
  description: "Эксклюзивные шахматные товары и мерч для воинов Великой Степи.",
};

export default function StoreRoute() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <StorePage />
      </main>
    </>
  );
}
