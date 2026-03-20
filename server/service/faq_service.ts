import { storageFaq } from "./repos/faq_repo";
import { CreateFaqDTO, GetFaqsOptions, GetFaqsResponse, UpdateFaqDTO, FaqResponseDTO } from "server/shared/dtos/Faq";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { FAQ_SORT_FIELDS } from "server/shared/constants/feature/faqMessages";
import { extractTenantId, getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";

/**
 * FAQ Service
 * Handles all FAQ-related business logic
 * Acts as a bridge between controller and repository
 */
export class FaqService {
  /**
   * Get FAQs with pagination, sorting, and searching
   */
  async getFaqs(req: Request): Promise<GetFaqsResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || FAQ_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    const filterTenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;

    const options: GetFaqsOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
      tenantId: filterTenantId,
    };

    return await storageFaq.getFaqs(options);
  }

  /**
   * Get a single FAQ by ID
   */
  async getFaq(id: string, tenantId?: string): Promise<FaqResponseDTO | undefined> {
    const finalTenantId = tenantId;
    if (!finalTenantId) {
      throw new Error("Tenant context is required");
    }
    return await storageFaq.getFaq(id, finalTenantId);
  }

  /**
   * Create a new FAQ
   */
  async createFaq(req: Request): Promise<FaqResponseDTO> {
    const { title, answer, isActive, tenantId: requestTenantId } = req.body;
    const tenantId = requestTenantId || extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
    const userIp = getUserIp(req);
    const createdBy = (req as any).userId;

    // Check for duplicate FAQ (same title and tenant)
    const isDuplicate = await storageFaq.checkDuplicateFaq(title, tenantId);
    if (isDuplicate) {
      throw new Error("FAQ with this title already exists for this tenant");
    }

    const createData: CreateFaqDTO & { tenantId: string; userIp?: string; createdBy?: string } = {
      title,
      answer,
      isActive: isActive ?? true,
      tenantId,
      userIp,
      createdBy,
    };

    return await storageFaq.createFaq(createData);
  }

  /**
   * Update an existing FAQ
   */
  async updateFaq(id: string, req: Request): Promise<FaqResponseDTO> {
    const { title, answer, isActive } = req.body;
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
    const userIp = getUserIp(req);
    const updatedBy = (req as any).userId;

    // Check for duplicate FAQ when title is being updated
    if (title) {
      const isDuplicate = await storageFaq.checkDuplicateFaq(title, tenantId, id);
      if (isDuplicate) {
        throw new Error("FAQ with this title already exists for this tenant");
      }
    }

    const updateData: UpdateFaqDTO & { userIp?: string; updatedBy?: string } = {
      ...(title !== undefined && { title }),
      ...(answer !== undefined && { answer }),
      ...(isActive !== undefined && { isActive }),
      userIp,
      updatedBy,
    };

    return await storageFaq.updateFaq(id, tenantId, updateData);
  }

  /**
   * Delete a FAQ
   */
  async deleteFaq(id: string, tenantId?: string): Promise<void> {
    const finalTenantId = tenantId;
    if (!finalTenantId) {
      throw new Error("Tenant context is required");
    }
    return await storageFaq.deleteFaq(id, finalTenantId);
  }
}

export const faqService = new FaqService();
