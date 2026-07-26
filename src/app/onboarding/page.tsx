"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCircle2,
  Zap,
  Flame,
  Heart,
  ShieldAlert,
  Clock,
  Calendar,
  Loader2,
  Film,
} from "lucide-react";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/utils";

// --- CONSTANTS ---
const GENRES = [
  "Action",
  "Adventure",
  "Fantasy",
  "Romance",
  "Slice of Life",
  "Comedy",
  "Mystery",
  "Psychological",
  "Horror",
  "Sports",
  "Music",
  "Mecha",
  "Sci-Fi",
  "Supernatural",
  "Drama",
];

const MOODS = [
  { name: "Dark", icon: "🌒", desc: "Gritty & mature themes" },
  { name: "Emotional", icon: "😭", desc: "Tear-jerkers & deep feelings" },
  { name: "Wholesome", icon: "🌸", desc: "Heartwarming & uplifting" },
  { name: "Cozy", icon: "☕", desc: "Relaxing slice-of-life" },
  { name: "Mind-bending", icon: "🧠", desc: "Complex plots & twists" },
  { name: "Fast-paced", icon: "⚡", desc: "High energy & action" },
  { name: "Relaxing", icon: "🍃", desc: "Chill & low stakes" },
  { name: "Epic", icon: "🔥", desc: "Grand scale battles & lore" },
  { name: "Funny", icon: "😂", desc: "Pure comedy & satire" },
  { name: "Thought-provoking", icon: "🔮", desc: "Philosophical & deep" },
];

const AVOID_TAGS = [
  "Ecchi",
  "Gore",
  "Horror",
  "Romance",
  "Long-running anime",
  "CGI-heavy animation",
  "Sad endings",
  "Slow burn",
];

const LENGTH_OPTIONS = [
  { id: "MOVIES", label: "Movies", desc: "Standalone feature films (90-120 mins)" },
  { id: "12_EPISODES", label: "12 Episodes", desc: "Short 1-cour seasonal series" },
  { id: "24_EPISODES", label: "24 Episodes", desc: "Standard 2-cour series" },
  { id: "LONG_SERIES", label: "Long Series", desc: "Multi-season epic sagas (50+ eps)" },
  { id: "NO_PREFERENCE", label: "No Preference", desc: "I enjoy all formats equally" },
];

const ERA_OPTIONS = [
  { id: "CLASSICS", label: "Classics", desc: "Pre-2010 retro & legendary masterpieces" },
  { id: "MODERN", label: "Modern", desc: "2010–2023 high-production anime" },
  { id: "SEASONAL", label: "Latest Seasonal", desc: "2024–2026 currently airing hits" },
  { id: "NO_PREFERENCE", label: "No Preference", desc: "Great stories from any era" },
];

