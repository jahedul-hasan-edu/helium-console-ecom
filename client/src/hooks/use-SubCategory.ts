import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/apiService";
import type {
  SubCategory,
  CreateSubCategoryRequest,
  UpdateSubCategoryRequest,
  GetSubCategoriesParams,
  GetSubCategoriesResponse,
} from "../models/SubCategory";
import { useToast } from "./use-toast";

const SUB_CATEGORIES_QUERY_KEY = "subCategories";

export function useSubCategories(params?: GetSubCategoriesParams) {
  return useQuery<GetSubCategoriesResponse>({
    queryKey: [SUB_CATEGORIES_QUERY_KEY, params],
    queryFn: () => apiService.getSubCategories(params),
  });
}

export function useSubCategory(id: string) {
  return useQuery<SubCategory>({
    queryKey: [SUB_CATEGORIES_QUERY_KEY, id],
    queryFn: () => apiService.getSubCategory(id),
    enabled: !!id,
  });
}

export function useCheckSubCategorySlug() {
  return useMutation<{ exists: boolean; subCategory: SubCategory | null }, Error, string>({
    mutationFn: (slug: string) => apiService.checkSubCategorySlug(slug),
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SubCategory, Error, CreateSubCategoryRequest>({
    mutationFn: (data: CreateSubCategoryRequest) => apiService.createSubCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUB_CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Sub-category created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sub-category",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    SubCategory,
    Error,
    { id: string; data: UpdateSubCategoryRequest }
  >({
    mutationFn: ({ id, data }) => apiService.updateSubCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUB_CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Sub-category updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sub-category",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => apiService.deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUB_CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Sub-category deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sub-category",
        variant: "destructive",
      });
    },
  });
}
