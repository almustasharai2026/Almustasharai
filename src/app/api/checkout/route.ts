
import { NextResponse } from 'next/server';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

/**
 * مسار معالجة طلبات الدفع الآلية باستخدام Stripe.
 * يستقبل نوع الباقة ويقوم بإنشاء جلسة دفع مشفرة.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') || 'basic';
    
    // ميزان الأسعار السيادي
    let unitAmount = 10000; // 100 EGP default
    let planName = "الباقة الأساسية";

    if (plan === "pro") {
      unitAmount = 25000; // 250 EGP
      planName = "الباقة الاحترافية";
    } else if (plan === "vip") {
      unitAmount = 50000; // 500 EGP
      planName = "الباقة السيادية";
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: `المستشار AI - ${planName}`,
              description: "شحن رصيد الخدمات القانونية والوثائق",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/dashboard?payment=success`,
      cancel_url: `${request.headers.get("origin")}/pricing?payment=cancel`,
    });

    return NextResponse.json({ 
      success: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    console.error("[Sovereign Stripe Error]", error.message);
    return NextResponse.json({ error: "فشل في تجهيز بوابة الدفع العالمية" }, { status: 500 });
  }
}
