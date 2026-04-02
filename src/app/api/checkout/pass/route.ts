import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-04-10" as any,
  });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login?redirect=/dashboard", req.url), 303);
    }

    const formData = await req.formData();
    const quizId = formData.get("quizId")?.toString();

    if (!quizId) {
      return NextResponse.redirect(new URL("/dashboard?error=MissingQuizId", req.url), 303);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pase Multijugador de un Solo Uso",
              description: "Desbloquea hasta 10 jugadores para este test específico.",
            },
            unit_amount: 99, // $0.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/quiz/${quizId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/quiz/${quizId}?canceled=true`,
      metadata: {
        type: "pass",
        userId: user.id,
        quizId: quizId,
      },
    });

    if (session.url) {
      return NextResponse.redirect(session.url, 303);
    }
    return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    const errorMessage = encodeURIComponent(error.message || "Error desconocido");
    return NextResponse.redirect(new URL(`/dashboard?error=StripeError&message=${errorMessage}`, req.url), 303);
  }
}
