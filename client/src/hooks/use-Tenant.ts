import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { CreateTenantRequest, UpdateTenantRequest, Tenant } from "@/models/Tenant";
import { buildUrl } from "@/lib/buildUrl";
import { api } from "@/routes/tenantRoute";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse, QueryParams } from "@/lib/interface";

// TENANTS
export function useTenants(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.tenants.list.path}?${queryString}` : api.tenants.list.path;

  return useQuery({
    queryKey: [api.tenants.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<Tenant>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useGetTenant(id: string | null) {
  return useQuery({
    queryKey: [api.tenants.get.path(id || "")],
    queryFn: () =>
      apiService.get<Tenant>(api.tenants.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateTenantRequest) => {
      return apiService.patch<Tenant>(api.tenants.update.path(id), data, {
        successMessage: "Tenant updated successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.tenants.list.path] }),
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTenantRequest) => {
      return apiService.post<Tenant>(api.tenants.create.path, data, {
        successMessage: "Tenant created successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.tenants.list.path] }),
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.tenants.delete.path(id), {
        successMessage: "Tenant deleted successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.tenants.list.path] }),
  });
}

export function useCheckDomain(domain: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [api.tenants.checkDomain.path(domain), domain],
    queryFn: () =>
      apiService.get<{ exists: boolean; tenant: Tenant | null }>(
        api.tenants.checkDomain.path(domain),
        { showSuccessToast: false }
      ),
    enabled: enabled && !!domain,
  });
}
