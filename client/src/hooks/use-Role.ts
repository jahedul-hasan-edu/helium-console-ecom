import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import type { CreateRoleRequest, Role, UpdateRoleRequest } from "@/models/Role";
import { api } from "@/routes/roleRoute";

export function useRoles(tenantId?: string | null, enabled: boolean = true) {
  const url = tenantId ? `${api.roles.list.path}?tenantId=${tenantId}` : api.roles.list.path;
  return useQuery({
    queryKey: [api.roles.list.path, tenantId],
    queryFn: () => apiService.get<Role[]>(url, { showSuccessToast: false }),
    enabled,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoleRequest) =>
      apiService.post<Role>(api.roles.create.path, payload, { successMessage: "Role created successfully" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.roles.list.path] }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateRoleRequest) =>
      apiService.patch<Role>(api.roles.update.path(id), payload, { successMessage: "Role updated successfully" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.roles.list.path] }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.delete<void>(api.roles.delete.path(id), { successMessage: "Role deleted successfully" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.roles.list.path] }),
  });
}