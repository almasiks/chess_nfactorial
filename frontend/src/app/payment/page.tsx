import { AppNav } from "@/components/shared/AppNav";
import { UpgradeToPro } from "@/components/paywall/UpgradeToPro";

export const metadata = { title: "Оплата | ChessFlow" };

export default function PaymentPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <UpgradeToPro />
      </main>
    </>
  );
}
