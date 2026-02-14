import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { CreateHomeSettingRequest, UpdateHomeSettingRequest, HomeSetting } from "@/models/HomeSetting";
import { buildUrl } from "@/lib/buildUrl";
import { api } from "@/routes/homeSettingRoute";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse, QueryParams } from "@/lib/interface";

// HOME SETTINGS - Get list with pagination, sorting, and search
export function useHomeSettings(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if ((params as any)?.tenantId) queryParams.append("tenantId", (params as any).tenantId);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.homeSettings.list.path}?${queryString}` : api.homeSettings.list.path;

  return useQuery({
    queryKey: [api.homeSettings.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<HomeSetting>>(url, {
        showSuccessToast: false,
      }),
  });
}

// HOME SETTING - Get single Home Setting by ID
export function useGetHomeSetting(id: string | null) {
  return useQuery({
    queryKey: [api.homeSettings.get(id || "").path],
    queryFn: () =>
      apiService.get<HomeSetting>(api.homeSettings.get(id!).path, {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

// CREATE HOME SETTING - Mutation to create a new Home Setting
export function useCreateHomeSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      // Always use FormData for consistency with server multer middleware
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("subTitle", data.subTitle);
      formData.append("tenantId", data.tenantId);
      formData.append("isActive", String(data.isActive));
      
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((file: File) => {
          formData.append("images", file);
        });
      }

      return apiService.postFormData<HomeSetting>(api.homeSettings.create.path, formData, {
        successMessage: "Home Setting created successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.homeSettings.list.path] }),
  });
}

// UPDATE HOME SETTING - Mutation to update a Home Setting
export function useUpdateHomeSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & any) => {
      // Always use FormData for consistency with server multer middleware
      const formData = new FormData();
      formData.append("title", data.title || "");
      formData.append("subTitle", data.subTitle || "");
      formData.append("tenantId", data.tenantId || "");
      formData.append("isActive", String(data.isActive || false));
      
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        data.images.forEach((file: File) => {
          formData.append("images", file);
        });
      }

      if (data.imagesToDelete && Array.isArray(data.imagesToDelete) && data.imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(data.imagesToDelete));
      }

      return apiService.patchFormData<HomeSetting>(api.homeSettings.update(id).path, formData, {
        successMessage: "Home Setting updated successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.homeSettings.list.path] }),
  });
}

// DELETE HOME SETTING - Mutation to delete a Home Setting
export function useDeleteHomeSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete(api.homeSettings.delete(id).path, {
        successMessage: "Home Setting deleted successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.homeSettings.list.path] }),
  });
}
