export interface User {
  id: string;
  tenantId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobile: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: Date | null;
  updatedOn: Date | null;
  userIp: string | null;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface UserResponse extends User {}

export type UserListResponse = User[];