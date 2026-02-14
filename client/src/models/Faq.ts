export interface Faq {
  id: string;
  tenantId: string;
  title: string;
  answer: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdOn?: string;
  updatedOn?: string;
  userIp?: string;
}

export interface CreateFaqRequest {
  title: string;
  answer: string;
  tenantId: string;
  isActive?: boolean;
}

export interface UpdateFaqRequest {
  title?: string;
  answer?: string;
  tenantId?: string;
  isActive?: boolean;
}
