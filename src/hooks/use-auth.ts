import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/store/toast-store";
import { confirmDialog } from "@/store/confirm-store";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  role: string;
  isOnboarded: boolean;
  isGoogleAccount?: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery<AuthUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) {
        if (res.status === 401) return null;
        const authMeRes = await fetch("/api/auth/me");
        if (!authMeRes.ok) return null;
        return (await authMeRes.json()).user;
      }
      const data = await res.json();
      return data.user ?? null;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const confirmed = await confirmDialog({
        title: "Sign Out",
        message: "Are you sure you want to sign out?",
        confirmText: "Yup!",
        cancelText: "Cancel",
        variant: "danger",
      });
      if (!confirmed) return false;

      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Failed to sign out");
      return true;
    },
    onSuccess: (didLogout) => {
      if (didLogout) {
        queryClient.setQueryData(["current-user"], null);
        queryClient.invalidateQueries();
        toast.info("Signed Out", "You have been logged out.");
      }
    },
    onError: (err: Error) => {
      toast.error("Logout Error", err.message);
    },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data),
    refetch: query.refetch,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
