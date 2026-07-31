import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, price, category, images, featured, tags } = body;

    if (!name || !slug || !description || !price || !category) {
      return NextResponse.json({ error: "Бүх шаардлагатай талбарыг бөглөнө үү" }, { status: 400 });
    }

    const [product] = await db
      .insert(products)
      .values({
        name,
        slug,
        description,
        price: parseInt(price),
        category,
        images: images || [],
        featured: featured || false,
        tags: tags || [],
      })
      .returning();

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
