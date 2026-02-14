import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { CreateFaqRequest, UpdateFaqRequest, Faq } from "@/models/Faq";
import { buildUrl } from "@/lib/buildUrl";
import { api } from "@/routes/faqRoute";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse, QueryParams } from "@/lib/interface";

// FAQS - Get list with pagination, sorting, and search
export function useFaqs(params?: QueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if ((params as any)?.tenantId) queryParams.append("tenantId", (params as any).tenantId);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.faqs.list.path}?${queryString}` : api.faqs.list.path;

  return useQuery({
    queryKey: [api.faqs.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<Faq>>(url, {
        showSuccessToast: false,
      }),
  });
}

// FAQ - Get single FAQ by ID
export function useGetFaq(id: string | null) {
  return useQuery({
    queryKey: [api.faqs.get(id || "").path],
    queryFn: () =>
      apiService.get<Faq>(api.faqs.get(id!).path, {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

// CREATE FAQ - Mutation to create a new FAQ
export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFaqRequest) => {
      return apiService.post<Faq>(api.faqs.create.path, data, {
        successMessage: "FAQ created successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.faqs.list.path] }),
  });
}

// UPDATE FAQ - Mutation to update a FAQ
export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateFaqRequest) => {
      return apiService.patch<Faq>(api.faqs.update(id).path, data, {
        successMessage: "FAQ updated successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.faqs.list.path] }),
  });
}

// DELETE FAQ - Mutation to delete a FAQ
export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.delete(api.faqs.delete(id).path, {
        successMessage: "FAQ deleted successfully",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.faqs.list.path] }),
  });
}
