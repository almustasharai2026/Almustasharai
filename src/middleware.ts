import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * الوسيط البرمجي السيادي.
 * يقوم بمراقبة الطلبات وتأمين الحدود الرقمية للنظام.
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // تعريف المناطق السيادية المحمية
  const isSovereignZone = path.startsWith('/dashboard') || 
                          path.startsWith('/bot') || 
                          path.startsWith('/admin') || 
                          path.startsWith('/templates');

  // ملاحظة: التحقق الفعلي من التوكن يتم داخل ProtectedRoute 
  // لأن Firebase SDK يعتمد على جانب العميل (Client-side).
  // هنا نقوم فقط بتمرير الطلب لضمان استمرارية البروتوكول.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
