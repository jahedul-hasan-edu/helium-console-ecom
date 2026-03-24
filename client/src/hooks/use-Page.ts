import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import type { AdminPage, CreatePageRequest, UpdatePageRequest } from "@/models/Page";
import { api } from "@/routes/pageRoute";

export function usePages() {
  return useQuery({
    queryKey: [api.pages.list.path],
    queryFn: () => apiService.get<AdminPage[]>(api.pages.list.path, { showSuccessToast: false }),
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePageRequest) =>
      apiService.post<AdminPage>(api.pages.create.path, payload, { successMessage: "Page created successfully" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pages.list.path] }),
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdatePageRequest) =>
      apiService.patch<AdminPage>(api.pages.update.path(id), payload, { successMessage: "Page updated successfully" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pages.list.path] }),
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.delete<void>(api.pages.delete.path(id), { successMessage: "Page deleted successfully" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pages.list.path] }),
  });
}