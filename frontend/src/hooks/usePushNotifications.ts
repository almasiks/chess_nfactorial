"use client";
import { useState, useCallback } from "react";

type NotificationPermission = "default" | "granted" | "denied";

interface PushHookResult {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  notifyOpponentMoved: (opponentName: string, gameId: number) => void;
}

export function usePushNotifications(): PushHookResult {
  const isSupported =
    typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? (Notification.permission as NotificationPermission) : "denied"
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);

    if (result === "granted") {
      // Save subscription to backend
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/push-subscription/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ subscription: null, enabled: true }),
          });
        }
      } catch {
        // non-critical — notification still works locally
      }
    }

    return result === "granted";
  }, [isSupported]);

  const notifyOpponentMoved = useCallback(
    (opponentName: string, gameId: number) => {
      if (!isSupported || permission !== "granted") return;

      new Notification("ChessFlow — ваш ход! ♟", {
        body:  `${opponentName} сделал ход. Вернитесь в игру!`,
        icon:  "/favicon.ico",
        badge: "/favicon.ico",
        tag:   `game-${gameId}`,
      });
    },
    [isSupported, permission]
  );

  return { permission, isSupported, requestPermission, notifyOpponentMoved };
}
