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
 * Hook to create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      return apiService.post<Product>(api.products.create.path, data, {
        successMessage: "Product created successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}

/**
 * Hook to update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest }) => {
      return apiService.patch<Product>(api.products.update.path(id), data, {
        successMessage: "Product updated successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
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
