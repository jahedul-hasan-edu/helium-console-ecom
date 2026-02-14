import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { homeSettings } from "server/db/schemas/homeSettings";
import { homeSettingImages } from "server/db/schemas/homeSettingImages";
import { CreateHomeSettingDTO, GetHomeSettingsOptions, GetHomeSettingsResponse, UpdateHomeSettingDTO, HomeSettingResponseDTO } from "server/shared/dtos/HomeSetting";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { HOME_SETTING_SORT_FIELDS } from "server/shared/constants/feature/homeSettingMessages";

export interface IStorageHomeSetting {
  // Home Settings
  getHomeSettings(tenantId: string, options?: GetHomeSettingsOptions): Promise<GetHomeSettingsResponse>;
  getHomeSetting(id: string, tenantId: string): Promise<HomeSettingResponseDTO | undefined>;
  createHomeSetting(homeSetting: CreateHomeSettingDTO & { userIp: string }): Promise<HomeSettingResponseDTO>;
  updateHomeSetting(id: string, tenantId: string, updates: UpdateHomeSettingDTO & { userIp: string }): Promise<HomeSettingResponseDTO>;
  deleteHomeSetting(id: string, tenantId: string): Promise<void>;
  checkDuplicateTitle(title: string, tenantId: string, excludeId?: string): Promise<boolean>;
}

export class StorageHomeSetting implements IStorageHomeSetting {
  // Helper method to build home setting select query
  private buildHomeSettingSelectQuery() {
    return db
      .select({
        id: homeSettings.id,
        tenantId: homeSettings.tenantId,
        title: homeSettings.title,
        subTitle: homeSettings.subTitle,
        isActive: homeSettings.isActive,
        createdBy: homeSettings.createdBy,
        updatedBy: homeSettings.updatedBy,
        createdOn: homeSettings.createdOn,
        updatedOn: homeSettings.updatedOn,
        userIp: homeSettings.userIp,
      })
      .from(homeSettings);
  }

  // Home Settings
  async getHomeSettings(tenantId: string, options?: GetHomeSettingsOptions): Promise<GetHomeSettingsResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || HOME_SETTING_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build where conditions with tenant filter and search
    const whereConditions = search
      ? and(
          eq(homeSettings.tenantId, tenantId),
          sql`${homeSettings.title} ILIKE ${"%"+search+"%"} OR ${homeSettings.subTitle} ILIKE ${"%"+search+"%"}`
        )
      : eq(homeSettings.tenantId, tenantId);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(homeSettings)
      .where(whereConditions);
    const total = Number(countResult[0].count);

    // Apply sorting
    const sortColumn = 
      sortBy === HOME_SETTING_SORT_FIELDS.TITLE ? homeSettings.title :
      homeSettings.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const results = await this.buildHomeSettingSelectQuery()
      .where(whereConditions)
      .orderBy(sortFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    // Fetch images for each home setting
    const itemsWithImages = await Promise.all(
      results.map(async (result) => {
        const images = await db
          .select()
          .from(homeSettingImages)
          .where(eq(homeSettingImages.homeSettingId, result.id));

        return {
          ...result,
          images: images.map((img) => ({
            id: img.id,
            homeSettingId: img.homeSettingId,
            imageUrl: img.imageUrl,
            createdBy: img.createdBy,
            updatedBy: img.updatedBy,
            createdOn: img.createdOn,
            updatedOn: img.updatedOn,
            userIp: img.userIp,
          })),
        };
      })
    );

    return {
      items: itemsWithImages,
      total,
      page,
      pageSize
    };
  }

