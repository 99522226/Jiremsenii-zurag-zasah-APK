import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, orders, users, reviews } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all");

    if (all === "true") {
      // Dashboard stats
      const [productsData, ordersData, usersData, reviewsData] = await Promise.all([
        db.select().from(products).orderBy(desc(products.createdAt)),
        db.select().from(orders).orderBy(desc(orders.createdAt)),
        db.select().from(users).orderBy(desc(users.createdAt)),
        db.select().from(reviews).orderBy(desc(reviews.createdAt)),
      ]);

      const revenue = ordersData
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const pendingRevenue = ordersData
        .filter((o) => o.paymentStatus === "pending")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return NextResponse.json({
        products: productsData,
        orders: ordersData,
        users: usersData.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          language: u.language,
          role: u.role,
          createdAt: u.createdAt,
        })),
        reviews: reviewsData,
        stats: {
          totalProducts: productsData.length,
          totalOrders: ordersData.length,
          totalUsers: usersData.length,
          totalReviews: reviewsData.length,
          revenue,
          pendingRevenue,
          pendingOrders: ordersData.filter((o) => o.status === "pending").length,
          processingOrders: ordersData.filter((o) => o.status === "processing").length,
          completedOrders: ordersData.filter((o) => o.status === "completed").length,
        },
      });
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
