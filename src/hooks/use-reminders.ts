"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { normalizeAnimeId } from "@/lib/utils";
import { toast } from "@/store/toast-store";

export interface EpisodeReminderItem {
  id: string;
  userId?: string | null;
  animeId: string;
  title: string;
  imageUrl?: string | null;
  createdAt: string;
}

export function useReminders() {
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery<EpisodeReminderItem[]>({
    queryKey: ["episode-reminders"],
    queryFn: async () => {
      const res = await fetch("/api/reminders");
      if (!res.ok) throw new Error("Failed to fetch reminders");
      const data = await res.json();
      return data.reminders || [];
    },
  });

  const isReminderSet = (rawAnimeId: string) => {
    const norm = normalizeAnimeId(rawAnimeId);
    return reminders.some((r) => normalizeAnimeId(r.animeId) === norm);
  };

  const toggleMutation = useMutation({
    mutationFn: async (anime: { animeId: string; title: string; imageUrl?: string | null }) => {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anime),
      });
      if (!res.ok) throw new Error("Failed to toggle reminder");
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["episode-reminders"] });
      if (data.isReminderSet) {
        toast.success("Reminder Set! 🔔", `You'll get episode alerts for "${variables.title}"`);
      } else {
        toast.info("Reminder Removed", `Removed alerts for "${variables.title}"`);
      }
    },
    onError: () => {
      toast.error("Error", "Failed to update reminder.");
    },
  });

  return {
    reminders,
    isLoading,
    isReminderSet,
    toggleReminder: (animeId: string, title: string, imageUrl?: string | null) =>
      toggleMutation.mutate({ animeId, title, imageUrl }),
    isToggling: toggleMutation.isPending,
  };
}
