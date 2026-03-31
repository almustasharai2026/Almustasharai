
/**
 * ميثاق الرتب السيادية (The Sovereign Hierarchy king2026).
 * الإصدار النهائي المعتمد لإدارة كوكب المستشار AI.
 */
export const roles = {
  ADMIN: "admin",       // المالك الملكي المطلق (king2026)
  MODERATOR: "moderator", // جهاز الرقابة
  CONSULTANT: "consultant", // هيئة الخبراء المعتمدين
  PENDING_EXPERT: "pending_expert", // خبير قيد الفحص السيادي
  VIP: "vip",           // مواطن من الفئة الممتازة
  USER: "user",         // مواطن سيادي
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];

// المرجع النهائي للسلطة البرمجية
export const SOVEREIGN_ADMIN_EMAIL = "bishoysamy390@gmail.com";

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
 * التحقق من الهوية الملكية للمالك king2026.
 */
export const isOwner = (email: string | null | undefined) => {
  return email?.toLowerCase() === SOVEREIGN_ADMIN_EMAIL;
};

export const getPermissions = (role: UserRole | string | null | undefined): RolePermissions => {
  // المالك king2026 يمتلك كافة مفاتيح الكوكب
  if (role === roles.ADMIN) {
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
  }

  switch (role) {
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
  return Number(profile?.balance || 0);
};
