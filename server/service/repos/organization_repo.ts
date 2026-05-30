import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";
import { db } from "server/db";
import { organizations } from "server/db/schemas/organizations";
import {
  CreateOrganizationDTO,
  GetOrganizationsOptions,
  GetOrganizationsResponse,
  OrganizationResponseDTO,
  UpdateOrganizationDTO,
} from "server/shared/dtos/Organization";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { ORGANIZATION_SORT_FIELDS } from "server/shared/constants/feature/organizationMessages";

interface OrganizationMutationMetadata {
  userIp: string;
  imageUrl?: string | null;
  createdBy?: string;
  updatedBy?: string;
}

export interface IStorageOrganization {
  getOrganizations(tenantId: string, options?: GetOrganizationsOptions): Promise<GetOrganizationsResponse>;
  getOrganization(id: string, tenantId: string): Promise<OrganizationResponseDTO | undefined>;
  createOrganization(
    data: CreateOrganizationDTO & OrganizationMutationMetadata
  ): Promise<OrganizationResponseDTO>;
  updateOrganization(
    id: string,
    tenantId: string,
    updates: UpdateOrganizationDTO & OrganizationMutationMetadata
  ): Promise<OrganizationResponseDTO>;
  deleteOrganization(id: string, tenantId: string): Promise<void>;
  checkDuplicateTitle(title: string, tenantId: string, excludeId?: string): Promise<boolean>;
  hasOrganizationForTenant(tenantId: string, excludeId?: string): Promise<boolean>;
}

export class StorageOrganization implements IStorageOrganization {
  private buildOrganizationSelectQuery() {
    return db
      .select({
        id: organizations.id,
        tenantId: organizations.tenantId,
        title: organizations.title,
        logoTitle: organizations.logoTitle,
        phone: organizations.phone,
        email: organizations.email,
        address: organizations.address,
        socialFbUrl: organizations.socialFbUrl,
        socialInUrl: organizations.socialInUrl,
        socialXUrl: organizations.socialXUrl,
        socialUtubeUrl: organizations.socialUtubeUrl,
        license: organizations.license,
        privacyPolicy: organizations.privacyPolicy,
        returnPolicy: organizations.returnPolicy,
        imageUrl: organizations.imageUrl,
        isActive: organizations.isActive,
        createdBy: organizations.createdBy,
        updatedBy: organizations.updatedBy,
        createdOn: organizations.createdOn,
        updatedOn: organizations.updatedOn,
        userIp: organizations.userIp,
      })
      .from(organizations);
  }

  async getOrganizations(
    tenantId: string,
    options?: GetOrganizationsOptions
  ): Promise<GetOrganizationsResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || ORGANIZATION_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    const whereConditions = search
      ? and(
          eq(organizations.tenantId, tenantId),
          or(
            sql`${organizations.title} ILIKE ${`%${search}%`}`,
            sql`${organizations.logoTitle} ILIKE ${`%${search}%`}`,
            sql`${organizations.email} ILIKE ${`%${search}%`}`,
            sql`${organizations.phone} ILIKE ${`%${search}%`}`
          )
        )
      : eq(organizations.tenantId, tenantId);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(organizations)
      .where(whereConditions);
    const total = Number(countResult[0]?.count || 0);

    const sortColumn =
      sortBy === ORGANIZATION_SORT_FIELDS.TITLE
        ? organizations.title
        : sortBy === ORGANIZATION_SORT_FIELDS.LOGO_TITLE
          ? organizations.logoTitle
          : sortBy === ORGANIZATION_SORT_FIELDS.EMAIL
            ? organizations.email
            : organizations.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;
    const offset = (page - 1) * pageSize;

    const items = await this.buildOrganizationSelectQuery()
      .where(whereConditions)
      .orderBy(sortFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getOrganization(id: string, tenantId: string): Promise<OrganizationResponseDTO | undefined> {
    const [organization] = await this.buildOrganizationSelectQuery()
      .where(and(eq(organizations.id, id), eq(organizations.tenantId, tenantId)))
      .limit(1);

    return organization;
  }

  async createOrganization(
    data: CreateOrganizationDTO & OrganizationMutationMetadata
  ): Promise<OrganizationResponseDTO> {
    const [organization] = await db
      .insert(organizations)
      .values({
        tenantId: data.tenantId,
        title: data.title,
        logoTitle: data.logoTitle,
        phone: data.phone,
        email: data.email,
        address: data.address,
        socialFbUrl: data.socialFbUrl,
        socialInUrl: data.socialInUrl,
        socialXUrl: data.socialXUrl,
        socialUtubeUrl: data.socialUtubeUrl,
        license: data.license,
        privacyPolicy: data.privacyPolicy,
        returnPolicy: data.returnPolicy,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
        createdOn: new Date(),
        updatedOn: new Date(),
        userIp: data.userIp,
      })
      .returning();

    return organization;
  }

  async updateOrganization(
    id: string,
    tenantId: string,
    updates: UpdateOrganizationDTO & OrganizationMutationMetadata
  ): Promise<OrganizationResponseDTO> {
    const updateData: Partial<typeof organizations.$inferInsert> = {
      updatedOn: new Date(),
      updatedBy: updates.updatedBy,
      userIp: updates.userIp,
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.logoTitle !== undefined) updateData.logoTitle = updates.logoTitle;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.socialFbUrl !== undefined) updateData.socialFbUrl = updates.socialFbUrl;
    if (updates.socialInUrl !== undefined) updateData.socialInUrl = updates.socialInUrl;
    if (updates.socialXUrl !== undefined) updateData.socialXUrl = updates.socialXUrl;
    if (updates.socialUtubeUrl !== undefined) updateData.socialUtubeUrl = updates.socialUtubeUrl;
    if (updates.license !== undefined) updateData.license = updates.license;
    if (updates.privacyPolicy !== undefined) updateData.privacyPolicy = updates.privacyPolicy;
    if (updates.returnPolicy !== undefined) updateData.returnPolicy = updates.returnPolicy;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    const [organization] = await db
      .update(organizations)
      .set(updateData)
      .where(and(eq(organizations.id, id), eq(organizations.tenantId, tenantId)))
      .returning();

    if (!organization) {
      throw new Error("Organization not found");
    }

    return organization;
  }

  async deleteOrganization(id: string, tenantId: string): Promise<void> {
    await db
      .delete(organizations)
      .where(and(eq(organizations.id, id), eq(organizations.tenantId, tenantId)));
  }

  async checkDuplicateTitle(title: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(organizations.tenantId, tenantId),
      sql`lower(${organizations.title}) = lower(${title})`,
    ];

    if (excludeId) {
      conditions.push(ne(organizations.id, excludeId));
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(organizations)
      .where(and(...conditions));

    return Number(result?.count || 0) > 0;
  }

  async hasOrganizationForTenant(tenantId: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(organizations.tenantId, tenantId)];

    if (excludeId) {
      conditions.push(ne(organizations.id, excludeId));
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(organizations)
      .where(and(...conditions));

    return Number(result?.count || 0) > 0;
  }
}

export const storageOrganization = new StorageOrganization();