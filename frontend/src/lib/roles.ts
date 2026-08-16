export const roles = {
  developer: "DEVELOPER",
  admin: "ADMIN",
  staff: "STAFF",
  client: "CLIENT",
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];

export function isDeveloper(role?: string | null) {
  return role === roles.developer;
}

export function isAdmin(role?: string | null) {
  return role === roles.developer || role === roles.admin;
}

export function isStaff(role?: string | null) {
  return role === roles.developer || role === roles.admin || role === roles.staff;
}

export function isClient(role?: string | null) {
  return role === roles.client;
}
