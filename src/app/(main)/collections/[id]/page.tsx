"use client";

import React, { useState, useEffect, use } from "react";
import { ArrowLeft, Trash2, Pin, Layers, Plus, Calendar, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { toast } from "@/store/toast-store";

interface CollectionItem {
  id: string;
  collectionId: string;
  animeId: string;
  title: string;
  imageUrl: string | null;
  note: string | null;
  createdAt: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  items: CollectionItem[];
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/collections/${id}`);
      const data = await res.json();

      if (data.collection) {
        setCollection(data.collection);
      } else {
        toast.error("Error", "Collection not found.");
        router.push(ROUTES.COLLECTIONS);
      }
    } catch (err) {
      console.error("Failed to load collection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const handleRemoveItem = async (itemId: string, title: string) => {
    if (!confirm(`Remove "${title}" from this collection?`)) return;

    try {
      await fetch(`/api/collections/${id}/items?itemId=${itemId}`, {
        method: "DELETE",
      });

      setCollection((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((item) => item.id !== itemId),
            }
          : null
      );
      toast.info("Removed Item", `"${title}" removed from collection.`);
    } catch (err) {
      toast.error("Error", "Failed to remove item.");
    }
  };

  const handleTogglePin = async () => {
    if (!collection) return;

    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !collection.isPinned }),
      });
      const data = await res.json();

      if (data.collection) {
        setCollection(data.collection);
        toast.info(data.collection.isPinned ? "Pinned Collection" : "Unpinned Collection");
      }
    } catch (err) {
      toast.error("Pin Error", "Failed to update pin status.");
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;
    if (!confirm(`Delete "${collection.name}"? This action cannot be undone.`)) return;

    try {
      await fetch(`/api/collections/${id}`, { method: "DELETE" });
      toast.info("Collection Deleted", `"${collection.name}" was removed.`);
      router.push(ROUTES.COLLECTIONS);
    } catch (err) {
      toast.error("Delete Error", "Failed to delete collection.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-6">
        <SkeletonLoader className="h-10 w-48 rounded-xl" />
        <SkeletonLoader className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonLoader key={i} className="aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-8">
      {/* Back Navigation */}
      <Link
        href={ROUTES.COLLECTIONS}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Collections</span>
      </Link>

      {/* Collection Banner Header */}
      <div className="relative rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-4 overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                Collection
              </span>
              {collection.isPinned && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[11px] font-bold flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-amber-500" />
                  Pinned
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              {collection.name}
            </h1>

            {collection.description && (
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                {collection.description}
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTogglePin}
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-accent text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pin className={cn("w-4 h-4", collection.isPinned && "fill-primary text-primary")} />
              <span>{collection.isPinned ? "Pinned" : "Pin"}</span>
            </button>

            <button
              onClick={handleDeleteCollection}
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{collection.items.length} Anime items</span>
          <span>•</span>
          <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Items Grid */}
      <div>
        <h2 className="text-lg font-bold font-heading text-foreground mb-4">
          Anime in this Collection ({collection.items.length})
        </h2>

        {collection.items.length === 0 ? (
          <div className="text-center py-16 px-4 bg-card/40 border border-border rounded-3xl space-y-3">
            <Layers className="w-8 h-8 text-muted-foreground mx-auto stroke-1" />
            <h3 className="text-sm font-semibold text-foreground">Collection is Empty</h3>
            <p className="text-xs text-muted-foreground">
              Add anime to this collection directly from any anime detail page!
            </p>
            <Link
              href={ROUTES.DISCOVERY}
              className="inline-block px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold mt-2"
            >
              Discover Anime
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {collection.items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full bg-slate-900 overflow-hidden">
                  <img
                    src={item.imageUrl || "/placeholder.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay Action Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <Link
                      href={ROUTES.ANIME_DETAIL(item.animeId)}
                      className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                      title="View Detail Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      className="p-2 rounded-full bg-rose-600/80 backdrop-blur-md text-white hover:bg-rose-600 transition-colors"
                      title="Remove from Collection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="p-3">
                  <Link
                    href={ROUTES.ANIME_DETAIL(item.animeId)}
                    className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
