
/**
 * ميثاق الرتب السيادية (Sovereign Role Constants).
 * يحدد الرتب الرقمية المعتمدة والصلاحيات الدقيقة لكل رتبة.
 */
export const roles = {
  ADMIN: "admin",
  CONSULTANT: "consultant",
  USER: "user",
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];

export interface RolePermissions {
  canManageUsers: boolean;
  canManageSystem: boolean;
  canConsult: boolean;
  canChatAI: boolean;
  canGenerateDocs: boolean;
  canManageMoney: boolean;
}

/**
 * بروتوكول استخراج الصلاحيات السيادية.
 */
export const getPermissions = (role: UserRole | string): RolePermissions => {
  switch (role) {
    case roles.ADMIN:
      return {
        canManageUsers: true,
        canManageSystem: true,
        canConsult: true,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: true,
      };
    case roles.CONSULTANT:
      return {
        canManageUsers: false,
        canManageSystem: false,
        canConsult: true,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: false,
      };
    default:
      return {
        canManageUsers: false,
        canManageSystem: false,
        canConsult: false,
        canChatAI: true,
        canGenerateDocs: true,
        canManageMoney: false,
      };
  }
};

/**
 * بروتوكول فحص الملكية السيادية (The Sovereign Owner Protocol).
 */
export const isOwner = (email: string | null | undefined) => {
  return email === "bishoysamy390@gmail.com";
};

export const getBalance = (profile: any) => {
  if (profile?.role === roles.ADMIN) return Infinity;
  return profile?.balance || 0;
};
