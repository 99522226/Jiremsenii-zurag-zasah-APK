import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc, gte } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      paymentMethod,
      uploadedPhoto,
      uploadedPhotos,
      prompt,
      notes,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !items?.length) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү" },
        { status: 400 }
      );
    }

    // Өнөөдрийн эхлэх цаг
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Өнөөдрийн захиалгуудыг авах
    const todayOrders = await db
      .select({
        dailyOrderNumber: orders.dailyOrderNumber,
      })
      .from(orders)
      .where(gte(orders.createdAt, todayStart));

    // Өнөөдрийн хамгийн сүүлийн дугаар
    const maxDailyOrderNumber = todayOrders.reduce(
      (max, order) => Math.max(max, order.dailyOrderNumber || 0),
      0
    );

    // Дараагийн дугаар
    const dailyOrderNumber = maxDailyOrderNumber + 1;

    // Захиалга үүсгэх
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
        uploadedPhotos: uploadedPhotos || [],
        prompt: prompt || null,
        notes: notes || null,
        dailyOrderNumber,
        status: "pending",
        paymentStatus: "pending",
      })
      .returning();

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: "Серверийн алдаа" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const all = url.searchParams.get("all");

    if (all === "true") {
      const result = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));

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
    return NextResponse.json(
      { error: "Серверийн алдаа" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Захиалгын ID олдсонгүй" },
        { status: 400 }
      );
    }

    const [deletedOrder] = await db
      .delete(orders)
      .where(eq(orders.id, Number(id)))
      .returning();

    if (!deletedOrder) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);

    return NextResponse.json(
      { error: "Захиалга устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
