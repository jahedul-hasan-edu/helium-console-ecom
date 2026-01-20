import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, CreateProductRequest, UpdateProductRequest, GetProductsParams, GetProductsResponse } from "@/models/Product";
import { apiService } from "@/lib/apiService";
import { ListResponse } from "@/lib/interface";
import { api } from "@/routes/productRoute";

// Query key factory
const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: GetProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated products list
 */
export function useProducts(params: GetProductsParams = {}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.products.list.path}?${queryString}` : api.products.list.path;

  return useQuery({
      queryKey: [api.products.list.path, params],
      queryFn: () =>
        apiService.get<ListResponse<Product>>(url, {
          showSuccessToast: false,
        }),
    });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [api.products.get.path(id || "")],
    queryFn: () =>
      apiService.get<Product>(api.products.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

/**
 * Hook to create a new product with images
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const formData = new FormData();
      
      // Add form fields
      formData.append("subCategoryId", data.subCategoryId);
      formData.append("subSubCategoryId", data.subSubCategoryId);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("stock", data.stock.toString());
      formData.append("isActive", data.isActive.toString());
      
      // Add images if provided
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append("images", file);
        });
      }
      
      return apiService.postFormData<Product>(api.products.create.path, formData, {
        successMessage: "Product created successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}

/**
 * Hook to update an existing product with images
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest }) => {
      const formData = new FormData();
      
      // Add optional form fields
      if (data.subCategoryId) formData.append("subCategoryId", data.subCategoryId);
      if (data.subSubCategoryId) formData.append("subSubCategoryId", data.subSubCategoryId);
      if (data.name) formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.price) formData.append("price", data.price);
      if (data.stock !== undefined) formData.append("stock", data.stock.toString());
      if (data.isActive !== undefined) formData.append("isActive", data.isActive.toString());
      
      // Add images if provided
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append("images", file);
        });
      }
      
      // Add images to delete if provided
      if (data.imagesToDelete && data.imagesToDelete.length > 0) {
        data.imagesToDelete.forEach((id) => {
          formData.append("imagesToDelete", id);
        });
      }
      
      return apiService.patchFormData<Product>(api.products.update.path(id), formData, {
        successMessage: "Product updated successfully",
      });
    },
    onSuccess: (_data, { id }) => {
      // Invalidate both the product list and the specific product detail query
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.get.path(id)] });
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.products.delete.path(id), {
        successMessage: "Product deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}
