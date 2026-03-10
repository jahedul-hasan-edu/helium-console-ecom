import { QueryParams } from "@/lib/interface";

export interface Organization {
  id: string;
  tenantId: string | null;
  title: string | null;
  logoTitle: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  socialFbUrl: string | null;
  socialInUrl: string | null;
  socialXUrl: string | null;
  socialUtubeUrl: string | null;
  license: string | null;
  privacyPolicy: string | null;
  returnPolicy: string | null;
  imageUrl: string | null;
  isActive: boolean | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface CreateOrganizationRequest {
  tenantId: string;
  title: string;
  logoTitle: string;
  phone: string;
  email: string;
  address: string;
  socialFbUrl: string;
  socialInUrl: string;
  socialXUrl: string;
  socialUtubeUrl: string;
  license: string;
  privacyPolicy: string;
  returnPolicy: string;
  isActive: boolean;
  image?: File | null;
}

export interface UpdateOrganizationRequest {
  tenantId?: string;
  title?: string;
  logoTitle?: string;
  phone?: string;
  email?: string;
  address?: string;
  socialFbUrl?: string;
  socialInUrl?: string;
  socialXUrl?: string;
  socialUtubeUrl?: string;
  license?: string;
  privacyPolicy?: string;
  returnPolicy?: string;
  isActive?: boolean;
  image?: File | null;
  removeImage?: boolean;
}

export interface GetOrganizationsParams extends QueryParams {
  tenantId?: string;
}