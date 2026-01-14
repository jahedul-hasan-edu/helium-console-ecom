import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: Record<string, any>;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200,
    meta?: Record<string, any>,
    headers?: Record<string, string>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
    };

    if (data !== undefined && data !== null) {
      response.data = this.serializeData(data);
    }

    if (meta) {
      response.meta = meta;
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: string[],
    meta?: Record<string, any>,
    headers?: Record<string, string>
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    if (meta) {
      response.meta = meta;
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    items: T[],
    total: number,
    page: number = 1,
    pageSize: number = 10,
    message: string = "Data retrieved successfully",
    statusCode: number = 200,
    headers?: Record<string, string>
  ): Response {
    const totalPages = Math.ceil(total / pageSize);

    const data: PaginatedData<T> = {
      items: items.map((item) => this.serializeData(item)),
      total,
      page,
      pageSize,
      totalPages,
    };

    const meta = {
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };

    return this.success(res, message, data, statusCode, meta, headers);
  }

  static list<T>(
    res: Response,
    items: T[],
    message: string = "Data retrieved successfully",
    statusCode: number = 200,
    meta?: Record<string, any>,
    headers?: Record<string, string>
  ): Response {
    const data = items.map((item) => this.serializeData(item));
    return this.success(res, message, data, statusCode, meta, headers);
  }

  private static serializeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle Drizzle ORM objects or similar
    if (typeof data.toJSON === "function") {
      return data.toJSON();
    }

    // Handle plain objects and arrays
    if (typeof data === "object") {
      if (Array.isArray(data)) {
        return data.map((item) => this.serializeData(item));
      }

      const serialized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          serialized[key] = this.serializeData(value);
        }
      }
      return serialized;
    }

    return data;
  }
}