interface AnimeSearchItem {
  id: number;
  title: string;
  image: string;
  genres: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // State
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [favoriteAnime, setFavoriteAnime] = useState<AnimeSearchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedAvoid, setSelectedAvoid] = useState<string[]>([]);
  const [preferredLength, setPreferredLength] = useState("NO_PREFERENCE");
  const [preferredEra, setPreferredEra] = useState("NO_PREFERENCE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- AniList API Live Search for Step 3 ---
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
              title {
                english
                romaji
              }
              coverImage {
                large
              }
              genres
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
        genres: m.genres || [],
      }));

      setSearchResults(formatted);
    } catch (e) {
      console.error("AniList search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Step 3 Favorite Toggle
  const toggleFavoriteAnime = (item: AnimeSearchItem) => {
    if (favoriteAnime.some((a) => a.id === item.id)) {
      setFavoriteAnime(favoriteAnime.filter((a) => a.id !== item.id));
    } else {
      setFavoriteAnime([...favoriteAnime, item]);
    }
  };

  // Finish Onboarding Submission
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        genres: selectedGenres,
        favoriteAnimeIds: favoriteAnime.map((a) => String(a.id)),
        moods: selectedMoods,
        avoidTags: selectedAvoid,
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

      toast.success("Profile Personalization Ready!", "Redirecting to your home feed...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      toast.error("Onboarding Error", err.message || "Failed to initialize profile.");
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 2 && selectedGenres.length === 0) {
      toast.warn("Select Genres", "Please select at least 1 favorite genre.");
      return;
    }
    if (step === 3 && favoriteAnime.length < 5) {
      toast.warn("Pick Favorites", `Select at least 5 anime (${favoriteAnime.length}/5 selected).`);
      return;
    }

    if (step === 7) {
      setStep(8);
      handleFinish();
    } else {
      setStep((prev) => Math.min(8, prev + 1));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header & Progress Bar */}
      <div className="max-w-3xl w-full mx-auto space-y-4 relative z-10 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
              {step}
            </div>
            <span className="font-semibold text-slate-200">
              Step {step} of 8 — {step === 1 ? "Welcome" : step === 8 ? "Initializing" : "Personalization"}
            </span>
          </div>
          {step > 1 && step < 8 && (
            <button
              onClick={() => setStep(8)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Skip to finish
            </button>
          )}
        </div>

        {/* Step Progress Track */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-primary via-indigo-500 to-rose-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Content */}
      <div className="max-w-3xl w-full mx-auto my-auto py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl space-y-8"
          >
            {/* STEP 1: WELCOME */}
            {step === 1 && (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-rose-600 flex items-center justify-center mx-auto shadow-xl shadow-primary/30 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                    Welcome to Animatrix Personalization
                  </h1>
                  <p className="text-slate-400 text-sm max-w-lg mx-auto">
                    Let&apos;s build your anime taste profile. No boring surveys — just tell us what you love, what you dislike, and your vibe.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <Zap className="w-5 h-5 text-primary mb-2" />
                    <h4 className="text-xs font-bold text-white">Smart Engine</h4>
                    <p className="text-[11px] text-slate-400">Personalized feeds based on your taste fingerprint.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <Flame className="w-5 h-5 text-rose-500 mb-2" />
                    <h4 className="text-xs font-bold text-white">Zero Spoilers</h4>
                    <p className="text-[11px] text-slate-400">Curated collections matching your exact preferred era & length.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <ShieldAlert className="w-5 h-5 text-indigo-400 mb-2" />
                    <h4 className="text-xs font-bold text-white">Negative Filtering</h4>
                    <p className="text-[11px] text-slate-400">Never get recommended tropes or genres you avoid.</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FAVORITE GENRES */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    Choose Your Favorite Genres
                  </h2>
                  <p className="text-xs text-slate-400">
                    Select up to 5 genres you enjoy the most ({selectedGenres.length}/5 selected)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGenres(selectedGenres.filter((g) => g !== genre));
                          } else if (selectedGenres.length < 5) {
                            setSelectedGenres([...selectedGenres, genre]);
                          } else {
                            toast.warn("Max 5 Genres", "You can select up to 5 favorite genres.");
                          }
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border cursor-pointer",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        )}
                      >
                        {genre}
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: FAVORITE ANIME (AniList Live Search) */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    Pick Your Top Anime
                  </h2>
                  <p className="text-xs text-slate-400">
                    Search AniList & pick at least 5 anime you adore ({favoriteAnime.length}/5 selected)
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchAnime(e.target.value)}
                    placeholder="Search anime e.g. Attack on Titan, Frieren, Jujutsu Kaisen..."
                    className="w-full pl-10 pr-4 py-3 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all"
                  />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Selected Favorite Chips */}
                {favoriteAnime.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                    {favoriteAnime.map((item) => (
                      <span
                        key={item.id}
                        onClick={() => toggleFavoriteAnime(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/20 border border-primary/40 text-xs font-semibold text-primary cursor-pointer hover:bg-primary/30"
                      >
                        {item.title} ×
                      </span>
                    ))}
                  </div>
                )}

                {/* Search Results Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
                  {searchResults.map((item) => {
                    const isPicked = favoriteAnime.some((a) => a.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleFavoriteAnime(item)}
                        className={cn(
                          "relative rounded-xl overflow-hidden border cursor-pointer group transition-all",
                          isPicked
                            ? "border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/30"
                            : "border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <img src={item.image} alt={item.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 flex flex-col justify-end">
                          <span className="text-[11px] font-semibold text-white truncate">{item.title}</span>
                        </div>
                        {isPicked && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: PREFERRED MOODS */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    What Vibe Are You In The Mood For?
                  </h2>
                  <p className="text-xs text-slate-400">Select any moods that match your favorite watching style</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {MOODS.map((m) => {
                    const isSelected = selectedMoods.includes(m.name);
                    return (
                      <button
                        key={m.name}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMoods(selectedMoods.filter((x) => x !== m.name));
                          } else {
                            setSelectedMoods([...selectedMoods, m.name]);
                          }
                        }}
                        className={cn(
                          "p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-primary/20 border-primary shadow-lg shadow-primary/20"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{m.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{m.name}</div>
                            <div className="text-[11px] text-slate-400">{m.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: THINGS TO AVOID */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    Things To Avoid
                  </h2>
                  <p className="text-xs text-slate-400">Select tropes or themes you prefer NOT to see in recommendations</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {AVOID_TAGS.map((tag) => {
                    const isSelected = selectedAvoid.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAvoid(selectedAvoid.filter((t) => t !== tag));
                          } else {
                            setSelectedAvoid([...selectedAvoid, tag]);
                          }
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border cursor-pointer",
                          isSelected
                            ? "bg-rose-600/30 text-rose-300 border-rose-500"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        )}
                      >
                        {tag}
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: PREFERRED LENGTH */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    Preferred Anime Length
                  </h2>
                  <p className="text-xs text-slate-400">What format fits your daily watching schedule?</p>
                </div>
                <div className="space-y-2.5">
                  {LENGTH_OPTIONS.map((opt) => {
                    const isSelected = preferredLength === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setPreferredLength(opt.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-primary/20 border-primary shadow-lg shadow-primary/20"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> {opt.label}
                          </div>
                          <div className="text-[11px] text-slate-400">{opt.desc}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: PREFERRED ERA */}
            {step === 7 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    Preferred Anime Era
                  </h2>
                  <p className="text-xs text-slate-400">Which release generation do you favor?</p>
                </div>
                <div className="space-y-2.5">
                  {ERA_OPTIONS.map((opt) => {
                    const isSelected = preferredEra === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setPreferredEra(opt.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-primary/20 border-primary shadow-lg shadow-primary/20"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" /> {opt.label}
                          </div>
                          <div className="text-[11px] text-slate-400">{opt.desc}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 8: FINISHING */}
            {step === 8 && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto relative">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <Sparkles className="w-5 h-5 text-indigo-400 absolute top-2 right-2 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Initializing Recommendation Matrix</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    We&apos;re indexing your favorite genres, AniList titles, and mood tags into your personalized engine.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            {step < 8 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                {step > 1 ? (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}

                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {step === 7 ? "Finish & Personalize" : "Continue"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
