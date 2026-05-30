import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import type { ListResponse } from "@/lib/interface";
import type { AdminPage, CreatePageRequest, GetPagesParams, UpdatePageRequest } from "@/models/Page";
import { api } from "@/routes/pageRoute";

function buildPagesUrl(basePath: string, params?: GetPagesParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function normalizePagePayload<T extends CreatePageRequest | UpdatePageRequest>(payload: T): T {
  const normalizedIcon = payload.icon?.trim();

  return {
    ...payload,
    icon: normalizedIcon ? normalizedIcon : null,
  };
}

export function usePages(params?: GetPagesParams) {
  const url = buildPagesUrl(api.pages.list.path, params);

  return useQuery({
    queryKey: [api.pages.list.path, params],
    queryFn: () => apiService.get<ListResponse<AdminPage>>(url, { showSuccessToast: false }),
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePageRequest) =>
      apiService.post<AdminPage>(api.pages.create.path, normalizePagePayload(payload), { successMessage: "Page created successfully" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pages.list.path] }),
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdatePageRequest) =>
      apiService.patch<AdminPage>(api.pages.update.path(id), normalizePagePayload(payload), { successMessage: "Page updated successfully" }),
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