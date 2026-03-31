/**
 * ميثاق الرتب السيادية (Sovereign Role Constants).
 * يحدد الرتب الرقمية المعتمدة داخل نظام المستشار AI.
 */
export const roles = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  CONSULTANT: "consultant",
  USER: "user",
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];
