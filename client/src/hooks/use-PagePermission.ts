import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import type { RolePagePermissions, UpdatePagePermissionsRequest } from "@/models/PagePermission";
import { api } from "@/routes/pagePermissionRoute";

export function usePagePermissions(roleId?: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["page-permissions", roleId],
    queryFn: () => apiService.get<RolePagePermissions>(api.pagePermissions.get.path(roleId!), { showSuccessToast: false }),
    enabled: enabled && !!roleId,
  });
}

export function useUpdatePagePermissions(roleId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePagePermissionsRequest) =>
      apiService.put<RolePagePermissions>(api.pagePermissions.update.path(roleId!), payload, {
        successMessage: "Page permissions updated successfully",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-permissions", roleId] });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
    },
  });
}