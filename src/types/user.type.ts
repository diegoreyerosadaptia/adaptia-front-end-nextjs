export const USER_ROLES = ['USER','ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type User = {
    id: string
    name: string
    surname: string
    email: string
    role: UserRole
    created_at: string
  }