import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";

/**
 * Hook to check if an email already exists
 * Returns null if email doesn't exist, or the user object if it does
 */
export function useCheckEmail(email: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["checkEmail", email],
    queryFn: async () => {
      if (!email) return null;
      try {
        const result = await apiService.get<{ exists: boolean; user?: any }>(
          `/api/admin/users/check-email?email=${encodeURIComponent(email)}`,
          {
            showSuccessToast: false,
            showErrorToast: false,
          }
        );
        return result.exists ? result : null;
      } catch (error) {
        return null;
      }
    },
    enabled: enabled && !!email && email.includes("@"),
  });
}
