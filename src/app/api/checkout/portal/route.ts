import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@/utils/supabase/server';
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    // Get the user's stripeCustomerId from DB
    const userInfo = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    
    if (!userInfo.length) {
       return NextResponse.redirect(new URL("/dashboard?error=NoStripeCustomer", req.url), 303);
    }

    let { stripeCustomerId } = userInfo[0];

    // Generar un ID nuevo si no existía (ej. se saltaron el checkout)
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email || 'user@example.com' });
      stripeCustomerId = customer.id;
      await db.update(usersTable).set({ stripeCustomerId }).where(eq(usersTable.id, user.id));
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.redirect(session.url, 303);

  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=StripePortalError", req.url), 303);
  }
}
