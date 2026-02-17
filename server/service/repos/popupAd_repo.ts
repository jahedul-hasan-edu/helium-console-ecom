import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { popupAds } from "server/db/schemas/popupAds";
import { CreatePopupAdDTO, GetPopupAdsOptions, GetPopupAdsResponse, UpdatePopupAdDTO, PopupAdResponseDTO } from "server/shared/dtos/PopupAd";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { POPUP_AD_SORT_FIELDS } from "server/shared/constants/feature/popupAdMessages";

export interface IStoragePopupAd {
  getPopupAds(tenantId: string, options?: GetPopupAdsOptions): Promise<GetPopupAdsResponse>;
  getPopupAd(id: string, tenantId: string): Promise<PopupAdResponseDTO | undefined>;
  createPopupAd(popupAd: CreatePopupAdDTO & { imageUrl?: string; userIp: string }): Promise<PopupAdResponseDTO>;
  updatePopupAd(id: string, tenantId: string, updates: UpdatePopupAdDTO & { imageUrl?: string; userIp: string }): Promise<PopupAdResponseDTO>;
  deletePopupAd(id: string, tenantId: string): Promise<void>;
  checkDuplicateTitle(title: string, tenantId: string, excludeId?: string): Promise<boolean>;
}

export class StoragePopupAd implements IStoragePopupAd {
  // Helper method to build popup ad select query
  private buildPopupAdSelectQuery() {
    return db
      .select({
        id: popupAds.id,
        tenantId: popupAds.tenantId,
        title: popupAds.title,
        imageUrl: popupAds.imageUrl,
        isActive: popupAds.isActive,
        createdBy: popupAds.createdBy,
        updatedBy: popupAds.updatedBy,
        createdOn: popupAds.createdOn,
        updatedOn: popupAds.updatedOn,
        userIp: popupAds.userIp,
      })
      .from(popupAds);
  }

  async getPopupAds(tenantId: string, options?: GetPopupAdsOptions): Promise<GetPopupAdsResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || POPUP_AD_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build where conditions with tenant filter and search
    const whereConditions = search
      ? and(
          eq(popupAds.tenantId, tenantId),
          sql`${popupAds.title} ILIKE ${"%"+search+"%"}`
        )
      : eq(popupAds.tenantId, tenantId);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(popupAds)
      .where(whereConditions);
    const total = Number(countResult[0].count);

    // Apply sorting
    const sortColumn = 
      sortBy === POPUP_AD_SORT_FIELDS.TITLE ? popupAds.title :
      popupAds.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const results = await this.buildPopupAdSelectQuery()
      .where(whereConditions)
      .orderBy(sortFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    return {
      items: results,
      total,
      page,
      pageSize
    };
  }

  async getPopupAd(id: string, tenantId: string): Promise<PopupAdResponseDTO | undefined> {
    const [result] = await this.buildPopupAdSelectQuery()
      .where(and(eq(popupAds.id, id), eq(popupAds.tenantId, tenantId)))
      .limit(1);
    
    return result;
  }

  async createPopupAd(data: CreatePopupAdDTO & { imageUrl?: string; userIp: string }): Promise<PopupAdResponseDTO> {
    const insertResult = await db.insert(popupAds).values({
      tenantId: data.tenantId,
      title: data.title,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive || true,
      userIp: data.userIp,
      createdOn: new Date(),
    }).returning();

    const popupAd = insertResult[0];

    return {
      id: popupAd.id,
      tenantId: popupAd.tenantId,
      title: popupAd.title,
      imageUrl: popupAd.imageUrl,
      isActive: popupAd.isActive,
      createdBy: popupAd.createdBy,
      updatedBy: popupAd.updatedBy,
      createdOn: popupAd.createdOn,
      updatedOn: popupAd.updatedOn,
      userIp: popupAd.userIp,
    };
  }

  async updatePopupAd(id: string, tenantId: string, updates: UpdatePopupAdDTO & { imageUrl?: string | null; userIp: string }): Promise<PopupAdResponseDTO> {
    const updateData: any = {
      updatedOn: new Date(),
      userIp: updates.userIp,
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;

    const updateResult = await db
      .update(popupAds)
      .set(updateData)
      .where(and(eq(popupAds.id, id), eq(popupAds.tenantId, tenantId)))
      .returning();

    if (!updateResult.length) {
      throw new Error("Popup Ad not found");
    }

    const popupAd = updateResult[0];

    return {
      id: popupAd.id,
      tenantId: popupAd.tenantId,
      title: popupAd.title,
      imageUrl: popupAd.imageUrl,
      isActive: popupAd.isActive,
      createdBy: popupAd.createdBy,
      updatedBy: popupAd.updatedBy,
      createdOn: popupAd.createdOn,
      updatedOn: popupAd.updatedOn,
      userIp: popupAd.userIp,
    };
  }

  async deletePopupAd(id: string, tenantId: string): Promise<void> {
    await db
      .delete(popupAds)
      .where(and(eq(popupAds.id, id), eq(popupAds.tenantId, tenantId)));
  }

  async checkDuplicateTitle(title: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const whereConditions = excludeId
      ? and(eq(popupAds.tenantId, tenantId), sql`${popupAds.title} ILIKE ${title}`, sql`${popupAds.id} != ${excludeId}`)
      : and(eq(popupAds.tenantId, tenantId), sql`${popupAds.title} ILIKE ${title}`);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(popupAds)
      .where(whereConditions);

    return Number(result[0].count) > 0;
  }
}

export const storagePopupAd = new StoragePopupAd();
