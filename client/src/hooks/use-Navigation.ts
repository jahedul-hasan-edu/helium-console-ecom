import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import type { NavigationItem } from "@/models/Navigation";

export function useNavigation(enabled: boolean = true) {
  return useQuery({
    queryKey: ["navigation"],
    queryFn: () =>
      apiService.get<NavigationItem[]>("/api/admin/navigation", {
        showSuccessToast: false,
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}