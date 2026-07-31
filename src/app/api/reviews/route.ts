import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { productId, userName, rating, comment } = await req.json();
    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү" }, { status: 400 });
    }

    const [review] = await db
      .insert(reviews)
      .values({ productId, userName, rating, comment })
      .returning();

    // Update product rating
    await db
      .update(products)
      .set({
        reviewCount: sql`${products.reviewCount} + 1`,
      })
      .where(eq(products.id, productId));

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
