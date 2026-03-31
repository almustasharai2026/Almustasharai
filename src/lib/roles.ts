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

// المرجع النهائي للسلطة البرمجية للمالك bishoysamy
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
 * تصحيح منطق الهوية السيادية (Sovereign Identity Check).
 * هذا البروتوكول يمنح المالك bishoysamy390@gmail.com صلاحيات الـ GOD_MODE والرصيد اللانهائي.
 */
export const checkSovereignStatus = (email: string | null | undefined) => {
  const KING_EMAIL = SOVEREIGN_ADMIN_EMAIL;
  const normalizedEmail = email?.toLowerCase() || "";
  const isKing = normalizedEmail === KING_EMAIL;
  
  return {
    isOwner: isKing,
    hasInfiniteVault: isKing,
    permissions: isKing ? 'GOD_MODE' : 'CITIZEN'
  };
};

export const getPermissions = (role: UserRole | string | null | undefined, email?: string | null): RolePermissions => {
  const sovereign = checkSovereignStatus(email);
  
  if (role === roles.ADMIN || sovereign.isOwner) {
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
  const sovereign = checkSovereignStatus(profile?.email);
  if (sovereign.hasInfiniteVault) return Infinity;
  return Number(profile?.balance ?? 50); // الافتراضي 50 EGP للمواطن
};
