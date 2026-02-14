import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { faqs } from "server/db/schemas/faqs";
import { CreateFaqDTO, GetFaqsOptions, GetFaqsResponse, UpdateFaqDTO, FaqResponseDTO } from "server/shared/dtos/Faq";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { FAQ_SORT_FIELDS } from "server/shared/constants/feature/faqMessages";

export interface IStorageFaq {
  getFaqs(options?: GetFaqsOptions): Promise<GetFaqsResponse>;
  getFaq(id: string, tenantId: string): Promise<FaqResponseDTO | undefined>;
  createFaq(faq: CreateFaqDTO & { tenantId: string; userIp?: string; createdBy?: string }): Promise<FaqResponseDTO>;
  updateFaq(id: string, tenantId: string, updates: UpdateFaqDTO & { userIp?: string; updatedBy?: string }): Promise<FaqResponseDTO>;
  deleteFaq(id: string, tenantId: string): Promise<void>;
  checkDuplicateFaq(title: string, tenantId: string, excludeId?: string): Promise<boolean>;
}

export class StorageFaq implements IStorageFaq {
  async getFaqs(options?: GetFaqsOptions): Promise<GetFaqsResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || FAQ_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;
    const filterTenantId = options?.tenantId;

    // Build base query with tenant and search filter
    let whereCondition: any;
    
    if (filterTenantId) {
      whereCondition = and(eq(faqs.tenantId, filterTenantId));
    }

    if (search && whereCondition) {
      whereCondition = and(whereCondition, sql`${faqs.title} ILIKE ${"%"+search+"%"} OR ${faqs.answer} ILIKE ${"%"+search+"%"}`);
    } else if (search) {
      whereCondition = sql`${faqs.title} ILIKE ${"%"+search+"%"} OR ${faqs.answer} ILIKE ${"%"+search+"%"}`;
    }

    const baseQuery = whereCondition 
      ? db.select().from(faqs).where(whereCondition)
      : db.select().from(faqs);

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = sortBy === FAQ_SORT_FIELDS.TITLE ? faqs.title : faqs.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const items = await baseQuery.orderBy(sortFn(sortColumn)).limit(pageSize).offset(offset);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getFaq(id: string, tenantId: string): Promise<FaqResponseDTO | undefined> {
    const [faq] = await db.select().from(faqs).where(and(eq(faqs.id, id), eq(faqs.tenantId, tenantId)));
    return faq;
  }

  async createFaq(faq: CreateFaqDTO & { tenantId: string; userIp?: string; createdBy?: string }): Promise<FaqResponseDTO> {
    const [newFaq] = await db.insert(faqs).values({
      ...faq,
      createdOn: new Date(),
    }).returning();
    return newFaq;
  }

  async updateFaq(id: string, tenantId: string, updates: UpdateFaqDTO & { userIp?: string; updatedBy?: string }): Promise<FaqResponseDTO> {
    const [updatedFaq] = await db.update(faqs)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(and(eq(faqs.id, id), eq(faqs.tenantId, tenantId)))
      .returning();
    
    if (!updatedFaq) {
      throw new Error("FAQ not found or unauthorized");
    }
    
    return updatedFaq;
  }

  async deleteFaq(id: string, tenantId: string): Promise<void> {
    const result = await db.delete(faqs).where(and(eq(faqs.id, id), eq(faqs.tenantId, tenantId)));
    
    if (!result) {
      throw new Error("FAQ not found or unauthorized");
    }
  }

  async checkDuplicateFaq(title: string, tenantId: string, excludeId?: string): Promise<boolean> {
    let whereCondition = and(eq(faqs.tenantId, tenantId), sql`${faqs.title} ILIKE ${title}`);
    
    if (excludeId) {
      whereCondition = and(whereCondition, sql`${faqs.id} != ${excludeId}`);
    }
    
    const [existingFaq] = await db.select().from(faqs).where(whereCondition);
    return !!existingFaq;
  }
}

export const storageFaq = new StorageFaq();
