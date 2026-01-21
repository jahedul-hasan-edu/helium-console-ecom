import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import {
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionPlan,
} from "@/models/SubscriptionPlan";
import { buildUrl } from "@/lib/buildUrl";
import { api } from "@/routes/subscriptionPlanRoute";
import { ListResponse, QueryParams } from "@/lib/interface";

// SUBSCRIPTION PLANS
export function useSubscriptionPlans(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${api.subscriptionPlans.list.path}?${queryString}`
    : api.subscriptionPlans.list.path;

  return useQuery({
    queryKey: [api.subscriptionPlans.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<SubscriptionPlan>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useGetSubscriptionPlan(id: string | null) {
  return useQuery({
    queryKey: [api.subscriptionPlans.get.path(id || "")],
    queryFn: () =>
      apiService.get<SubscriptionPlan>(
        api.subscriptionPlans.get.path(id!),
        {
          showSuccessToast: false,
        }
      ),
    enabled: !!id,
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & UpdateSubscriptionPlanRequest) => {
      return apiService.patch<SubscriptionPlan>(
        api.subscriptionPlans.update.path(id),
        data,
        {
          successMessage: "Subscription plan updated successfully",
        }
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [api.subscriptionPlans.list.path],
      }),
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSubscriptionPlanRequest) => {
      return apiService.post<SubscriptionPlan>(
        api.subscriptionPlans.create.path,
        data,
        {
          successMessage: "Subscription plan created successfully",
        }
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [api.subscriptionPlans.list.path],
      }),
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(
        api.subscriptionPlans.delete.path(id),
        {
          successMessage: "Subscription plan deleted successfully",
        }
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [api.subscriptionPlans.list.path],
      }),
  });
}
