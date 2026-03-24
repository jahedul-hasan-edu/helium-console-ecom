export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isActive: boolean;
  isSystem: boolean;
  assignedUserCount: number;
  activePageCount: number;
  createdOn?: Date | null;
  updatedOn?: Date | null;
}

export interface CreateRoleRequest {
  displayName: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {}