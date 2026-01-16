import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/apiService";
import type {
  SubCategory,
  CreateSubCategoryRequest,
  UpdateSubCategoryRequest,
  GetSubCategoriesParams,
  GetSubCategoriesResponse,
} from "../models/SubCategory";
import { api } from "../routes/subCategoryRoute";
import { ListResponse } from "@/lib/interface";

export function useSubCategories(params?: GetSubCategoriesParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.subCategories.list.path}?${queryString}` : api.subCategories.list.path;

  return useQuery({
    queryKey: [api.subCategories.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<SubCategory>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useSubCategory(id: string) {
  return useQuery({
    queryKey: [api.subCategories.get.path(id || "")],
    queryFn: () =>
      apiService.get<SubCategory>(api.subCategories.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useCheckSubCategorySlug() {
  return useMutation<{ exists: boolean; subCategory: SubCategory | null }, Error, string>({
    mutationFn: (slug: string) =>
      apiService.get<{ exists: boolean; subCategory: SubCategory | null }>(
        api.subCategories.checkSlug.path(slug),
        {
          showSuccessToast: false,
          showErrorToast: false,
        }
      ),
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<SubCategory, Error, CreateSubCategoryRequest>({
    mutationFn: async (data: CreateSubCategoryRequest) => {
      return apiService.post<SubCategory>(api.subCategories.create.path, data, {
        successMessage: "Sub-category created successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subCategories.list.path] });
    },
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    SubCategory,
    Error,
    { id: string; data: UpdateSubCategoryRequest }
  >({
    mutationFn: async ({ id, data }) => {
      return apiService.patch<SubCategory>(api.subCategories.update.path(id), data, {
        successMessage: "Sub-category updated successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subCategories.list.path] });
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.subCategories.delete.path(id), {
        successMessage: "Sub-category deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subCategories.list.path] });
    },
  });
}
