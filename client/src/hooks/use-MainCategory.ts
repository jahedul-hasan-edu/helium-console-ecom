import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { CreateMainCategoryRequest, UpdateMainCategoryRequest, MainCategory } from "@/models/MainCategory";
import { buildUrl } from "@/lib/buildUrl";
import { api } from "@/routes/mainCategoryRoute";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse, QueryParams } from "@/lib/interface";

// MAIN CATEGORIES
export function useMainCategories(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.mainCategories.list.path}?${queryString}` : api.mainCategories.list.path;

  return useQuery({
    queryKey: [api.mainCategories.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<MainCategory>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useGetMainCategory(id: string | null) {
  return useQuery({
    queryKey: [api.mainCategories.get.path(id || "")],
    queryFn: () =>
      apiService.get<MainCategory>(api.mainCategories.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useUpdateMainCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateMainCategoryRequest) => {
      return apiService.patch<MainCategory>(api.mainCategories.update.path(id), data, {
        successMessage: "Main category updated successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.mainCategories.list.path] }),
  });
}

export function useCreateMainCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMainCategoryRequest) => {
      return apiService.post<MainCategory>(api.mainCategories.create.path, data, {
        successMessage: "Main category created successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.mainCategories.list.path] }),
  });
}

export function useDeleteMainCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.mainCategories.delete.path(id), {
        successMessage: "Main category deleted successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.mainCategories.list.path] }),
  });
}

export function useCheckSlug(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [api.mainCategories.checkSlug.path(slug), slug],
    queryFn: () =>
      apiService.get<{ exists: boolean; mainCategory: MainCategory | null }>(
        api.mainCategories.checkSlug.path(slug),
        { showSuccessToast: false }
      ),
    enabled: enabled && !!slug,
  });
}
