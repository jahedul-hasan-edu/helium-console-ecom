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
}

class ApiService {
  private baseUrl = "";

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
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      headers: this.getHeaders(options.headers),
      credentials: "include",
    });

    return this.handleResponse<T>(response, options);
  }

  async post<T = any>(
    url: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: this.getHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    return this.handleResponse<T>(response, options);
  }

  async put<T = any>(
    url: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      headers: this.getHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    return this.handleResponse<T>(response, options);
  }

  async patch<T = any>(
    url: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PATCH",
      headers: this.getHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    return this.handleResponse<T>(response, options);
  }

  async delete<T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "DELETE",
      headers: this.getHeaders(options.headers),
      credentials: "include",
    });

    return this.handleResponse<T>(response, options);
  }

  setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  clearAuthToken(): void {
    localStorage.removeItem("authToken");
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
}

export const apiService = new ApiService();