  async getHomeSetting(id: string, tenantId: string): Promise<HomeSettingResponseDTO | undefined> {
    const [result] = await this.buildHomeSettingSelectQuery()
      .where(and(eq(homeSettings.id, id), eq(homeSettings.tenantId, tenantId)))
      .limit(1);
    
    if (!result) {
      return undefined;
    }

    // Fetch associated images
    const images = await db
      .select()
      .from(homeSettingImages)
      .where(eq(homeSettingImages.homeSettingId, id));

    return {
      ...result,
      images: images.map((img) => ({
        id: img.id,
        homeSettingId: img.homeSettingId,
        imageUrl: img.imageUrl,
        createdBy: img.createdBy,
        updatedBy: img.updatedBy,
        createdOn: img.createdOn,
        updatedOn: img.updatedOn,
        userIp: img.userIp,
      })),
    };
  }

  async createHomeSetting(data: CreateHomeSettingDTO & { userIp: string }): Promise<HomeSettingResponseDTO> {
    const insertResult = await db.insert(homeSettings).values({
      tenantId: data.tenantId,
      title: data.title,
      subTitle: data.subTitle,
      isActive: data.isActive || true,
      userIp: data.userIp,
      createdOn: new Date(),
    }).returning();

    const homeSetting = insertResult[0];

    return {
      id: homeSetting.id,
      tenantId: homeSetting.tenantId,
      title: homeSetting.title,
      subTitle: homeSetting.subTitle,
      isActive: homeSetting.isActive,
      createdBy: homeSetting.createdBy,
      updatedBy: homeSetting.updatedBy,
      createdOn: homeSetting.createdOn,
      updatedOn: homeSetting.updatedOn,
      userIp: homeSetting.userIp,
      images: [],
    };
  }

  async updateHomeSetting(id: string, tenantId: string, updates: UpdateHomeSettingDTO & { userIp: string }): Promise<HomeSettingResponseDTO> {
    // Verify ownership
    const existing = await db
      .select()
      .from(homeSettings)
      .where(and(eq(homeSettings.id, id), eq(homeSettings.tenantId, tenantId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Home Setting not found or access denied");
    }

    const updateData: any = {
      updatedOn: new Date(),
      userIp: updates.userIp,
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subTitle !== undefined) updateData.subTitle = updates.subTitle;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.tenantId !== undefined) updateData.tenantId = updates.tenantId;

    const updateResult = await db
      .update(homeSettings)
      .set(updateData)
      .where(eq(homeSettings.id, id))
      .returning();

    const updated = updateResult[0];

    // Fetch images
    const images = await db
      .select()
      .from(homeSettingImages)
      .where(eq(homeSettingImages.homeSettingId, id));

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      title: updated.title,
      subTitle: updated.subTitle,
      isActive: updated.isActive,
      createdBy: updated.createdBy,
      updatedBy: updated.updatedBy,
      createdOn: updated.createdOn,
      updatedOn: updated.updatedOn,
      userIp: updated.userIp,
      images: images.map((img) => ({
        id: img.id,
        homeSettingId: img.homeSettingId,
        imageUrl: img.imageUrl,
        createdBy: img.createdBy,
        updatedBy: img.updatedBy,
        createdOn: img.createdOn,
        updatedOn: img.updatedOn,
        userIp: img.userIp,
      })),
    };
  }

  async deleteHomeSetting(id: string, tenantId: string): Promise<void> {
    // Verify ownership
    const existing = await db
      .select()
      .from(homeSettings)
      .where(and(eq(homeSettings.id, id), eq(homeSettings.tenantId, tenantId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Home Setting not found or access denied");
    }

    // Delete associated images first
    await db.delete(homeSettingImages).where(eq(homeSettingImages.homeSettingId, id));

    // Delete the home setting
    await db.delete(homeSettings).where(eq(homeSettings.id, id));
  }

  async checkDuplicateTitle(title: string, tenantId: string, excludeId?: string): Promise<boolean> {
    // Fetch all home settings for the tenant
    const results = await db
      .select()
      .from(homeSettings)
      .where(eq(homeSettings.tenantId, tenantId));

    // Check for duplicate (case-insensitive)
    const titleLower = title;
    return results.some(record => 
      record.title === titleLower && 
      (!excludeId || record.id !== excludeId)
    );
  }
}

export const storageHomeSetting = new StorageHomeSetting();
