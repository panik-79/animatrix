"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Flame,
  Clock,
  Calendar,
  Loader2,
  Film,
  Compass,
  X,
} from "lucide-react";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const GENRES = [
  "Action",
  "Adventure",
  "Fantasy",
  "Romance",
  "Slice of Life",
  "Comedy",
  "Mystery",
  "Psychological",
  "Sports",
  "Sci-Fi",
  "Supernatural",
  "Drama",
];

const MOODS = [
  { name: "Dark", icon: "🌒" },
  { name: "Emotional", icon: "😭" },
  { name: "Wholesome", icon: "🌸" },
  { name: "Mind-bending", icon: "🧠" },
  { name: "Fast-paced", icon: "⚡" },
  { name: "Epic", icon: "🔥" },
  { name: "Funny", icon: "😂" },
  { name: "Cozy", icon: "☕" },
];

const POPULAR_FAVORITES = [
  { id: 16498, title: "Attack on Titan", image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg" },
  { id: 154587, title: "Frieren: Beyond Journey's End", image: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg" },
  { id: 113415, title: "Jujutsu Kaisen", image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg" },
  { id: 38000, title: "Demon Slayer", image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg" },
  { id: 151807, title: "Solo Leveling", image: "https://cdn.myanimelist.net/images/anime/1170/124179.jpg" },
  { id: 1535, title: "Death Note", image: "https://cdn.myanimelist.net/images/anime/9/9444.jpg" },
  { id: 9253, title: "Steins;Gate", image: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg" },
  { id: 21, title: "One Piece", image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg" },
];

const LENGTH_OPTIONS = [
  { id: "NO_PREFERENCE", label: "Any Length", desc: "All formats equally" },
  { id: "12_EPISODES", label: "Short (12 Eps)", desc: "Seasonal 1-cour series" },
  { id: "24_EPISODES", label: "Medium (24 Eps)", desc: "Standard 2-cour series" },
  { id: "LONG_SERIES", label: "Long Series", desc: "Multi-season sagas" },
];

const ERA_OPTIONS = [
  { id: "NO_PREFERENCE", label: "Any Era", desc: "Masterpieces from all eras" },
  { id: "SEASONAL", label: "Latest Hits", desc: "Currently airing 2024–2026" },
  { id: "MODERN", label: "Modern Era", desc: "High production 2010–2023" },
  { id: "CLASSICS", label: "Classics", desc: "Pre-2010 legendary retro" },
];

interface AnimeSearchItem {
  id: number;
  title: string;
  image: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // State
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [favoriteAnime, setFavoriteAnime] = useState<AnimeSearchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [preferredLength, setPreferredLength] = useState("NO_PREFERENCE");
  const [preferredEra, setPreferredEra] = useState("NO_PREFERENCE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AniList Live Search
  const handleSearchAnime = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const gqlQuery = `
        query ($search: String) {
          Page(page: 1, perPage: 8) {
            media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
              id
              title { english romaji }
              coverImage { large }
            }
          }
        }
      `;

      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: gqlQuery, variables: { search: query } }),
      });

      const json = await res.json();
      const mediaList = json?.data?.Page?.media || [];
      const formatted: AnimeSearchItem[] = mediaList.map((m: any) => ({
        id: m.id,
        title: m.title.english || m.title.romaji,
        image: m.coverImage.large,
      }));

      setSearchResults(formatted);
    } catch (e) {
      console.error("AniList search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavoriteAnime = (item: AnimeSearchItem) => {
    if (favoriteAnime.some((a) => a.id === item.id)) {
      setFavoriteAnime(favoriteAnime.filter((a) => a.id !== item.id));
    } else {
      setFavoriteAnime([...favoriteAnime, item]);
    }
  };

  // Submit Onboarding Preferences
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        genres: selectedGenres,
        favoriteAnimeIds: favoriteAnime.map((a) => String(a.id)),
        moods: selectedMoods,
        avoidTags: [],
        preferredLength,
        preferredEra,
        complete: true,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save onboarding preferences");
      }

      toast.success("Welcome to Animatrix! 🎉", "Your personalized feed is ready.");
      router.push("/");
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to initialize profile.");
      setIsSubmitting(false);
    }
  };

  // Skip Functionality (Saves current state / defaults immediately)
  const handleSkip = () => {
    void handleFinish();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header & Progress Tracker */}
      <div className="max-w-2xl w-full mx-auto space-y-4 relative z-10 pt-2">
        <div className="flex items-center justify-between">
          <Logo height={32} />
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-accent"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? "Genres & Vibe" : step === 2 ? "Top Favorites" : "Format & Era"}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-2xl w-full mx-auto my-auto py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-card border border-border/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6"
          >
            {/* STEP 1: GENRES & VIBE */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                      What genres & vibes do you love?
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Optional — select genres and moods to tune your recommendation algorithm.
                  </p>
                </div>

                {/* Genre Pills */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Genres ({selectedGenres.length} selected)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    {GENRES.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedGenres(selectedGenres.filter((g) => g !== genre));
                            } else {
                              setSelectedGenres([...selectedGenres, genre]);
                            }
                          }}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                              : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          <span>{genre}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mood Pills */}
                <div className="space-y-2 pt-2 border-t border-border/80">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Preferred Vibe ({selectedMoods.length} selected)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => {
                      const isSelected = selectedMoods.includes(m.name);
                      return (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMoods(selectedMoods.filter((x) => x !== m.name));
                            } else {
                              setSelectedMoods([...selectedMoods, m.name]);
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer",
                            isSelected
                              ? "bg-primary/20 border-primary text-primary shadow-sm"
                              : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          <span>{m.icon}</span>
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FAVORITE ANIME */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <Film className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                      Pick any anime you adore
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tap popular hits or search for specific titles ({favoriteAnime.length} selected).
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchAnime(e.target.value)}
                    placeholder="Search e.g. Attack on Titan, Frieren, Solo Leveling..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-background border border-border hover:border-primary/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
                  />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Selected Favorite Chips */}
                {favoriteAnime.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {favoriteAnime.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleFavoriteAnime(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/15 border border-primary/40 text-xs font-bold text-primary cursor-pointer hover:bg-primary/25 transition-colors"
                      >
                        <span className="truncate max-w-[140px]">{item.title}</span>
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Hits Grid (Default view when not searching) */}
                {!searchQuery.trim() ? (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Popular Hits
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {POPULAR_FAVORITES.map((item) => {
                        const isPicked = favoriteAnime.some((a) => a.id === item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleFavoriteAnime(item)}
                            className={cn(
                              "relative rounded-2xl overflow-hidden border cursor-pointer group transition-all h-24 sm:h-28 shadow-sm",
                              isPicked
                                ? "border-primary ring-2 ring-primary/40 shadow-md"
                                : "border-border hover:border-primary/40"
                            )}
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 flex flex-col justify-end">
                              <span className="text-[11px] font-extrabold text-white leading-tight line-clamp-1">
                                {item.title}
                              </span>
                            </div>
                            {isPicked && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Search Results Grid */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {searchResults.map((item) => {
                      const isPicked = favoriteAnime.some((a) => a.id === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleFavoriteAnime(item)}
                          className={cn(
                            "relative rounded-2xl overflow-hidden border cursor-pointer group transition-all h-24 sm:h-28 shadow-sm",
                            isPicked
                              ? "border-primary ring-2 ring-primary/40 shadow-md"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 flex flex-col justify-end">
                            <span className="text-[11px] font-extrabold text-white leading-tight line-clamp-1">
                              {item.title}
                            </span>
                          </div>
                          {isPicked && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: FORMAT & ERA */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <Compass className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                      Watching preferences
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customize preferred episode length and release era.
                  </p>
                </div>

                {/* Length Options */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Preferred Length</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LENGTH_OPTIONS.map((opt) => {
                      const isSelected = preferredLength === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPreferredLength(opt.id)}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-0.5 shadow-sm",
                            isSelected
                              ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                              : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          <div className="text-xs font-bold text-foreground flex items-center justify-between">
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Era Options */}
                <div className="space-y-2 pt-2 border-t border-border/80">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Preferred Era</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ERA_OPTIONS.map((opt) => {
                      const isSelected = preferredEra === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPreferredEra(opt.id)}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-0.5 shadow-sm",
                            isSelected
                              ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                              : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          <div className="text-xs font-bold text-foreground flex items-center justify-between">
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/80">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-accent text-xs font-bold text-foreground transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.min(3, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Finish & Explore</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
