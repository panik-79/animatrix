"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Loader2,
  Camera,
  ShieldCheck,
  Save,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  Share2,
  Download,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/store/toast-store";
import { AvatarPickerModal } from "@/components/account/avatar-picker-modal";
import { UnsavedChangesModal } from "@/components/account/unsaved-changes-modal";
import { CustomDropdown } from "@/components/shared/custom-dropdown";
import { useShareableCardModal } from "@/components/shared/shareable-card-modal";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Non-Binary", value: "Non-Binary" },
  { label: "Prefer not to say", value: "Prefer not to say" },
];

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [googleImage, setGoogleImage] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>("");

  // Baseline Initial Data (for tracking unsaved changes)
  const [initialData, setInitialData] = useState<{
    name: string;
    image: string | null;
    gender: string;
    dateOfBirth: string;
    bio: string;
  } | null>(null);

  // Navigation Interception State
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Computed isDirty
  const isDirty =
    initialData !== null &&
    (name !== initialData.name ||
      image !== initialData.image ||
      gender !== initialData.gender ||
      dateOfBirth !== initialData.dateOfBirth ||
      bio !== initialData.bio);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Protect against browser tab close / reload if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Intercept internal link navigation if form is dirty
  useEffect(() => {
    if (!isDirty) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href && !target.href.startsWith("javascript:")) {
        try {
          const targetUrl = new URL(target.href, window.location.origin);
          if (targetUrl.pathname !== window.location.pathname) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            setPendingNavigation(targetUrl.pathname + targetUrl.search + targetUrl.hash);
            setShowUnsavedModal(true);
          }
        } catch {
          // Ignore invalid URLs
        }
      }
    };

    window.addEventListener("click", handleClick, { capture: true });
    return () => window.removeEventListener("click", handleClick, { capture: true });
  }, [isDirty]);

  // Intercept browser back/forward buttons
  useEffect(() => {
    if (!isDirty) return;

    window.history.pushState({ unsavedProtection: true }, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState({ unsavedProtection: true }, "", window.location.href);
      setPendingNavigation("BACK");
      setShowUnsavedModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.status === 401) {
        router.push("/login?from=/account");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load account profile");

      const u = data.user;
      const loadedName = u.name || "";
      const loadedImage = u.image || null;
      const loadedGender = u.gender || "";
      const loadedDob = u.dateOfBirth || "";
      const loadedBio = u.bio || "";

      setName(loadedName);
      setEmail(u.email || "");
      setImage(loadedImage);
      if (u.isGoogleAccount && u.image) {
        setGoogleImage(u.image);
      }
      setGender(loadedGender);
      setDateOfBirth(loadedDob);
      setBio(loadedBio);
      setIsGoogleAccount(Boolean(u.isGoogleAccount));

      if (u.createdAt) {
        setCreatedAt(
          new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        );
      }

      setInitialData({
        name: loadedName,
        image: loadedImage,
        gender: loadedGender,
        dateOfBirth: loadedDob,
        bio: loadedBio,
      });
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfileData = async (): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image,
          gender: gender || null,
          dateOfBirth: dateOfBirth || null,
          bio: bio || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setInitialData({
        name,
        image,
        gender: gender || "",
        dateOfBirth: dateOfBirth || "",
        bio: bio || "",
      });

      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Account Updated", "Your profile details have been saved.");
      return true;
    } catch (err: any) {
      toast.error("Save Error", err.message || "Failed to save profile.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleExplicitSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveProfileData();
    if (success) {
      router.push("/");
    }
  };

  const handleSaveAndLeave = async () => {
    const success = await saveProfileData();
    if (success) {
      setShowUnsavedModal(false);
      executeNavigation();
    }
  };

  const handleDiscardAndLeave = () => {
    if (initialData) {
      setName(initialData.name);
      setImage(initialData.image);
      setGender(initialData.gender);
      setDateOfBirth(initialData.dateOfBirth);
      setBio(initialData.bio);
    }
    setShowUnsavedModal(false);
    executeNavigation();
  };

  const handleKeepEditing = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const executeNavigation = () => {
    const nav = pendingNavigation;
    setPendingNavigation(null);
    if (!nav || nav === "BACK") {
      router.back();
    } else {
      router.push(nav);
    }
  };

  const handleSelectAvatar = (newImageUrl: string) => {
    setImage(newImageUrl);
    setImageError(false);
    toast.info("Avatar Selected", "Click 'Save Changes' to finalize your profile photo.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading Account...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-8 py-6 pb-20 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-card border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-foreground tracking-tight font-heading">
                  My Account
                </h1>
                {isDirty && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] font-bold animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved Changes
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Manage your personal profile and avatar settings
              </p>
            </div>
          </div>
        </div>

        {/* Ultra-Sleek Profile Card Container */}
        <form onSubmit={handleExplicitSave} className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl space-y-0">
          
          {/* Top Banner Gradient */}
          <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-primary/30 via-indigo-600/30 to-purple-600/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
          </div>

          {/* Main Card Content */}
          <div className="px-6 sm:px-8 pb-8 -mt-16 space-y-6 relative z-10">
            
            {/* Avatar Row */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="relative group">
                {image && !imageError ? (
                  <img
                    src={image}
                    alt={name}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-card shadow-2xl bg-card"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl border-4 border-card">
                    {name[0]?.toUpperCase() || "U"}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px] cursor-pointer"
                >
                  <Camera className="w-6 h-6 mb-1 text-indigo-300" />
                  <span className="text-[10px] font-bold">Change Avatar</span>
                </button>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-muted/60 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border border-border shadow-sm active:scale-95"
                >
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span>Choose Anime Avatar</span>
                </button>

                <button
                  type="button"
                  onClick={() => useShareableCardModal.getState().openModal()}
                  className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Anime Card</span>
                </button>
              </div>
            </div>

            {/* Profile Overview Banner Details */}
            <div className="space-y-1 pt-1 border-b border-border pb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{name}</h2>
                {isGoogleAccount && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{email}</span>
                {createdAt && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span>Member since {createdAt}</span>
                  </>
                )}
              </p>
            </div>

            {/* Form Fields Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground tracking-tight font-heading">
                  Personal Information
                </h3>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Full Name / Username
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 text-xs bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Gender & DOB (2-Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Gender
                  </label>
                  <CustomDropdown
                    options={GENDER_OPTIONS}
                    value={gender}
                    onChange={setGender}
                    placeholder="Select Gender"
                    size="lg"
                  />
                </div>

                {/* Date of Birth Calendar */}
                <div className="space-y-1.5">
                  <label htmlFor="dob" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-primary absolute left-3.5 pointer-events-none z-10" />
                    <input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs bg-muted/30 border border-border rounded-2xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Bio / Anime Motto */}
              <div className="space-y-1.5">
                <label htmlFor="bio" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Anime Bio / Motto
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your favorite genres, anime quote, or watching goals..."
                  className="w-full px-4 py-3 text-xs bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              {/* Shareable Anime Card Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-primary" />
                    <span>Shareable Anime Profile Card</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Generate an official high-res PNG card of your watch progress and stats to share on social media.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => useShareableCardModal.getState().openModal()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card</span>
                </button>
              </div>
            </div>

            {/* Submit Action Toolbar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-2xl shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Modals */}
        <AvatarPickerModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentImage={image}
          googleImage={googleImage}
          onSelectAvatar={handleSelectAvatar}
        />

        <UnsavedChangesModal
          isOpen={showUnsavedModal}
          isSaving={saving}
          onSaveAndLeave={handleSaveAndLeave}
          onDiscardAndLeave={handleDiscardAndLeave}
          onKeepEditing={handleKeepEditing}
        />
      </div>
    </main>
  );
}
