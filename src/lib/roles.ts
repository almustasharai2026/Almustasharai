/**
 * ميثاق الرتب السيادية (Sovereign Role Constants).
 * الإصدار النهائي المعتمد للمالك king2026.
 */
export const roles = {
  ADMIN: "admin",       // المالك الملكي (king2026)
  MODERATOR: "moderator", // مشرف
  CONSULTANT: "consultant", // مستشار معتمد
  PENDING_EXPERT: "pending_expert", // خبير قيد المراجعة (لا يظهر في القوائم)
  VIP: "vip",           // عميل مميز
  USER: "user",         // مواطن عادي
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];

// البريد السيادي للمالك - المرجع النهائي للسلطة
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
 * التحقق من الهوية الملكية للمالك king2026 عبر البريد المعتمد.
 */
export const isOwner = (email: string | null | undefined) => {
  return email?.toLowerCase() === SOVEREIGN_ADMIN_EMAIL;
};

export const getPermissions = (role: UserRole | string | null | undefined): RolePermissions => {
  // المالك السيادي king2026 يمتلك كافة الصلاحيات دوماً
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
    case roles.PENDING_EXPERT:
      return {
        canManageUsers: false,
        canPromoteRoles: false,
        canManageSystem: false,
        canConsult: false, // لا يمكنه تقديم استشارات حتى يتم اعتماده
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