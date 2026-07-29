import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WatchStatus } from "@prisma/client";
import { toast } from "@/store/toast-store";
import { normalizeAnimeId } from "@/lib/utils";

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
  const normalizedId = normalizeAnimeId(animeId);
  return useQuery({
    queryKey: ["library-entry", normalizedId],
    queryFn: async () => {
      if (!normalizedId) return null;
      const res = await fetch(`/api/library/${encodeURIComponent(normalizedId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.entry;
    },
    enabled: Boolean(normalizedId),
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
      const normalizedId = normalizeAnimeId(payload.animeId);
      const res = await fetch(`/api/library/${encodeURIComponent(normalizedId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, animeId: normalizedId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `HTTP ${res.status}: Failed to update library entry`);
      }
      return (await res.json()).entry;
    },
    onMutate: async (payload) => {
      const normalizedId = normalizeAnimeId(payload.animeId);

      // Cancel in-flight queries so they don't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey: ["library"] });
      await queryClient.cancelQueries({ queryKey: ["library-entry", normalizedId] });

      // Snapshot all currently-cached library list queries for rollback
      const allLibraryKeys = queryClient
        .getQueriesData<any[]>({ queryKey: ["library"] });

      const previousEntry = queryClient.getQueryData(["library-entry", normalizedId]);

      // Optimistically patch every cached library list that contains this entry
      allLibraryKeys.forEach(([queryKey, cachedData]) => {
        if (!Array.isArray(cachedData)) return;
        queryClient.setQueryData(
          queryKey,
          cachedData.map((entry: any) =>
            normalizeAnimeId(entry.animeId) === normalizedId
              ? {
                  ...entry,
                  ...(typeof payload.progress === "number" && { progress: payload.progress }),
                  ...(payload.status !== undefined && { status: payload.status }),
                  ...(typeof payload.isFavorite === "boolean" && { isFavorite: payload.isFavorite }),
                  ...(typeof payload.score === "number" && { score: payload.score }),
                  ...(payload.notes !== undefined && { notes: payload.notes }),
                }
              : entry
          )
        );
      });

      // Optimistically update the single-entry cache
      if (previousEntry) {
        queryClient.setQueryData(["library-entry", normalizedId], (old: any) => ({
          ...old,
          ...(typeof payload.progress === "number" && { progress: payload.progress }),
          ...(payload.status !== undefined && { status: payload.status }),
          ...(typeof payload.isFavorite === "boolean" && { isFavorite: payload.isFavorite }),
          ...(typeof payload.score === "number" && { score: payload.score }),
        }));
      }

      return { allLibraryKeys, previousEntry, normalizedId };
    },
    onSuccess: (updatedEntry) => {
      if (updatedEntry?.animeId) {
        const canonicalId = normalizeAnimeId(updatedEntry.animeId);
        queryClient.setQueryData(["library-entry", canonicalId], updatedEntry);
      }
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["library-entry"] });
      queryClient.invalidateQueries({ queryKey: ["library-stats"] });
    },
    onError: (err: any, _payload, context) => {
      // Roll back optimistic updates
      if (context?.allLibraryKeys) {
        context.allLibraryKeys.forEach(([queryKey, previousData]: [readonly unknown[], any]) => {
          queryClient.setQueryData(queryKey as unknown[], previousData);
        });
      }
      if (context?.previousEntry) {
        queryClient.setQueryData(["library-entry", context.normalizedId], context.previousEntry);
      }
      toast.error("Library Error", err.message || "Failed to update entry");
    },
  });
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (animeId: string) => {
      const normalizedId = normalizeAnimeId(animeId);
      const res = await fetch(`/api/library/${encodeURIComponent(normalizedId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from library");
      return normalizedId;
    },
    onSuccess: (removedId) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["library-entry", removedId] });
      queryClient.invalidateQueries({ queryKey: ["library-stats"] });
      toast.info("Removed from Library");
    },
    onError: (err: any) => {
      toast.error("Library Error", err.message || "Failed to remove entry");
    },
  });
}
