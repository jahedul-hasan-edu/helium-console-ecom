import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/apiService";
import type {
  SubSubCategory,
  CreateSubSubCategoryRequest,
  UpdateSubSubCategoryRequest,
  GetSubSubCategoriesParams,
  GetSubSubCategoriesResponse,
} from "../models/SubSubCategory";
import { api } from "../routes/subSubCategoryRoute";
import { ListResponse } from "@/lib/interface";

export function useSubSubCategories(params?: GetSubSubCategoriesParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.subSubCategories.list.path}?${queryString}` : api.subSubCategories.list.path;

  return useQuery({
    queryKey: [api.subSubCategories.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<SubSubCategory>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useSubSubCategory(id: string) {
  return useQuery({
    queryKey: [api.subSubCategories.get.path(id || "")],
    queryFn: () =>
      apiService.get<SubSubCategory>(api.subSubCategories.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useCheckSubSubCategorySlug() {
  return useMutation<{ exists: boolean; subSubCategory: SubSubCategory | null }, Error, string>({
    mutationFn: (slug: string) =>
      apiService.get<{ exists: boolean; subSubCategory: SubSubCategory | null }>(
        api.subSubCategories.checkSlug.path(slug),
        {
          showSuccessToast: false,
          showErrorToast: false,
        }
      ),
  });
}

export function useCreateSubSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<SubSubCategory, Error, CreateSubSubCategoryRequest>({
    mutationFn: async (data: CreateSubSubCategoryRequest) => {
      return apiService.post<SubSubCategory>(api.subSubCategories.create.path, data, {
        successMessage: "Sub-sub-category created successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subSubCategories.list.path] });
    },
  });
}

export function useUpdateSubSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    SubSubCategory,
    Error,
    { id: string; data: UpdateSubSubCategoryRequest }
  >({
    mutationFn: async ({ id, data }) => {
      return apiService.patch<SubSubCategory>(api.subSubCategories.update.path(id), data, {
        successMessage: "Sub-sub-category updated successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subSubCategories.list.path] });
    },
  });
}

export function useDeleteSubSubCategory() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.subSubCategories.delete.path(id), {
        successMessage: "Sub-sub-category deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subSubCategories.list.path] });
    },
  });
}
