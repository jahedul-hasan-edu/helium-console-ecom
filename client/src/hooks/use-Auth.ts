import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import type { SubscriptionPlanOption, SystemStatus } from "@/models/Auth";

export function useSystemStatus() {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: () =>
      apiService.get<SystemStatus>("/api/auth/system-status", {
        showSuccessToast: false,
        showErrorToast: false,
      }),
    staleTime: 30_000,
  });
}

export function usePublicSubscriptionPlans() {
  return useQuery({
    queryKey: ["public-subscription-plans"],
    queryFn: () =>
      apiService.get<SubscriptionPlanOption[]>("/api/auth/subscription-plans", {
        showSuccessToast: false,
      }),
    staleTime: 5 * 60_000,
  });
}