/**
 * PopupAd Model and Interfaces
 */

/**
 * PopupAd entity (with required id for API responses)
 */
export interface PopupAd {
  id: string;
  tenantId: string;
  title: string;
  imageUrl?: string | null;
  isActive?: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdOn?: Date | string | null;
  updatedOn?: Date | string | null;
}

/**
 * Form data for creating a popup ad
 */
export interface CreatePopupAdRequest {
  title: string;
  tenantId: string;
  isActive?: boolean;
  image?: File;
}

/**
 * Form data for updating a popup ad
 */
export interface UpdatePopupAdRequest {
  title?: string;
  tenantId?: string;
  isActive?: boolean;
  image?: File;
  removeImage?: boolean;
}

/**
 * API Response for popup ad (alias for PopupAd)
 */
export type PopupAdResponse = PopupAd;

/**
 * Form submission data (includes file handling)
 */
export type PopupAdFormData = CreatePopupAdRequest | UpdatePopupAdRequest;
