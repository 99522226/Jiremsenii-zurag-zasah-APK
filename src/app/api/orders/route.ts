import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, items, totalAmount, paymentMethod, uploadedPhoto, notes } = body;

    if (!customerName || !customerEmail || !customerPhone || !items?.length) {
      return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү" }, { status: 400 });
    }

    const [order] = await db
      .insert(orders)
      .values({
        customerName,
        customerEmail,
        customerPhone,
        items,
        totalAmount,
        paymentMethod: paymentMethod || "bank_transfer",
        uploadedPhoto: uploadedPhoto || null,
        notes: notes || null,
        status: "pending",
        paymentStatus: "pending",
      })
      .returning();

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const all = url.searchParams.get("all");

    if (all === "true") {
      const result = await db.select().from(orders).orderBy(desc(orders.createdAt));
      return NextResponse.json(result);
    }

    if (email) {
      const result = await db
        .select()
        .from(orders)
        .where(eq(orders.customerEmail, email))
        .orderBy(desc(orders.createdAt));
      return NextResponse.json(result);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
