# Full-Stack Application Architecture Guide

This comprehensive guide outlines the complete architecture pattern for building a scalable full-stack application using Node.js/Express on the backend and React with TanStack Query on the frontend. This pattern ensures consistency, maintainability, and can be reused across multiple projects.

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Server-Side Architecture](#server-side-architecture)
5. [Client-Side Architecture](#client-side-architecture)
6. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
7. [Best Practices](#best-practices)

---

## Overview

This architecture follows a layered approach with clear separation of concerns:

- **Server-Side**: Express.js with Repository Pattern, Service Layer, and Controllers
- **Client-Side**: React with TanStack Query for data fetching and state management
- **Database**: PostgreSQL with Drizzle ORM
- **Type Safety**: TypeScript throughout with Zod for runtime validation

### Key Principles

1. **Single Responsibility**: Each layer has a specific purpose
2. **Type Safety**: Full TypeScript coverage with runtime validation
3. **Consistency**: Standardized patterns across all features
4. **Reusability**: Components and patterns can be reused across projects
5. **Scalability**: Easy to add new features following the established pattern

---

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM
- **Validation**: Zod
- **Language**: TypeScript

### Frontend
- **Framework**: React
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Language**: TypeScript

---

## Project Structure

### Root Directory Structure

```
project-root/
├── client/                    # Frontend application
├── server/                    # Backend application
├── script/                    # Build and utility scripts
├── prompts/                   # Documentation and prompts
├── package.json              # Root package configuration
├── tsconfig.json             # TypeScript configuration
├── drizzle.config.ts         # Drizzle ORM configuration
└── vite.config.ts            # Vite configuration
```

### Server-Side Structure

```
server/
├── index.ts                  # Application entry point
├── routes.ts                 # Route registration
├── db.ts                     # Database connection
├── api/
│   ├── controllers/          # Request handlers
│   │   ├── categories.ts
│   │   ├── products.ts
│   │   └── ...
│   └── routes/               # Route definitions with schemas
│       ├── categoryRoute.ts
│       ├── productRoute.ts
│       └── ...
├── db/
│   ├── db.ts                # Database instance
│   └── schemas/             # Drizzle table schemas
│       ├── categories.ts
│       ├── products.ts
│       └── ...
├── service/
│   ├── category_service.ts   # Business logic
│   ├── product_service.ts
│   └── repos/               # Data access layer
│       ├── category_repo.ts
│       ├── product_repo.ts
│       └── ...
└── shared/
    ├── constants/           # Application constants
    │   ├── httpStatus.ts
    │   ├── pagination.ts
    │   └── feature/        # Feature-specific constants
    │       ├── categoryMessages.ts
    │       └── ...
    ├── dtos/               # Data Transfer Objects
    │   ├── Category.ts
    │   ├── Product.ts
    │   └── ...
    └── utils/              # Utility functions
        ├── ResponseHandler.ts
        ├── asyncHandler.ts
        ├── pagination.ts
        └── errorSchemas.ts
```

### Client-Side Structure

```
client/
├── index.html
├── public/                   # Static assets
└── src/
    ├── main.tsx             # Application entry point
    ├── App.tsx              # Root component with routing
    ├── components/          # Shared components
    │   ├── ActionButtons.tsx
    │   ├── DataTable.tsx
    │   ├── PaginatedDataTable.tsx
    │   ├── Layout.tsx
    │   └── ui/             # Shadcn UI components
    │       ├── button.tsx
    │       ├── dialog.tsx
    │       ├── table.tsx
    │       └── ...
    ├── hooks/              # Custom React hooks
    │   ├── use-Category.ts
    │   ├── use-Product.ts
    │   ├── use-toast.ts
    │   └── ...
    ├── lib/                # Utility libraries
    │   ├── apiService.ts   # API client wrapper
    │   ├── queryClient.ts  # TanStack Query configuration
    │   ├── constants.ts    # Frontend constants
    │   ├── interface.ts    # Shared interfaces
    │   └── utils.ts        # Utility functions
    ├── models/             # TypeScript interfaces
    │   ├── Category.ts
    │   ├── Product.ts
    │   └── ...
    ├── pages/              # Page components (organized by feature)
    │   ├── Dashboard.tsx
    │   ├── category/
    │   │   ├── index.ts
    │   │   ├── Categories.tsx
    │   │   ├── CreateCategoryModal.tsx
    │   │   ├── EditCategoryModal.tsx
    │   │   ├── DeleteCategoryModal.tsx
    │   │   └── formValidator.ts
    │   ├── product/
    │   └── ...
    └── routes/             # Route definitions (TypeScript)
        ├── categoryRoute.ts
        ├── productRoute.ts
        └── ...
```

---

## Server-Side Architecture

### Layer Overview

```
Controller → Service → Repository → Database
     ↓          ↓           ↓
  Routes     Business    Data Access
 Handler     Logic       Layer
```

### 1. Database Schemas (Drizzle ORM)

**Location**: `server/db/schemas/`

Define your database tables using Drizzle ORM.

**Example**: `server/db/schemas/categories.ts`

```typescript
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Table Definition
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  mainCategoryId: uuid("main_category_id"),
  name: text("name"),
  slug: text("slug"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// Zod Schema for validation
export const insertCategorySchema = createInsertSchema(categories);

// TypeScript Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
```

**Key Points**:
- Use Drizzle's table builders (`pgTable`, `mysqlTable`, etc.)
- Generate Zod schemas using `createInsertSchema`
- Export TypeScript types using `$inferSelect` and `$inferInsert`

---

### 2. Data Transfer Objects (DTOs)

**Location**: `server/shared/dtos/`

DTOs define the data structure for API requests and responses with validation.

**Example**: `server/shared/dtos/Category.ts`

```typescript
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { categories } from "../../db/schemas/categories";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";

// Base Schema
export const categorySchema = createInsertSchema(categories);

// Create DTO
export const createCategorySchema = z.object({
  mainCategoryId: z.string().uuid("Invalid main category ID"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
}).strict();

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;

// Update DTO
export const updateCategorySchema = z.object({
  mainCategoryId: z.string().uuid("Invalid main category ID").optional(),
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
}).strict();

export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;

// Response DTO
export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  mainCategoryId: z.string().uuid().nullable(),
  mainCategoryName: z.string().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type CategoryResponseDTO = z.infer<typeof categoryResponseSchema>;

// Pagination Options
export type GetCategoriesOptions = PaginationOptions<CategorySortField>;

// Paginated Response
export type GetCategoriesResponse = PaginationResponse<CategoryResponseDTO>;
```

**Key Points**:
- Separate DTOs for Create, Update, and Response
- Use Zod for validation with clear error messages
- Use `.strict()` to prevent unknown properties
- Export TypeScript types using `z.infer<>`

---

### 3. Repository Layer

**Location**: `server/service/repos/`

The repository handles all database operations and queries.

**Example**: `server/service/repos/category_repo.ts`

```typescript
import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { categories } from "server/db/schemas/categories";
import { mainCategories } from "server/db/schemas/mainCategories";
import { 
  CreateCategoryDTO, 
  GetCategoriesOptions, 
  GetCategoriesResponse, 
  UpdateCategoryDTO, 
  CategoryResponseDTO 
} from "server/shared/dtos/Category";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";

// Interface defining repository methods
export interface IStorageCategory {
  getCategories(tenantId: string, options?: GetCategoriesOptions): Promise<GetCategoriesResponse>;
  getCategory(id: string, tenantId: string): Promise<CategoryResponseDTO | undefined>;
  getCategoryBySlug(slug: string, tenantId: string): Promise<CategoryResponseDTO | undefined>;
  createCategory(category: CreateCategoryDTO & { tenantId: string; userIp: string }): Promise<CategoryResponseDTO>;
  updateCategory(id: string, tenantId: string, updates: UpdateCategoryDTO & { userIp: string }): Promise<CategoryResponseDTO>;
  deleteCategory(id: string, tenantId: string): Promise<void>;
}

// Repository implementation
export class StorageCategory implements IStorageCategory {
  
  // Helper method to build select query with joins
  private buildCategorySelectQuery() {
    return db.select({
      id: categories.id,
      tenantId: categories.tenantId,
      mainCategoryId: categories.mainCategoryId,
      mainCategoryName: mainCategories.name,
      name: categories.name,
      slug: categories.slug,
      createdBy: categories.createdBy,
      updatedBy: categories.updatedBy,
      createdOn: categories.createdOn,
      updatedOn: categories.updatedOn,
      userIp: categories.userIp,
    })
    .from(categories)
    .leftJoin(mainCategories, eq(categories.mainCategoryId, mainCategories.id));
  }

  // Get paginated list
  async getCategories(tenantId: string, options?: GetCategoriesOptions): Promise<GetCategoriesResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || 'createdOn';
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with tenant filter and search
    const baseQuery = search
      ? this.buildCategorySelectQuery().where(
          and(
            eq(categories.tenantId, tenantId),
            sql`${categories.name} ILIKE ${"%"+search+"%"} OR ${categories.slug} ILIKE ${"%"+search+"%"}`
          )
        )
      : this.buildCategorySelectQuery().where(eq(categories.tenantId, tenantId));

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = sortBy === 'name' ? categories.name : categories.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const items = await baseQuery.orderBy(sortFn(sortColumn)).limit(pageSize).offset(offset);

    return { items, total, page, pageSize };
  }

  // Get single item by ID
  async getCategory(id: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    const result = await this.buildCategorySelectQuery()
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .limit(1);
    
    return result[0];
  }

  // Get by slug (for uniqueness checks)
  async getCategoryBySlug(slug: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    const result = await this.buildCategorySelectQuery()
      .where(and(eq(categories.slug, slug), eq(categories.tenantId, tenantId)))
      .limit(1);
    
    return result[0];
  }

  // Create new item
  async createCategory(category: CreateCategoryDTO & { tenantId: string; userIp: string }): Promise<CategoryResponseDTO> {
    const [created] = await db.insert(categories)
      .values({
        ...category,
        createdOn: new Date(),
        updatedOn: new Date(),
      })
      .returning();

    return this.getCategory(created.id, category.tenantId) as Promise<CategoryResponseDTO>;
  }

  // Update existing item
  async updateCategory(id: string, tenantId: string, updates: UpdateCategoryDTO & { userIp: string }): Promise<CategoryResponseDTO> {
    await db.update(categories)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));

    return this.getCategory(id, tenantId) as Promise<CategoryResponseDTO>;
  }

  // Delete item
  async deleteCategory(id: string, tenantId: string): Promise<void> {
    await db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));
  }
}

// Export singleton instance
export const storageCategory = new StorageCategory();
```

**Key Points**:
- Define an interface for the repository
- Use helper methods for complex queries
- Implement pagination, sorting, and filtering
- Always filter by tenant ID for multi-tenancy
- Return typed DTOs from repository methods
- Export a singleton instance

---

### 4. Service Layer

**Location**: `server/service/`

The service layer contains business logic and acts as a bridge between controllers and repositories.

**Example**: `server/service/category_service.ts`

```typescript
import { storageCategory } from "./repos/category_repo";
import { 
  CreateCategoryDTO, 
  GetCategoriesOptions, 
  GetCategoriesResponse, 
  UpdateCategoryDTO, 
  CategoryResponseDTO 
} from "server/shared/dtos/Category";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";

const DEFAULT_TENANT_ID = "your-tenant-id"; // TODO: Replace with auth

export class CategoryService {
  
  // Get paginated list
  async getCategories(req: Request): Promise<GetCategoriesResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || 'createdOn';
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
    
    const options: GetCategoriesOptions = {
      page, pageSize, search, sortBy, sortOrder,
    };

    return await storageCategory.getCategories(tenantId, options);
  }

  // Get single item
  async getCategory(id: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    return await storageCategory.getCategory(id, tenantId);
  }

  // Check if slug exists
  async checkSlugExists(slug: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    return await storageCategory.getCategoryBySlug(slug, tenantId);
  }

  // Create new item
  async createCategory(req: Request): Promise<CategoryResponseDTO> {
    const categoryData: CreateCategoryDTO = req.body;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageCategory.createCategory({
      ...categoryData,
      tenantId,
      userIp,
    });
  }

  // Update existing item
  async updateCategory(id: string, updates: UpdateCategoryDTO, req: Request): Promise<CategoryResponseDTO> {
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageCategory.updateCategory(id, tenantId, {
      ...updates,
      userIp,
    });
  }

  // Delete item
  async deleteCategory(id: string, tenantId: string): Promise<void> {
    await storageCategory.deleteCategory(id, tenantId);
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
```

**Key Points**:
- Parse query parameters from request
- Extract tenant ID from authenticated user (or default)
- Add metadata like user IP, timestamps
- Call repository methods
- Handle business logic and validation

---

### 5. Route Definitions

**Location**: `server/api/routes/`

Define route schemas for type-safe API contracts.

**Example**: `server/api/routes/categoryRoute.ts`

```typescript
import { 
  createCategorySchema, 
  updateCategorySchema, 
  categoryResponseSchema 
} from 'server/shared/dtos/Category';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/categories',
      responses: {
        200: z.array(categoryResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/categories',
      input: createCategorySchema,
      responses: {
        201: categoryResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/categories/:id',
      responses: {
        200: categoryResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/categories/:id',
      input: updateCategorySchema,
      responses: {
        200: categoryResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/categories/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
```

**Key Points**:
- Define method, path, input schema, and response schemas
- Use as const for type literals
- Include all possible response status codes
- Can be shared between server and client for type safety

---

### 6. Controllers

**Location**: `server/api/controllers/`

Controllers handle HTTP requests and responses.

**Example**: `server/api/controllers/categories.ts`

```typescript
import type { Express } from "express";
import { categoryService } from "../../service/category_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/categoryRoute";
import { HTTP_STATUS, CATEGORY_MESSAGES } from "server/shared/constants";

const DEFAULT_TENANT_ID = "your-tenant-id";

export async function registerCategoryRoutes(app: Express): Promise<void> {
  
  // List all categories (paginated)
  app.get(
    api.categories.list.path,
    asyncHandler(async (req, res) => {
      const response = await categoryService.getCategories(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        CATEGORY_MESSAGES.CATEGORIES_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  // Create new category
  app.post(
    api.categories.create.path,
    asyncHandler(async (req, res) => {
      const category = await categoryService.createCategory(req);
      ResponseHandler.success(
        res, 
        CATEGORY_MESSAGES.CATEGORY_CREATED_SUCCESSFULLY, 
        category, 
        HTTP_STATUS.CREATED
      );
    })
  );

  // Get single category
  app.get(
    api.categories.get.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID;
      const category = await categoryService.getCategory(req.params.id, tenantId);
      
      if (!category) {
        return ResponseHandler.error(
          res, 
          CATEGORY_MESSAGES.CATEGORY_NOT_FOUND, 
          HTTP_STATUS.NOT_FOUND
        );
      }
      
      ResponseHandler.success(
        res, 
        CATEGORY_MESSAGES.CATEGORY_RETRIEVED_SUCCESSFULLY, 
        category, 
        HTTP_STATUS.OK
      );
    })
  );

  // Update category
  app.patch(
    api.categories.update.path,
    asyncHandler(async (req, res) => {
      const category = await categoryService.updateCategory(req.params.id, req.body, req);
      ResponseHandler.success(
        res, 
        CATEGORY_MESSAGES.CATEGORY_UPDATED_SUCCESSFULLY, 
        category, 
        HTTP_STATUS.OK
      );
    })
  );

  // Delete category
  app.delete(
    api.categories.delete.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID;
      await categoryService.deleteCategory(req.params.id, tenantId);
      ResponseHandler.success(
        res, 
        CATEGORY_MESSAGES.CATEGORY_DELETED_SUCCESSFULLY, 
        null, 
        HTTP_STATUS.OK
      );
    })
  );
}
```

**Key Points**:
- Use `asyncHandler` to catch async errors
- Call service layer methods
- Use `ResponseHandler` for consistent responses
- Handle error cases (404, validation errors)
- Extract path parameters and query strings

---

### 7. Response Handler

**Location**: `server/shared/utils/ResponseHandler.ts`

Standardizes all API responses.

**Example**: `server/shared/utils/ResponseHandler.ts`

```typescript
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
  
  // Success response
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

  // Error response
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: string[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  // Paginated response
  static paginated<T>(
    res: Response,
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = "Data retrieved successfully",
    statusCode: number = 200
  ): Response {
    const totalPages = Math.ceil(total / pageSize);

    const paginatedData: PaginatedData<T> = {
      items: this.serializeData(items),
      total,
      page,
      pageSize,
      totalPages,
    };

    return this.success(res, message, paginatedData, statusCode);
  }

  // Serialize dates to ISO strings
  private static serializeData<T>(data: T): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Date) {
      return data.toISOString() as any;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.serializeData(item)) as any;
    }

    if (typeof data === 'object') {
      const serialized: any = {};
      for (const [key, value] of Object.entries(data)) {
        serialized[key] = this.serializeData(value);
      }
      return serialized;
    }

    return data;
  }
}
```

**Key Points**:
- Standardized response format
- Support for success, error, and paginated responses
- Automatic date serialization
- Optional metadata and custom headers

---

### 8. Utility Functions

#### Async Handler

**Location**: `server/shared/utils/asyncHandler.ts`

```typescript
import { Request, Response, NextFunction } from "express";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

#### Constants

**Location**: `server/shared/constants/`

```typescript
// pagination.ts
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 10,
  SORT_ORDER: "desc" as const,
} as const;

// httpStatus.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// feature/categoryMessages.ts
export const CATEGORY_MESSAGES = {
  CATEGORIES_RETRIEVED_SUCCESSFULLY: "Categories retrieved successfully",
  CATEGORY_RETRIEVED_SUCCESSFULLY: "Category retrieved successfully",
  CATEGORY_CREATED_SUCCESSFULLY: "Category created successfully",
  CATEGORY_UPDATED_SUCCESSFULLY: "Category updated successfully",
  CATEGORY_DELETED_SUCCESSFULLY: "Category deleted successfully",
  CATEGORY_NOT_FOUND: "Category not found",
  SLUG_ALREADY_EXISTS: "Slug already exists",
} as const;

export const CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type CategorySortField = typeof CATEGORY_SORT_FIELDS[keyof typeof CATEGORY_SORT_FIELDS];
```

---

## Client-Side Architecture

### Layer Overview

```
Component → Custom Hook (TanStack Query) → API Service → Server API
     ↓            ↓                              ↓
   UI Logic   Data Fetching               HTTP Client
```

### 1. TypeScript Models

**Location**: `client/src/models/`

Define TypeScript interfaces for data structures.

**Example**: `client/src/models/Category.ts`

```typescript
export interface Category {
  id: string;
  tenantId: string | null;
  mainCategoryId: string | null;
  mainCategoryName: string | null;
  name: string | null;
  slug: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface CreateCategoryRequest {
  mainCategoryId: string;
  name: string;
  slug: string;
}

export interface UpdateCategoryRequest {
  mainCategoryId?: string;
  name?: string;
  slug?: string;
}

export interface GetCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetCategoriesResponse {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Key Points**:
- Match server-side DTOs
- Use clear, descriptive names
- Separate request and response types

---

### 2. Route Definitions

**Location**: `client/src/routes/`

Define route paths for type safety.

**Example**: `client/src/routes/categoryRoute.ts`

```typescript
export const api = {
  categories: {
    list: {
      path: '/api/admin/categories',
    },
    create: {
      path: '/api/admin/categories',
    },
    get: {
      path: (id: string) => `/api/admin/categories/${id}`,
    },
    update: {
      path: (id: string) => `/api/admin/categories/${id}`,
    },
    delete: {
      path: (id: string) => `/api/admin/categories/${id}`,
    },
  },
};
```

**Key Points**:
- Centralize route definitions
- Use functions for dynamic paths
- Can be shared with server routes for consistency

---

### 3. API Service

**Location**: `client/src/lib/apiService.ts`

Wrapper around fetch for making HTTP requests.

**Example**: `client/src/lib/apiService.ts`

```typescript
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
      const errorMsg = errorMessage || data.message || "An error occurred";
      
      if (showErrorToast) {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
      
      throw new Error(errorMsg);
    }

    if (showSuccessToast && successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      });
    }

    return data.data as T;
  }

  async get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      headers: this.getHeaders(options?.headers),
    });

    return this.handleResponse<T>(response, options);
  }

  async post<T>(url: string, body: any, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: this.getHeaders(options?.headers),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response, options);
  }

  async patch<T>(url: string, body: any, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PATCH",
      headers: this.getHeaders(options?.headers),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response, options);
  }

  async delete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "DELETE",
      headers: this.getHeaders(options?.headers),
    });

    return this.handleResponse<T>(response, options);
  }
}

export const apiService = new ApiService();
```

**Key Points**:
- Centralized HTTP client
- Automatic token management
- Toast notifications for success/error
- Type-safe responses

---

### 4. TanStack Query Setup

**Location**: `client/src/lib/queryClient.ts`

Configure TanStack Query client.

**Example**: `client/src/lib/queryClient.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**In `main.tsx`**:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

---

### 5. Custom Hooks with TanStack Query

**Location**: `client/src/hooks/`

Create custom hooks for data fetching and mutations.

**Example**: `client/src/hooks/use-Category.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/apiService";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  GetCategoriesParams,
} from "../models/Category";
import { api } from "../routes/categoryRoute";
import { ListResponse } from "@/lib/interface";

// Query: Get paginated list of categories
export function useCategories(params?: GetCategoriesParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `${api.categories.list.path}?${queryString}` : api.categories.list.path;

  return useQuery({
    queryKey: [api.categories.list.path, params],
    queryFn: () =>
      apiService.get<ListResponse<Category>>(url, {
        showSuccessToast: false,
      }),
  });
}

// Query: Get single category by ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: [api.categories.get.path(id || "")],
    queryFn: () =>
      apiService.get<Category>(api.categories.get.path(id!), {
        showSuccessToast: false,
      }),
    enabled: !!id,
  });
}

