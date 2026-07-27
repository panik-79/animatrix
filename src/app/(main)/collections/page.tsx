"use client";

import React, { useState, useEffect } from "react";
import { Plus, FolderPlus, Pin, Trash2, Edit3, Search, Layers, ChevronRight, Sparkles, X, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { toast } from "@/store/toast-store";
import { confirmDialog } from "@/store/confirm-store";

interface CollectionItem {
  id: string;
  collectionId: string;
  animeId: string;
  title: string;
  imageUrl: string | null;
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

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/collections");
      const data = await res.json();
      
      if (data.collections) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Seed starter collections if empty
  const handleSeedDefaults = async () => {
    setCreating(true);
    const defaults = [
      { name: "Top 10 Masterpieces", description: "All-time legendary anime that redefined storytelling." },
      { name: "Cozy Weekend Binge", description: "Lighthearted, comforting series perfect for unwinding." },
      { name: "Dark Fantasy & Psychological", description: "Gripping, high-stakes narratives with dark themes." }
    ];

    try {
      for (const def of defaults) {
        await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(def),
        });
      }
      toast.success("Collections Ready", "Created starter preset collections!");
      fetchCollections();
    } catch (err) {
      toast.error("Error", "Failed to create starter collections.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      setCreating(true);
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          description: newCollectionDesc.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.collection) {
        setCollections((prev) => [data.collection, ...prev]);
        setNewCollectionName("");
        setNewCollectionDesc("");
        setIsCreateModalOpen(false);
        toast.success("Collection Created", `"${data.collection.name}" is ready.`);
      }
    } catch (err) {
      toast.error("Create Error", "Failed to create collection.");
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, id: string, currentPinned: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });
      const data = await res.json();

      if (data.collection) {
        setCollections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isPinned: !currentPinned } : c))
        );
        toast.info(currentPinned ? "Unpinned Collection" : "Pinned Collection");
      }
    } catch (err) {
      toast.error("Pin Error", "Failed to update pin status.");
    }
  };

  const handleDeleteCollection = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = await confirmDialog({
      title: "Delete Collection",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete Collection",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await fetch(`/api/collections/${id}`, { method: "DELETE" });
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast.info("Deleted Collection", `"${name}" removed.`);
    } catch (err) {
      toast.error("Delete Error", "Failed to delete collection.");
    }
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-8">
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
              Collections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organize, curate, and showcase custom lists of your favorite anime series and movies.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Collection</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH FILTER BAR ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>

        <span className="text-xs text-muted-foreground font-medium">
          {filteredCollections.length} {filteredCollections.length === 1 ? "Collection" : "Collections"}
        </span>
      </div>

      {/* ── CONTENT GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-card border border-border p-4 space-y-4">
              <SkeletonLoader className="h-32 w-full rounded-xl" />
              <SkeletonLoader className="h-5 w-3/4" />
              <SkeletonLoader className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-16 px-4 bg-card/50 border border-border rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FolderPlus className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No Collections Found</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "No collections match your search term." : "Start curating your personal anime custom lists now!"}
            </p>
          </div>
          {!searchQuery && (
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
              >
                Create Custom Collection
              </button>
              <button
                onClick={handleSeedDefaults}
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold border border-border hover:bg-accent"
              >
                Seed Default Presets
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((col) => {
            const itemCount = col.items.length;
            const posters = col.items.slice(0, 3).map((item) => item.imageUrl).filter(Boolean);

            return (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="group relative rounded-2xl bg-card hover:bg-accent/40 border border-border hover:border-primary/40 p-4 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Pinned Badge & Actions Header */}
                <div className="flex items-center justify-between z-10 mb-3">
                  <div className="flex items-center gap-2">
                    {col.isPinned && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3 fill-amber-500" />
                        <span>Pinned</span>
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border">
                      {itemCount} {itemCount === 1 ? "Anime" : "Anime"}
                    </span>
                  </div>

                  {/* Card Action Controls */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleTogglePin(e, col.id, col.isPinned)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title={col.isPinned ? "Unpin Collection" : "Pin Collection"}
                    >
                      <Pin className={cn("w-3.5 h-3.5", col.isPinned && "fill-primary text-primary")} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCollection(e, col.id, col.name)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Poster Collage Preview */}
                <div className="relative h-36 rounded-xl overflow-hidden bg-slate-900/50 border border-border mb-4 flex items-center justify-center">
                  {posters.length > 0 ? (
                    <div className="flex w-full h-full">
                      {posters.map((url, idx) => (
                        <div key={idx} className="flex-1 h-full overflow-hidden border-r border-background/20 last:border-0 relative">
                          <img
                            src={url!}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground/60">
                      <Layers className="w-8 h-8 stroke-1" />
                      <span className="text-[11px]">Empty Collection</span>
                    </div>
                  )}
                </div>

                {/* Title & Description Footer */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate font-heading">
                      {col.name}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  {col.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {col.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── CREATE COLLECTION MODAL ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 z-10 text-card-foreground space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold font-heading">Create Collection</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mind-Bending Sci-Fi"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A brief summary of what's inside this custom list..."
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newCollectionName.trim()}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Save Collection"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
