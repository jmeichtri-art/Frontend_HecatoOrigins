export interface AppUser {
  id: number;
  email: string;
  role: 'admin' | 'sales' | 'viewer';
  created_at: string;
}

export type UserRole = 'admin' | 'sales' | 'viewer';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
