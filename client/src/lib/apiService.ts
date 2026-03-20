import { toast } from "@/hooks/use-toast";

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: Record<string, any>;
}

interface ApiRequestOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  headers?: Record<string, string>;
  _isRetry?: boolean;
}

class ApiService {
  private baseUrl = "";

  private getStoredAuthUser(): { roleName?: string } | null {
    const rawValue = localStorage.getItem("authUser");
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as { roleName?: string };
    } catch {
      return null;
    }
  }

  private appendTenantScope(url: string, body?: any, isFormData: boolean = false): { url: string; body?: any } {
    if (!url.startsWith("/api/admin")) {
      return { url, body };
    }

    const authUser = this.getStoredAuthUser();
    const selectedTenantId = localStorage.getItem("selectedTenantId");
    if (authUser?.roleName !== "super_admin" || !selectedTenantId) {
      return { url, body };
    }

    const parsedUrl = new URL(url, window.location.origin);
    if (!parsedUrl.searchParams.has("tenantId")) {
      parsedUrl.searchParams.set("tenantId", selectedTenantId);
    }

    if (!body) {
      return { url: `${parsedUrl.pathname}${parsedUrl.search}`, body };
    }

    if (isFormData) {
      if (!body.has("tenantId")) {
        body.append("tenantId", selectedTenantId);
      }
      return { url: `${parsedUrl.pathname}${parsedUrl.search}`, body };
    }

    if (typeof body === "object" && !Array.isArray(body) && !("tenantId" in body)) {
      return {
        url: `${parsedUrl.pathname}${parsedUrl.search}`,
        body: {
          ...body,
          tenantId: selectedTenantId,
        },
      };
    }

    return { url: `${parsedUrl.pathname}${parsedUrl.search}`, body };
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Add bearer token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const payload: ApiResponseData<{ accessToken: string; refreshToken: string }> = await response.json();
      if (!payload.data?.accessToken || !payload.data?.refreshToken) {
        return false;
      }

      this.setTokens(payload.data.accessToken, payload.data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  private dispatchForcedLogout(): void {
    this.clearTokens();
    window.dispatchEvent(new Event("auth:logout"));
  }

  private async request<T = any>(
    method: string,
    url: string,
    body: any,
    options: ApiRequestOptions = {},
    isFormData: boolean = false,
  ): Promise<T> {
    const scopedRequest = this.appendTenantScope(url, body, isFormData);
    const headers = isFormData
      ? {
          ...(localStorage.getItem("authToken")
            ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            : {}),
          ...(options.headers || {}),
        }
      : this.getHeaders(options.headers);

    const response = await fetch(`${this.baseUrl}${scopedRequest.url}`, {
      method,
      headers,
      body: scopedRequest.body
        ? isFormData
          ? scopedRequest.body
          : JSON.stringify(scopedRequest.body)
        : undefined,
      credentials: "include",
    });

    if (response.status === 401 && !options._isRetry && !url.startsWith("/api/auth/")) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.request<T>(method, url, body, { ...options, _isRetry: true }, isFormData);
      }
      this.dispatchForcedLogout();
    }

    if (response.status === 403) {
      const clone = response.clone();
      try {
        const payload = (await clone.json()) as ApiResponseData;
        if (payload.message?.includes("Subscription expired")) {
          toast({
            title: "Session expired",
            description: "Your tenant subscription has expired.",
            variant: "destructive",
          });
          this.dispatchForcedLogout();
        }
      } catch {
        // Ignore body parsing failure here.
      }
    }

    return this.handleResponse<T>(response, options);
  }

  private async handleResponse<T>(
    response: Response,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      showSuccessToast = true,
      showErrorToast = true,
      successMessage,
      errorMessage,
    } = options;

    const data: ApiResponseData<T> = await response.json();

    if (!response.ok) {
      if (showErrorToast) {
        toast({
          title: "Error",
          description:
            errorMessage ||
            data.message ||
            data.errors?.[0] ||
            "Something went wrong",
          variant: "destructive",
        });
      }
      throw new Error(data.message || "API request failed");
    }

    if (showSuccessToast && successMessage) {
      toast({
        title: "Success",
        description: successMessage || data.message,
      });
    }

    return data.data as T;
  }

  async get<T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T = any>(
    url: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>("POST", url, body, options);
  }

  async put<T = any>(
    url: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>("PUT", url, body, options);
  }

  async patch<T = any>(
    url: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>("PATCH", url, body, options);
  }

  async delete<T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>("DELETE", url, undefined, options);
  }

  async postFormData<T = any>(
    url: string,
    formData: FormData,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>("POST", url, formData, options, true);
  }

  async patchFormData<T = any>(
    url: string,
    formData: FormData,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>("PATCH", url, formData, options, true);
  }

  setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  clearAuthToken(): void {
    localStorage.removeItem("authToken");
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  }

  getAccessToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // Category API methods
  async getCategories(params?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/admin/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get(url, { showSuccessToast: false, showErrorToast: true });
  }

  async getCategory(id: string): Promise<any> {
    return this.get(`/api/admin/categories/${id}`, { showSuccessToast: false, showErrorToast: true });
  }

  async createCategory(data: any): Promise<any> {
    return this.post(`/api/admin/categories`, data, { showSuccessToast: false, showErrorToast: true });
  }

  async updateCategory(id: string, data: any): Promise<any> {
    return this.patch(`/api/admin/categories/${id}`, data, { showSuccessToast: false, showErrorToast: true });
  }

  async deleteCategory(id: string): Promise<any> {
    return this.delete(`/api/admin/categories/${id}`, { showSuccessToast: false, showErrorToast: true });
  }

  async checkCategorySlug(slug: string): Promise<any> {
    return this.get(`/api/admin/categories/check-slug?slug=${encodeURIComponent(slug)}`, { showSuccessToast: false, showErrorToast: false });
  }

  // SubCategory API methods
  async getSubCategories(params?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/admin/sub-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get(url, { showSuccessToast: false, showErrorToast: true });
  }

  async getSubCategory(id: string): Promise<any> {
    return this.get(`/api/admin/sub-categories/${id}`, { showSuccessToast: false, showErrorToast: true });
  }

  async createSubCategory(data: any): Promise<any> {
    return this.post(`/api/admin/sub-categories`, data, { showSuccessToast: false, showErrorToast: true });
  }

  async updateSubCategory(id: string, data: any): Promise<any> {
    return this.patch(`/api/admin/sub-categories/${id}`, data, { showSuccessToast: false, showErrorToast: true });
  }

  async deleteSubCategory(id: string): Promise<any> {
    return this.delete(`/api/admin/sub-categories/${id}`, { showSuccessToast: false, showErrorToast: true });
  }

  async checkSubCategorySlug(slug: string): Promise<any> {
    return this.get(`/api/admin/sub-categories/check-slug?slug=${encodeURIComponent(slug)}`, { showSuccessToast: false, showErrorToast: false });
  }

  // SubSubCategory API methods
  async getSubSubCategories(params?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/admin/sub-sub-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get(url, { showSuccessToast: false, showErrorToast: true });
  }

  async getSubSubCategory(id: string): Promise<any> {
    return this.get(`/api/admin/sub-sub-categories/${id}`, { showSuccessToast: false, showErrorToast: true });
  }

  async createSubSubCategory(data: any): Promise<any> {
    return this.post(`/api/admin/sub-sub-categories`, data, { showSuccessToast: false, showErrorToast: true });
  }

  async updateSubSubCategory(id: string, data: any): Promise<any> {
    return this.patch(`/api/admin/sub-sub-categories/${id}`, data, { showSuccessToast: false, showErrorToast: true });
  }

  async deleteSubSubCategory(id: string): Promise<any> {
    return this.delete(`/api/admin/sub-sub-categories/${id}`, { showSuccessToast: false, showErrorToast: true });
  }

  async checkSubSubCategorySlug(slug: string): Promise<any> {
    return this.get(`/api/admin/sub-sub-categories/check-slug?slug=${encodeURIComponent(slug)}`, { showSuccessToast: false, showErrorToast: false });
  }

}

export const apiService = new ApiService();

// Named exports for convenient imports
export const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  checkCategorySlug,
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  checkSubCategorySlug,
  getSubSubCategories,
  getSubSubCategory,
  createSubSubCategory,
  updateSubSubCategory,
  deleteSubSubCategory,
  checkSubSubCategorySlug,
} = apiService;
