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
} from "lucide-react";
import { toast } from "@/store/toast-store";
import { AvatarPickerModal } from "@/components/account/avatar-picker-modal";

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

  useEffect(() => {
    fetchProfile();
  }, []);

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
      setName(u.name || "");
      setEmail(u.email || "");
      setImage(u.image || null);
      if (u.isGoogleAccount && u.image) {
        setGoogleImage(u.image);
      }
      setGender(u.gender || "");
      setDateOfBirth(u.dateOfBirth || "");
      setBio(u.bio || "");
      setIsGoogleAccount(Boolean(u.isGoogleAccount));
      if (u.createdAt) {
        setCreatedAt(new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }));
      }
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Account Updated", "Your profile details have been saved.");
    } catch (err: any) {
      toast.error("Save Error", err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
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
          <span className="text-sm font-medium">Loading My Account...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-12 pb-24 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            My Account
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            Manage your profile details, avatar, and personal preferences.
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Area with Change Button */}
          <div className="relative group shrink-0">
            {image && !imageError ? (
              <img
                src={image}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-28 h-28 rounded-full object-cover border-2 border-primary/50 shadow-xl bg-card"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl border-2 border-primary/50">
                {name[0]?.toUpperCase() || "U"}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px] cursor-pointer"
            >
              <Camera className="w-6 h-6 mb-1 text-indigo-300" />
              <span className="text-[10px] font-semibold">Change Avatar</span>
            </button>
          </div>

          {/* User Summary info */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{name}</h2>
              {isGoogleAccount && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Google Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {email}
            </p>
            {createdAt && (
              <p className="text-[11px] text-muted-foreground">
                Member since {createdAt}
              </p>
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl dark:bg-white/10 bg-slate-200/60 hover:bg-slate-200 text-foreground transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border border-border"
              >
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                <span>Choose Anime Avatar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-4">
              Personal Information
            </h3>

            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Name / Username
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 text-xs dark:bg-slate-950/70 bg-slate-100/70 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* Gender Dropdown */}
            <div className="space-y-2">
              <label htmlFor="gender" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full appearance-none px-4 py-3 text-xs dark:bg-slate-950/70 bg-slate-100/70 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer pr-10"
                >
                  <option value="" className="bg-card text-muted-foreground">Select Gender</option>
                  <option value="Male" className="bg-card text-foreground">Male</option>
                  <option value="Female" className="bg-card text-foreground">Female</option>
                  <option value="Non-Binary" className="bg-card text-foreground">Non-Binary</option>
                  <option value="Prefer not to say" className="bg-card text-foreground">Prefer not to say</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date of Birth Calendar */}
            <div className="space-y-2">
              <label htmlFor="dob" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date of Birth
              </label>
              <div className="relative max-w-sm flex items-center">
                <Calendar className="w-4 h-4 text-primary absolute left-3.5 pointer-events-none z-10" />
                <input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs dark:bg-slate-950/70 bg-slate-100/70 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Used to tailor personalized recommendations and anime release highlights.
              </p>
            </div>

            {/* Bio / Anime Motto */}
            <div className="space-y-2">
              <label htmlFor="bio" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Anime Bio / Motto
              </label>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your favorite genres, anime quote, or watching goals..."
                className="w-full px-4 py-3 text-xs dark:bg-slate-950/70 bg-slate-100/70 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
        </form>

        {/* Avatar Selection Modal */}
        <AvatarPickerModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentImage={image}
          googleImage={googleImage}
          onSelectAvatar={handleSelectAvatar}
        />
      </div>
    </main>
  );
}
