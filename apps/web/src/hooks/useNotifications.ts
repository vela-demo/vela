"use client";

import { useNotificationsContext } from "@/contexts/NotificationsContext";

export type { NotificationType, Notification } from "@/contexts/NotificationsContext";

/**
 * Thin consumer over the canonical NotificationsContext.
 * All notification state and the indexer WebSocket feed live in the context
 * provider — this hook just exposes them to page-level components.
 */
export function useNotifications() {
  const {
    notifications,
    hasMore,
    unreadCount,
    markAllRead,
    loadMore,
  } = useNotificationsContext();

  return {
    notifications,
    hasMore,
    unreadCount,
    markAllRead,
    // markRead is not in context — provide a no-op to keep call sites compatible
    markRead: (_id: string) => {},
    loadMore,
  };
}
