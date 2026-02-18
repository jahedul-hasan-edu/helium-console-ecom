import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { api } from "@/routes/popupAdRoute";
import { QueryParams, ListResponse } from "@/lib/interface";
import { PopupAd } from "@/models/PopupAd";

// Get list with pagination, sorting, and search
export function usePopupAds(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if ((params as any)?.tenantId) queryParams.append("tenantId", (params as any).tenantId);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.popupAds.list.path}?${queryString}` : api.popupAds.list.path;

  return useQuery({
    queryKey: [api.popupAds.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<PopupAd>>(url, {
        showSuccessToast: false,
      }),
  });
}

// Get single Popup Ad by ID
export function usePopupAd(id: string | null) {
  return useQuery({
    queryKey: [api.popupAds.get(id || "").path],
    queryFn: () =>
      apiService.get<PopupAd>(api.popupAds.get(id!).path, {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

// Create Popup Ad mutation
export function useCreatePopupAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append("tenantId", data.tenantId);
      formData.append("title", data.title);
      formData.append("isActive", data.isActive ? "true" : "false");

      if (data.image) {
        formData.append("image", data.image);
      }

      return apiService.postFormData<PopupAd>(api.popupAds.create.path, formData, {
        showSuccessToast: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.popupAds.list.path] });
    },
  });
}

// Update Popup Ad mutation
export function useUpdatePopupAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const formData = new FormData();

      if (data.tenantId) formData.append("tenantId", data.tenantId);
      if (data.title) formData.append("title", data.title);
      if (data.isActive !== undefined) formData.append("isActive", data.isActive ? "true" : "false");
      if (data.removeImage) formData.append("removeImage", "true");
      if (data.image) {
        formData.append("image", data.image);
      }

      return apiService.patchFormData<PopupAd>(api.popupAds.update(id).path, formData, {
        showSuccessToast: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.popupAds.list.path] });
    },
  });
}

// Delete Popup Ad mutation
export function useDeletePopupAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete<any>(api.popupAds.delete(id).path, {
        showSuccessToast: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.popupAds.list.path] });
    },
  });
}
