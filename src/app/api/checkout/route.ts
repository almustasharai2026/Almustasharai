import { NextResponse } from 'next/server';

/**
 * مسار معالجة طلبات الدفع السيادية.
 * يستقبل طلب البدء ويعيد رابط التوجه لصفحة التأكيد المالي اليدوي.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') || 'basic';
    
    // في النظام السيادي، رابط الدفع يشير لصفحة تأكيد التحويل اليدوي (Vodafone Cash)
    const checkoutUrl = `/checkout?plan=${plan}`;

    return NextResponse.json({ 
      success: true,
      url: checkoutUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Protocol Error" }, { status: 500 });
  }
}
