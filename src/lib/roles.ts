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

/**
 * بروتوكول فحص صلاحيات الحذف.
 * متاح للمدير والمراقب لضمان نظافة المحتوى السيادي.
 */
export const canDelete = (role: string) => {
  return role === roles.ADMIN || role === roles.MODERATOR;
};

/**
 * بروتوكول فحص صلاحيات الحظر السيادي.
 * متاح للمدير فقط (سلطة عليا).
 */
export const canBan = (role: string) => {
  return role === roles.ADMIN;
};

/**
 * بروتوكول فحص صلاحيات تعديل المحتوى المعتمد.
 * متاح للمدير فقط لضمان دقة الوثائق القانونية.
 */
export const canEditContent = (role: string) => {
  return role === roles.ADMIN;
};
