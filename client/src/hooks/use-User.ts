import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { CreateUserRequest, UpdateUserRequest, User } from "@/models/User";
import { buildUrl } from "@/lib/buildUrl";
import { api } from "@/routes/userRoute";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse, QueryParams } from "@/lib/interface";

// USERS
export function useUsers(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.users.list.path}?${queryString}` : api.users.list.path;

  return useQuery({
    queryKey: [api.users.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<User>>(url, {
        showSuccessToast: false,
      }),
  });
}

export function useGetUser(id: string | null) {
  return useQuery({
    queryKey: [api.users.get.path(id || "")],
    queryFn: () =>
      apiService.get<User>(api.users.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateUserRequest) => {
      return apiService.patch<User>(api.users.update.path(id), data, {
        successMessage: "User updated successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      return apiService.post<User>(api.users.create.path, data, {
        successMessage: "User created successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete<void>(api.users.delete.path(id), {
        successMessage: "User deleted successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] }),
  });
}

export function useCheckEmail(email: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["checkEmail", email],
    queryFn: async () => {
      if (!email) return null;
      try {
        const result = await apiService.get<{ exists: boolean; user?: any }>(
          api.users.checkEmail.path(email),
          {
            showSuccessToast: false,
            showErrorToast: false,
          }
        );
        return result.exists ? result : null;
      } catch (error) {
        return null;
      }
    },
    enabled: enabled && !!email && email.includes("@"),
  });
}
