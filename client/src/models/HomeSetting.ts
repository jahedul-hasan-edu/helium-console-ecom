/**
 * Home Setting model interfaces
 */

export interface HomeSettingImage {
  id: string;
  homeSettingId: string | null;
  imageUrl: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface HomeSetting {
  id: string;
  tenantId: string | null;
  title: string | null;
  subTitle: string | null;
  isActive: boolean | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
  images?: HomeSettingImage[];
}

export interface CreateHomeSettingRequest {
  tenantId: string;
  title: string;
  subTitle: string;
  isActive: boolean;
  images?: File[];
}

export interface UpdateHomeSettingRequest {
  tenantId?: string;
  title?: string;
  subTitle?: string;
  isActive?: boolean;
  images?: File[];
  imagesToDelete?: string[];
}
