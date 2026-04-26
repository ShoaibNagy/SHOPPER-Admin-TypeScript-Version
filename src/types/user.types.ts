import type { ISODateString, ListParams, ObjectId } from './api.types';

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------
export type UserRole = 'customer' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';

// ---------------------------------------------------------------------------
// Sub-documents
// ---------------------------------------------------------------------------
export interface UserAddress {
  readonly _id: ObjectId;
  readonly label?: string;          // e.g. "Home", "Office"
  readonly firstName: string;
  readonly lastName: string;
  readonly street: string;
  readonly city: string;
  readonly state?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
  readonly isDefault: boolean;
}

// ---------------------------------------------------------------------------
// Full User document (read — admin view, no password)
// ---------------------------------------------------------------------------
export interface User {
  readonly _id: ObjectId;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly avatar?: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly addresses: UserAddress[];
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly lastOrderAt?: ISODateString;
  readonly emailVerified: boolean;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Lightweight list item
// ---------------------------------------------------------------------------
export type UserListItem = Pick<
  User,
  | '_id'
  | 'name'
  | 'email'
  | 'phone'
  | 'avatar'
  | 'role'
  | 'status'
  | 'orderCount'
  | 'totalSpent'
  | 'lastOrderAt'
  | 'emailVerified'
  | 'createdAt'
>;

// ---------------------------------------------------------------------------
// Update DTO (admins can change status and role; never the password here)
// ---------------------------------------------------------------------------
export interface UpdateUserDto {
  readonly name?: string;
  readonly phone?: string;
  readonly status?: UserStatus;
  readonly role?: UserRole;
}

// ---------------------------------------------------------------------------
// Query params for GET /users
// ---------------------------------------------------------------------------
export interface UserListParams extends ListParams {
  readonly role?: UserRole;
  readonly status?: UserStatus;
  readonly emailVerified?: boolean;
}