import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import {
  CreateTenantSubscriptionRequest,
  UpdateTenantSubscriptionRequest,
  TenantSubscription,
} from "@/models/TenantSubscription";
import { api } from "@/routes/tenantSubscriptionRoute";
import { ListResponse, QueryParams } from "@/lib/interface";

// TENANT SUBSCRIPTIONS
export function useTenantSubscriptions(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${api.tenantSubscriptions.list.path}?${queryString}`
    : api.tenantSubscriptions.list.path;

  return useQuery({
    queryKey: [api.tenantSubscriptions.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<TenantSubscription>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useGetTenantSubscription(id: string | null) {
  return useQuery({
    queryKey: [api.tenantSubscriptions.get.path(id || "")],
    queryFn: () =>
      apiService.get<TenantSubscription>(api.tenantSubscriptions.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useUpdateTenantSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateTenantSubscriptionRequest) => {
      return apiService.patch<TenantSubscription>(
        api.tenantSubscriptions.update.path(id),
        data,
        {
          successMessage: "Tenant subscription updated successfully",
        }
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.tenantSubscriptions.list.path] }),
  });
}

export function useCreateTenantSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTenantSubscriptionRequest) => {
      return apiService.post<TenantSubscription>(api.tenantSubscriptions.create.path, data, {
        successMessage: "Tenant subscription created successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.tenantSubscriptions.list.path] }),
  });
}

export function useDeleteTenantSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.tenantSubscriptions.delete.path(id), {
        successMessage: "Tenant subscription deleted successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.tenantSubscriptions.list.path] }),
  });
}
