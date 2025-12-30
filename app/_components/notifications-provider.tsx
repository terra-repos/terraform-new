"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  message: string | null;
  is_read: boolean | null;
  createdAt: string | null;
  type: string | null;
  redirect_url: string | null;
  sender_user_id: string | null;
  sender_pfp_src: string | null;
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  banner: { notification: Notification; visible: boolean } | null;
  dismissBanner: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(
  null
);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  return ctx;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const [banner, setBanner] = useState<{
    notification: Notification;
    visible: boolean;
  } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio context unlock on first user gesture
  useEffect(() => {
    const unlock = () => {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        if (audioCtxRef.current.state === "suspended")
          audioCtxRef.current.resume();
      } catch {
        // Ignore audio context errors
      }
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  const playChime = useCallback(() => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);

      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      o.start(now);
      o.stop(now + 0.3);
    } catch {
      // Ignore audio errors
    }
  }, []);

  // Get user ID
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id || null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch notifications and subscribe to realtime
  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from("notifications")
          .select(
            `
            id, message, is_read, createdAt, type, redirect_url, sender_user_id,
            sender:profiles!sender_user_id(pfp_src)
          `
          )
          .eq("user_id", userId)
          .order("createdAt", { ascending: false })
          .limit(20);

        if (mounted) {
          const rows = (data || []).map(
            (item: {
              id: string;
              message: string | null;
              is_read: boolean | null;
              createdAt: string | null;
              type: string | null;
              redirect_url: string | null;
              sender_user_id: string | null;
              sender: { pfp_src: string | null } | null;
            }) => ({
              id: item.id,
              message: item.message,
              is_read: item.is_read,
              createdAt: item.createdAt,
              type: item.type,
              redirect_url: item.redirect_url,
              sender_user_id: item.sender_user_id,
              sender_pfp_src: item.sender?.pfp_src || null,
            })
          );
          setNotifications(rows);
          setHasMore(rows.length === 20);
          knownIdsRef.current = new Set(rows.map((r) => r.id));
        }

        // Subscribe to realtime
        channel = supabase
          .channel(`notifications-${userId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications" },
            async (payload) => {
              const rawRow = payload.new as Notification & { user_id?: string };
              if (
                rawRow?.user_id === userId &&
                !knownIdsRef.current.has(rawRow.id)
              ) {
                knownIdsRef.current.add(rawRow.id);

                // Fetch sender profile pic
                let sender_pfp_src = null;
                if (rawRow.sender_user_id) {
                  const { data: profile } = await supabase
                    .from("profiles")
                    .select("pfp_src")
                    .eq("user_id", rawRow.sender_user_id)
                    .maybeSingle();
                  sender_pfp_src = profile?.pfp_src || null;
                }

                const notification = { ...rawRow, sender_pfp_src };
                setNotifications((prev) => [notification, ...prev]);
                playChime();
                setBanner({ notification, visible: true });
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "notifications" },
            (payload) => {
              const row = payload.new as Notification & { user_id?: string };
              if (row?.user_id === userId) {
                setNotifications((prev) =>
                  prev.map((n) => (n.id === row.id ? { ...n, ...row } : n))
                );
              }
            }
          )
          .subscribe();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, userId, playChime]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMore || !userId) return;
    loadingMoreRef.current = true;
    try {
      const { data } = await supabase
        .from("notifications")
        .select(
          `
          id, message, is_read, createdAt, type, redirect_url, sender_user_id,
          sender:profiles!sender_user_id(pfp_src)
        `
        )
        .eq("user_id", userId)
        .order("createdAt", { ascending: false })
        .range(notifications.length, notifications.length + 19);

      const rows = (data || []).map(
        (item: {
          id: string;
          message: string | null;
          is_read: boolean | null;
          createdAt: string | null;
          type: string | null;
          redirect_url: string | null;
          sender_user_id: string | null;
          sender: { pfp_src: string | null } | null;
        }) => ({
          id: item.id,
          message: item.message,
          is_read: item.is_read,
          createdAt: item.createdAt,
          type: item.type,
          redirect_url: item.redirect_url,
          sender_user_id: item.sender_user_id,
          sender_pfp_src: item.sender?.pfp_src || null,
        })
      );
      setNotifications((prev) => [...prev, ...rows]);
      setHasMore(rows.length === 20);
    } finally {
      loadingMoreRef.current = false;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", userId || "")
      .then(() => {});
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId || "")
      .then(() => {});
  };

  const clearAll = () => {
    setNotifications([]);
    setHasMore(false);
    supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId || "")
      .then(() => {});
  };

  const dismissBanner = () =>
    setBanner((b) => (b ? { ...b, visible: false } : null));

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        hasMore,
        loadMore,
        markAsRead,
        dismiss,
        clearAll,
        banner,
        dismissBanner,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
