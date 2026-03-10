import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { ListResponse } from "@/lib/interface";
import { CreateOrderRequest, GetOrdersParams, Order, UpdateOrderRequest } from "@/models/Order";
import { api } from "@/routes/orderRoute";

function buildOrdersUrl(basePath: string, params?: GetOrdersParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.tenantId) queryParams.append("tenantId", params.tenantId);

  const queryString = queryParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function useOrders(params?: GetOrdersParams) {
  const url = buildOrdersUrl(api.orders.list.path, params);

  return useQuery({
    queryKey: [api.orders.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<Order>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useOrder(id: string | null, tenantId?: string | null) {
  const basePath = api.orders.get(id || "").path;
  const url = tenantId ? `${basePath}?tenantId=${encodeURIComponent(tenantId)}` : basePath;

  return useQuery({
    queryKey: [api.orders.get(id || "").path, tenantId],
    queryFn: () =>
      apiService.get<Order>(url, {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      return apiService.post<Order>(api.orders.create.path, data, {
        successMessage: "Order created successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      currentTenantId,
    }: {
      id: string;
      data: UpdateOrderRequest;
      currentTenantId?: string;
    }) => {
      const url = currentTenantId
        ? `${api.orders.update(id).path}?tenantId=${encodeURIComponent(currentTenantId)}`
        : api.orders.update(id).path;

      return apiService.patch<Order>(url, data, {
        successMessage: "Order updated successfully",
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.get(variables.id).path] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId?: string }) => {
      const url = tenantId
        ? `${api.orders.delete(id).path}?tenantId=${encodeURIComponent(tenantId)}`
        : api.orders.delete(id).path;

      return apiService.delete<void>(url, {
        successMessage: "Order deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}