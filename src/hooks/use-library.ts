import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WatchStatus } from "@prisma/client";
import { toast } from "@/store/toast-store";

export function useLibrary(status?: WatchStatus, search?: string) {
  return useQuery({
    queryKey: ["library", status || "ALL", search || ""],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);

      const res = await fetch(`/api/library?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch library");
      const data = await res.json();
      return data.entries;
    },
  });
}

export function useLibraryEntry(animeId: string) {
  return useQuery({
    queryKey: ["library-entry", animeId],
    queryFn: async () => {
      if (!animeId) return null;
      const res = await fetch(`/api/library/${encodeURIComponent(animeId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.entry;
    },
    enabled: Boolean(animeId),
  });
}

export function useLibraryStats() {
  return useQuery({
    queryKey: ["library-stats"],
    queryFn: async () => {
      const res = await fetch("/api/library/stats");
      if (!res.ok) throw new Error("Failed to fetch library stats");
      const data = await res.json();
      return data.stats;
    },
  });
}

export function useUpdateLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      animeId: string;
      title: string;
      imageUrl?: string | null;
      bannerUrl?: string | null;
      status?: WatchStatus | null;
      score?: number | null;
      progress?: number;
      totalEpisodes?: number | null;
      isFavorite?: boolean;
      notes?: string | null;
    }) => {
      const res = await fetch(`/api/library/${encodeURIComponent(payload.animeId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update library entry");
      return (await res.json()).entry;
    },
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      if (updatedEntry?.animeId) {
        queryClient.setQueryData(["library-entry", updatedEntry.animeId], updatedEntry);
      }
      queryClient.invalidateQueries({ queryKey: ["library-entry"] });
      queryClient.invalidateQueries({ queryKey: ["library-stats"] });
    },
    onError: (err: any) => {
      toast.error("Library Error", err.message || "Failed to update entry");
    },
  });
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (animeId: string) => {
      const res = await fetch(`/api/library/${encodeURIComponent(animeId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove library entry");
      return animeId;
    },
    onSuccess: (animeId) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["library-entry", animeId] });
      queryClient.invalidateQueries({ queryKey: ["library-stats"] });
      toast.info("Removed from Library");
    },
  });
}
