import { AppNav } from "@/components/shared/AppNav";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata = {
  title: "Профиль игрока | ChessFlow",
  description: "Личный кабинет игрока — статистика, партии, награды и Каганаты.",
};

export default function ProfileRoute() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <ProfilePage />
      </main>
    </>
  );
}
