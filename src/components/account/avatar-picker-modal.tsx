"use client";

import { useState } from "react";
import { PRESET_ANIME_AVATARS, AnimeAvatar } from "@/lib/constants/avatars";
import { Check, X, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string | null;
  googleImage?: string | null;
  onSelectAvatar: (imageUrl: string) => void;
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentImage,
  googleImage,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentImage);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleApply = (url: string) => {
    setSelectedUrl(url);
    onSelectAvatar(url);
    onClose();
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Choose Profile Avatar
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select from famous anime character avatars or your Google profile photo.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Avatars Grid */}
          <div className="overflow-y-auto pr-1 space-y-6 flex-1 hide-scrollbar">
            {/* Google Profile Photo Option if available */}
            {googleImage && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Social Profile Photo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleApply(googleImage)}
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all text-left group ${
                      selectedUrl === googleImage
                        ? "bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30"
                        : "bg-slate-950/50 border-white/5 hover:border-white/20 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      {!failedImages["google"] ? (
                        <img
                          src={googleImage}
                          alt="Google Account"
                          referrerPolicy="no-referrer"
                          onError={() => handleImageError("google")}
                          className="w-14 h-14 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/10">
                          G
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Google Profile Photo</p>
                      <p className="text-[11px] text-slate-400">Use default Google account picture</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Anime Character Avatars */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Anime Character Presets
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {PRESET_ANIME_AVATARS.map((avatar) => {
                  const isSelected = selectedUrl === avatar.url;
                  const isFailed = failedImages[avatar.id];

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleApply(avatar.url)}
                      className={`group relative flex flex-col items-center p-3 rounded-2xl border transition-all text-center ${
                        isSelected
                          ? "bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/40"
                          : "bg-slate-950/40 border-white/5 hover:border-white/20 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 border border-white/10 group-hover:scale-105 transition-transform duration-200">
                        {!isFailed ? (
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            onError={() => handleImageError(avatar.id)}
                            className="w-full h-full object-cover bg-slate-900"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-tr ${avatar.fallbackColor} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                            {avatar.name[0]}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center backdrop-blur-[1px]">
                            <Check className="w-6 h-6 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-white truncate w-full group-hover:text-indigo-300 transition-colors">
                        {avatar.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate w-full">
                        {avatar.anime}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
