import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    if (!product) {
      return NextResponse.json({ error: "Бүтээгдэхүүн олдсонгүй" }, { status: 404 });
    }

    const productReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, product.id));

    return NextResponse.json({ product, reviews: productReviews });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
