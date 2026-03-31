
/**
 * ميثاق الرتب السيادية (Sovereign Role Constants).
 */
export const roles = {
  ADMIN: "admin",       // المالك الملكي (king2026)
  MODERATOR: "moderator", // مشرف
  CONSULTANT: "consultant", // مستشار
  VIP: "vip",           // عميل مميز
  USER: "user",         // مواطن عادي
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];

export interface RolePermissions {
  canManageUsers: boolean;
  canPromoteRoles: boolean;
  canManageSystem: boolean;
  canConsult: boolean;
  canChatAI: boolean;
  canGenerateDocs: boolean;
  canManageMoney: boolean;
  consultationDiscount: number;
}

/**
 * التحقق من الهوية الملكية للمالك king2026 عبر البريد المعتمد.
 */
export const isOwner = (email: string | null | undefined) => {
  const adminEmails = ["bishoysamy390@gmail.com"];
  return email ? adminEmails.includes(email.toLowerCase()) : false;
};

export const getPermissions = (role: UserRole | string): RolePermissions => {
  switch (role) {
    case roles.ADMIN:
      return {
        canManageUsers: true,
        canPromoteRoles: true,
        canManageSystem: true,
        canConsult: true,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: true,
        consultationDiscount: 0,
      };
    case roles.MODERATOR:
      return {
        canManageUsers: true,
        canPromoteRoles: false,
        canManageSystem: true,
        canConsult: false,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: false,
        consultationDiscount: 0,
      };
    case roles.VIP:
      return {
        canManageUsers: false,
        canPromoteRoles: false,
        canManageSystem: false,
        canConsult: false,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: false,
        consultationDiscount: 0.5,
      };
    case roles.CONSULTANT:
      return {
        canManageUsers: false,
        canPromoteRoles: false,
        canManageSystem: false,
        canConsult: true,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: false,
        consultationDiscount: 0,
      };
    default:
      return {
        canManageUsers: false,
        canPromoteRoles: false,
        canManageSystem: false,
        canConsult: false,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: false,
        consultationDiscount: 0,
      };
  }
};

export const getBalance = (profile: any) => {
  if (profile?.role === roles.ADMIN || isOwner(profile?.email)) return Infinity;
  return profile?.balance || 0;
};
