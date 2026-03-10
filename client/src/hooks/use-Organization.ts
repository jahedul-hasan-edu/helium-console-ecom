import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { ListResponse } from "@/lib/interface";
import {
  CreateOrganizationRequest,
  GetOrganizationsParams,
  Organization,
  UpdateOrganizationRequest,
} from "@/models/Organization";
import { api } from "@/routes/organizationRoute";

function buildOrganizationsUrl(basePath: string, params?: GetOrganizationsParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.tenantId) queryParams.append("tenantId", params.tenantId);

  const queryString = queryParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function appendFormData(formData: FormData, data: CreateOrganizationRequest | UpdateOrganizationRequest) {
  const stringFields: Array<keyof (CreateOrganizationRequest & UpdateOrganizationRequest)> = [
    "tenantId",
    "title",
    "logoTitle",
    "phone",
    "email",
    "address",
    "socialFbUrl",
    "socialInUrl",
    "socialXUrl",
    "socialUtubeUrl",
    "license",
    "privacyPolicy",
    "returnPolicy",
  ];

  stringFields.forEach((field) => {
    const value = data[field];
    if (typeof value === "string") {
      formData.append(field, value);
    }
  });

  if (typeof data.isActive === "boolean") {
    formData.append("isActive", data.isActive ? "true" : "false");
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  if (data.removeImage) {
    formData.append("removeImage", "true");
  }
}

export function useOrganizations(params?: GetOrganizationsParams) {
  const url = buildOrganizationsUrl(api.organizations.list.path, params);

  return useQuery({
    queryKey: [api.organizations.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<Organization>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useOrganization(id: string | null, tenantId?: string | null) {
  const basePath = api.organizations.get(id || "").path;
  const url = tenantId ? `${basePath}?tenantId=${encodeURIComponent(tenantId)}` : basePath;

  return useQuery({
    queryKey: [api.organizations.get(id || "").path, tenantId],
    queryFn: () =>
      apiService.get<Organization>(url, {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationRequest) => {
      const formData = new FormData();
      appendFormData(formData, data);

      return apiService.postFormData<Organization>(api.organizations.create.path, formData, {
        successMessage: "Organization created successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      currentTenantId,
    }: {
      id: string;
      data: UpdateOrganizationRequest;
      currentTenantId?: string;
    }) => {
      const formData = new FormData();
      appendFormData(formData, data);

      const url = currentTenantId
        ? `${api.organizations.update(id).path}?tenantId=${encodeURIComponent(currentTenantId)}`
        : api.organizations.update(id).path;

      return apiService.patchFormData<Organization>(url, formData, {
        successMessage: "Organization updated successfully",
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.organizations.get(variables.id).path] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId?: string }) => {
      const url = tenantId
        ? `${api.organizations.delete(id).path}?tenantId=${encodeURIComponent(tenantId)}`
        : api.organizations.delete(id).path;

      return apiService.delete<void>(url, {
        successMessage: "Organization deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.organizations.list.path] });
    },
  });
}