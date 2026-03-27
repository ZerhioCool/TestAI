import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // In a real scenario, you'd create the Product and Price in Stripe dashboard 
    // and use their price_id here. 
    // We are creating inline price for demonstration if it's not pre-created.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Plan Pro - QuizAI",
              description: "Quizzes ilimitados, multijugador ilimitado hasta 50 jugadores.",
            },
            unit_amount: 499, // $4.99
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        type: "pro",
        userId: user.id,
      },
    });

    if (session.url) {
      return NextResponse.redirect(session.url, 303);
    }
    return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=StripeError", req.url), 303);
  }
}
