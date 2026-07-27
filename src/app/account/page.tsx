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
  Sparkles,
} from "lucide-react";
import { toast } from "@/store/toast-store";
import { AvatarPickerModal } from "@/components/account/avatar-picker-modal";
import { UnsavedChangesModal } from "@/components/account/unsaved-changes-modal";
import { cn } from "@/lib/utils";

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
            month: "short",
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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-6 text-foreground bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading Account...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="h-[calc(100vh-5rem)] overflow-hidden bg-background text-foreground px-4 sm:px-6 lg:px-8 py-4 font-sans flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col justify-between space-y-4">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight font-heading">
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
              Manage your personal details, anime avatar, and preferences.
            </p>
          </div>
        </div>

        {/* 2-Column Main Card Layout (Fits Single Window) */}
        <form onSubmit={handleExplicitSave} className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-0">
          
          {/* Left Column: Avatar & Profile Card */}
          <div className="md:col-span-5 bg-card backdrop-blur-xl border border-border rounded-3xl p-5 shadow-xl flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
            {/* Avatar Circle with Hover Edit */}
            <div className="relative group shrink-0">
              {image && !imageError ? (
                <img
                  src={image}
                  alt={name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-primary/50 shadow-2xl bg-card"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl border-2 border-primary/50">
                  {name[0]?.toUpperCase() || "U"}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 bg-black/65 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px] cursor-pointer"
              >
                <Camera className="w-6 h-6 mb-1 text-indigo-300" />
                <span className="text-[10px] font-bold">Change Avatar</span>
              </button>
            </div>

            {/* Profile Summary Info */}
            <div className="space-y-1 w-full px-2">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <h2 className="text-xl font-bold text-foreground tracking-tight truncate max-w-[200px] sm:max-w-[240px]">
                  {name}
                </h2>
                {isGoogleAccount && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{email}</span>
              </p>
              {createdAt && (
                <p className="text-[10px] text-muted-foreground/80 font-medium">
                  Member since {createdAt}
                </p>
              )}
            </div>

            {/* Change Avatar Button */}
            <div className="w-full pt-1">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 border border-border shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                <span>Choose Anime Avatar</span>
              </button>
            </div>
          </div>

          {/* Right Column: Personal Info Form Card */}
          <div className="md:col-span-7 bg-card backdrop-blur-xl border border-border rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2 flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Personal Information</span>
              </h3>

              {/* Display Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Full Name / Username
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>

              {/* Gender & DOB (2-Column Row) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Gender Dropdown */}
                <div className="space-y-1">
                  <label htmlFor="gender" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer pr-8"
                    >
                      <option value="" className="bg-card text-muted-foreground">Select Gender</option>
                      <option value="Male" className="bg-card text-foreground">Male</option>
                      <option value="Female" className="bg-card text-foreground">Female</option>
                      <option value="Non-Binary" className="bg-card text-foreground">Non-Binary</option>
                      <option value="Prefer not to say" className="bg-card text-foreground">Prefer not to say</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Date of Birth Calendar */}
                <div className="space-y-1">
                  <label htmlFor="dob" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-3.5 h-3.5 text-primary absolute left-3 pointer-events-none z-10" />
                    <input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Bio / Anime Motto */}
              <div className="space-y-1">
                <label htmlFor="bio" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Anime Bio / Motto
                </label>
                <textarea
                  id="bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your favorite genres, anime quote, or watching goals..."
                  className="w-full px-3.5 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="flex items-center justify-end pt-2 border-t border-border">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
