import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/apiService";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  GetCategoriesParams,
  GetCategoriesResponse,
} from "../models/Category";
import { api } from "../routes/categoryRoute";
import { ListResponse } from "@/lib/interface";

export function useCategories(params?: GetCategoriesParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.categories.list.path}?${queryString}` : api.categories.list.path;

  return useQuery({
    queryKey: [api.categories.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<Category>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [api.categories.get.path(id || "")],
    queryFn: () =>
      apiService.get<Category>(api.categories.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

// export function useCheckCategorySlug() {
//   return useQuery({
//     queryKey: ["checkCategorySlug"],
//     queryFn: async () => null,
//     enabled: false,
//   });
// }

export function useCheckCategorySlug() {
  return useMutation<{ exists: boolean; category: Category | null }, Error, string>({
    mutationFn: (slug: string) =>
      apiService.get<{ exists: boolean; category: Category | null }>(
        api.categories.checkSlug.path(slug),
        {
          showSuccessToast: false,
          showErrorToast: false,
        }
      ),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryRequest>({
    mutationFn: async (data: CreateCategoryRequest) => {
      return apiService.post<Category>(api.categories.create.path, data, {
        successMessage: "Category created successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    Category,
    Error,
    { id: string; data: UpdateCategoryRequest }
  >({
    mutationFn: async ({ id, data }) => {
      return apiService.patch<Category>(api.categories.update.path(id), data, {
        successMessage: "Category updated successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.categories.delete.path(id), {
        successMessage: "Category deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
    },
  });
}
