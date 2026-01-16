import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/apiService";
import type {
  SubSubCategory,
  CreateSubSubCategoryRequest,
  UpdateSubSubCategoryRequest,
  GetSubSubCategoriesParams,
  GetSubSubCategoriesResponse,
} from "../models/SubSubCategory";
import { useToast } from "./use-toast";

const SUB_SUB_CATEGORIES_QUERY_KEY = "subSubCategories";

export function useSubSubCategories(params?: GetSubSubCategoriesParams) {
  return useQuery<GetSubSubCategoriesResponse>({
    queryKey: [SUB_SUB_CATEGORIES_QUERY_KEY, params],
    queryFn: () => apiService.getSubSubCategories(params),
  });
}

export function useSubSubCategory(id: string) {
  return useQuery<SubSubCategory>({
    queryKey: [SUB_SUB_CATEGORIES_QUERY_KEY, id],
    queryFn: () => apiService.getSubSubCategory(id),
    enabled: !!id,
  });
}

export function useCheckSubSubCategorySlug() {
  return useMutation<{ exists: boolean; subSubCategory: SubSubCategory | null }, Error, string>({
    mutationFn: (slug: string) => apiService.checkSubSubCategorySlug(slug),
  });
}

export function useCreateSubSubCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SubSubCategory, Error, CreateSubSubCategoryRequest>({
    mutationFn: (data: CreateSubSubCategoryRequest) => apiService.createSubSubCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUB_SUB_CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Sub-sub-category created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sub-sub-category",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSubSubCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    SubSubCategory,
    Error,
    { id: string; data: UpdateSubSubCategoryRequest }
  >({
    mutationFn: ({ id, data }) => apiService.updateSubSubCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUB_SUB_CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Sub-sub-category updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sub-sub-category",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSubSubCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => apiService.deleteSubSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUB_SUB_CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Sub-sub-category deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sub-sub-category",
        variant: "destructive",
      });
    },
  });
}
