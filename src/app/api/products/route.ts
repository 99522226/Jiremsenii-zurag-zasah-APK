import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, ilike, desc, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const sort = url.searchParams.get("sort") || "newest";
    const featured = url.searchParams.get("featured");

    let query = db.select().from(products).$dynamic();

    if (category && category !== "all") {
      query = query.where(eq(products.category, category));
    }

    if (featured === "true") {
      query = query.where(eq(products.featured, true));
    }

    if (sort === "price_asc") {
      query = query.orderBy(asc(products.price));
    } else if (sort === "price_desc") {
      query = query.orderBy(desc(products.price));
    } else if (sort === "rating") {
      query = query.orderBy(desc(products.rating));
    } else {
      query = query.orderBy(desc(products.createdAt));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