// Mutation: Create new category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      apiService.post<Category>(api.categories.create.path, data, {
        successMessage: "Category created successfully",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
    },
  });
}

// Mutation: Update category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      apiService.patch<Category>(api.categories.update.path(id), data, {
        successMessage: "Category updated successfully",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.categories.get.path(variables.id)] });
    },
  });
}

// Mutation: Delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiService.delete(api.categories.delete.path(id), {
        successMessage: "Category deleted successfully",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
    },
  });
}
```

**Key Points**:
- Use `useQuery` for GET requests
- Use `useMutation` for POST/PATCH/DELETE requests
- Invalidate queries after mutations to refetch data
- Include query parameters in queryKey for caching
- Disable queries with `enabled` option when needed

---

### 6. Page Components

**Location**: `client/src/pages/`

Organize page components by feature.

**Example**: `client/src/pages/category/Categories.tsx`

```typescript
import { useState } from "react";
import { useCategories } from "@/hooks/use-Category";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { Button } from "@/components/ui/button";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";

export function Categories() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdOn");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = useCategories({
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          Create Category
        </Button>
      </div>

      <PaginatedDataTable
        data={data?.items || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSearch={setSearch}
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "mainCategoryName", label: "Main Category" },
          { key: "createdOn", label: "Created On" },
        ]}
        onEdit={setEditCategory}
        onDelete={setDeleteCategory}
      />

      <CreateCategoryModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {editCategory && (
        <EditCategoryModal
          category={editCategory}
          open={!!editCategory}
          onClose={() => setEditCategory(null)}
        />
      )}

      {deleteCategory && (
        <DeleteCategoryModal
          category={deleteCategory}
          open={!!deleteCategory}
          onClose={() => setDeleteCategory(null)}
        />
      )}
    </div>
  );
}
```

**Key Points**:
- Use custom hooks for data fetching
- Manage local state for pagination, search, sorting
- Handle loading and error states
- Use modals for create/edit/delete operations

---

### 7. Modal Components

**Example**: `client/src/pages/category/CreateCategoryModal.tsx`

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCategory } from "@/hooks/use-Category";
import { createCategorySchema } from "./formValidator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCategoryModal({ open, onClose }: CreateCategoryModalProps) {
  const createCategory = useCreateCategory();

  const form = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      mainCategoryId: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createCategory.mutateAsync(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mainCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Category ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

**Key Points**:
- Use React Hook Form with Zod validation
- Use mutation hooks for data submission
- Handle loading states
- Reset form and close modal on success

---

## Step-by-Step Implementation Guide

### Adding a New Feature (e.g., "Products")

#### Server-Side Implementation

1. **Create Database Schema**
   - File: `server/db/schemas/products.ts`
   - Define table structure with Drizzle ORM
   - Export TypeScript types

2. **Create DTOs**
   - File: `server/shared/dtos/Product.ts`
   - Define Create, Update, and Response DTOs with Zod
   - Define pagination options

3. **Create Constants**
   - File: `server/shared/constants/feature/productMessages.ts`
   - Define success/error messages
   - Define sort fields

4. **Create Repository**
   - File: `server/service/repos/product_repo.ts`
   - Define interface with all methods
   - Implement CRUD operations
   - Add pagination, sorting, searching
   - Export singleton instance

5. **Create Service**
   - File: `server/service/product_service.ts`
   - Parse request parameters
   - Call repository methods
   - Handle business logic
   - Export singleton instance

6. **Create Route Definitions**
   - File: `server/api/routes/productRoute.ts`
   - Define API contract with schemas

7. **Create Controller**
   - File: `server/api/controllers/products.ts`
   - Register route handlers
   - Use asyncHandler for error handling
   - Use ResponseHandler for consistent responses

8. **Register Routes**
   - File: `server/routes.ts`
   - Import and call route registration function

#### Client-Side Implementation

1. **Create TypeScript Model**
   - File: `client/src/models/Product.ts`
   - Define interfaces matching server DTOs

2. **Create Route Definitions**
   - File: `client/src/routes/productRoute.ts`
   - Define route paths

3. **Create Custom Hooks**
   - File: `client/src/hooks/use-Product.ts`
   - Create query hooks (useProducts, useProduct)
   - Create mutation hooks (useCreateProduct, useUpdateProduct, useDeleteProduct)

4. **Create Form Validator**
   - File: `client/src/pages/product/formValidator.ts`
   - Define Zod schemas for forms

5. **Create Page Component**
   - File: `client/src/pages/product/Products.tsx`
   - Use custom hooks
   - Implement pagination, search, sorting
   - Handle loading and error states

6. **Create Modal Components**
   - Files: 
     - `client/src/pages/product/CreateProductModal.tsx`
     - `client/src/pages/product/EditProductModal.tsx`
     - `client/src/pages/product/DeleteProductModal.tsx`
   - Use React Hook Form with Zod validation
   - Use mutation hooks

7. **Add Route**
   - File: `client/src/App.tsx`
   - Add route to router configuration

---

## Best Practices

### Server-Side

1. **Layered Architecture**
   - Keep layers separate and focused
   - Don't skip layers (controller → service → repository)

2. **Type Safety**
   - Use TypeScript throughout
   - Use Zod for runtime validation
   - Export types from DTOs

3. **Error Handling**
   - Use asyncHandler for all async routes
   - Use ResponseHandler for consistent responses
   - Return appropriate HTTP status codes

4. **Multi-Tenancy**
   - Always filter by tenant ID
   - Extract tenant from authenticated user
   - Validate tenant access

5. **Pagination**
   - Always paginate list endpoints
   - Provide sensible defaults
   - Support sorting and searching

6. **Constants**
   - Centralize messages and magic values
   - Use const assertions for type safety
   - Organize by feature

### Client-Side

1. **TanStack Query**
   - Use for all server state management
   - Invalidate queries after mutations
   - Include all parameters in queryKey
   - Disable queries when needed

2. **API Service**
   - Centralize HTTP logic
   - Handle errors consistently
   - Manage authentication tokens
   - Provide type-safe responses

3. **Component Organization**
   - Group by feature, not by type
   - Keep components focused and small
   - Use composition over inheritance

4. **Form Handling**
   - Use React Hook Form
   - Validate with Zod
   - Show clear error messages
   - Handle loading states

5. **State Management**
   - Use TanStack Query for server state
   - Use local state for UI state
   - Avoid prop drilling

6. **Type Safety**
   - Define interfaces for all data structures
   - Use TypeScript generics
   - Avoid `any` type

---

## Folder Structure Quick Reference

### Server
```
server/
├── api/
│   ├── controllers/      # HTTP handlers
│   └── routes/          # Route definitions
├── db/
│   ├── db.ts           # Database instance
│   └── schemas/        # Drizzle schemas
├── service/
│   ├── *_service.ts    # Business logic
│   └── repos/          # Data access
└── shared/
    ├── constants/      # Constants
    ├── dtos/          # Data Transfer Objects
    └── utils/         # Utilities
```

### Client
```
client/src/
├── components/         # Shared components
│   └── ui/           # UI primitives
├── hooks/            # Custom hooks
├── lib/              # Utilities
├── models/           # TypeScript interfaces
├── pages/            # Page components
│   └── [feature]/   # Feature-specific pages
└── routes/           # Route definitions
```

---

## Summary

This architecture provides:

- **Clear separation of concerns** with distinct layers
- **Type safety** throughout the stack
- **Consistent patterns** that can be replicated across features
- **Scalable structure** that grows with your application
- **Developer experience** with good tooling and conventions

Follow this guide when implementing new features to maintain consistency and quality across your codebase.

---

## Additional Notes

- Replace `DEFAULT_TENANT_ID` with actual authentication logic
- Add authorization middleware for protected routes
- Implement proper error logging and monitoring
- Add unit and integration tests
- Consider API versioning for production applications
- Use environment variables for configuration
- Implement rate limiting for API endpoints

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: Development Team
