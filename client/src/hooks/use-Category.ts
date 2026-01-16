import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/apiService";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  GetCategoriesParams,
  GetCategoriesResponse,
} from "../models/Category";
import { useToast } from "./use-toast";

const CATEGORIES_QUERY_KEY = "categories";

export function useCategories(params?: GetCategoriesParams) {
  return useQuery<GetCategoriesResponse>({
    queryKey: [CATEGORIES_QUERY_KEY, params],
    queryFn: () => apiService.getCategories(params),
  });
}

export function useCategory(id: string) {
  return useQuery<Category>({
    queryKey: [CATEGORIES_QUERY_KEY, id],
    queryFn: () => apiService.getCategory(id),
    enabled: !!id,
  });
}

export function useCheckCategorySlug() {
  return useMutation<{ exists: boolean; category: Category | null }, Error, string>({
    mutationFn: (slug: string) => apiService.checkCategorySlug(slug),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Category, Error, CreateCategoryRequest>({
    mutationFn: (data: CreateCategoryRequest) => apiService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Category,
    Error,
    { id: string; data: UpdateCategoryRequest }
  >({
    mutationFn: ({ id, data }) => apiService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => apiService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });
}
