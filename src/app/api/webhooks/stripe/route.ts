import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable, quizzesTable } from "@/db/schema";

// Stripe is initialized inside the POST handler

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-04-10" as any,
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe Webhook Secret is not set" }, { status: 500 });
  }

  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const type = session.metadata?.type;
      const userId = session.metadata?.userId;
      const amountPaid = session.amount_total || 0;
      
      if (!userId) {
        console.error("No userId found in webhook metadata");
        return NextResponse.json({ received: true });
      }

      // SECURITY: Validar que el monto pagado coincida con el plan solicitado
      if (type === "pro") {
        if (amountPaid < 499) {
          console.error(`Intento de fraude: Pago insuficiente para Plan PRO (${amountPaid}) de usuario ${userId}`);
          return NextResponse.json({ received: true });
        }
        // Update user to PRO
        await db.update(usersTable)
          .set({ plan: "pro" })
          .where(eq(usersTable.id, userId));
        console.log("User updated to PRO:", userId);
      } else if (type === "pass") {
        if (amountPaid < 99) {
          console.error(`Intento de fraude: Pago insuficiente para Pase (${amountPaid}) de usuario ${userId}`);
          return NextResponse.json({ received: true });
        }
        // Unlock specific quiz with max length 10 and 10 days expiry
        const quizId = session.metadata?.quizId;
        if (quizId) {
          const tenDaysFromNow = new Date();
          tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

          await db.update(quizzesTable)
            .set({ 
              isUnlocked: true, 
              maxGuestPlayers: 10,
              expiresAt: tenDaysFromNow
            })
            .where(eq(quizzesTable.id, quizId));
          console.log("Quiz unlocked for user with 10 days expiry:", quizId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
