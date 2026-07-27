"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, Check, Plus, X, Layers } from "lucide-react";
import { toast } from "@/store/toast-store";

interface CollectionItem {
  id: string;
  collectionId: string;
  animeId: string;
}

interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
}

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeId: string;
  title: string;
  imageUrl: string | null;
}

export function AddToCollectionModal({
  isOpen,
  onClose,
  animeId,
  title,
  imageUrl,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newColName, setNewColName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (data.collections) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItemInCollection = async (collectionId: string) => {
    const targetCollection = collections.find((c) => c.id === collectionId);
    if (!targetCollection) return;

    const isInCollection = targetCollection.items.some((item) => item.animeId === animeId);

    try {
      if (isInCollection) {
        // Remove
        await fetch(`/api/collections/${collectionId}/items?animeId=${animeId}`, {
          method: "DELETE",
        });
        toast.info("Removed", `Removed from "${targetCollection.name}"`);
      } else {
        // Add
        await fetch(`/api/collections/${collectionId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            animeId,
            title,
            imageUrl,
          }),
        });
        toast.success("Added to Collection", `Saved to "${targetCollection.name}"`);
      }
      fetchCollections();
    } catch (err) {
      toast.error("Error", "Failed to update collection.");
    }
  };

  const handleCreateQuickCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      setCreating(true);
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newColName.trim() }),
      });
      const data = await res.json();

      if (data.collection) {
        // Automatically add anime to the newly created collection
        await fetch(`/api/collections/${data.collection.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            animeId,
            title,
            imageUrl,
          }),
        });

        setNewColName("");
        toast.success("Collection Created", `Saved to "${data.collection.name}"`);
        fetchCollections();
      }
    } catch (err) {
      toast.error("Error", "Failed to create collection.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 z-10 text-card-foreground space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-base font-bold font-heading">Add to Collection</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[240px]">{title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Create New Collection */}
            <form onSubmit={handleCreateQuickCollection} className="flex gap-2">
              <input
                type="text"
                placeholder="New collection name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={creating || !newColName.trim()}
                className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shrink-0 disabled:opacity-50 hover:bg-primary/90 cursor-pointer"
              >
                Create
              </button>
            </form>

            {/* Collection Selection List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-xs text-muted-foreground text-center py-4">Loading collections...</p>
              ) : collections.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No collections yet. Create your first collection above!
                </p>
              ) : (
                collections.map((col) => {
                  const isInCol = col.items.some((item) => item.animeId === animeId);

                  return (
                    <button
                      key={col.id}
                      onClick={() => handleToggleItemInCollection(col.id)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isInCol
                          ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                          : "bg-background hover:bg-accent border-border text-foreground"
                      }`}
                    >
                      <span className="truncate">{col.name}</span>
                      {isInCol ? (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-accent cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
