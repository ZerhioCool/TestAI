import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { usersTable, quizzesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const type = session.metadata?.type;
    const userId = session.metadata?.userId;
    const quizId = session.metadata?.quizId;

    if (!userId) {
      console.error("No userId found in session metadata");
      return new NextResponse("Webhook User Error", { status: 400 });
    }

    try {
      if (type === "pro") {
        await db.update(usersTable)
          .set({ 
            plan: "pro", 
            stripeCustomerId: session.customer ? (session.customer as string) : null 
          })
          .where(eq(usersTable.id, userId));
        console.log(`User ${userId} upgraded to pro.`);
      } else if (type === "pass" && quizId) {
        await db.update(quizzesTable)
          .set({ isUnlocked: true, maxGuestPlayers: 10 })
          .where(eq(quizzesTable.id, quizId));
        console.log(`Quiz ${quizId} unlocked with single pass by user ${userId}.`);
      }
    } catch (e) {
      console.error("DB update failed:", e);
      return new NextResponse("DB Error", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
