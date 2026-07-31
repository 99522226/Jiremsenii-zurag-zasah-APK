import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, language } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Энэ имэйл бүртгэлтэй байна" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ 
        name, 
        email, 
        phone: phone || null, 
        language: language || "mn",
        passwordHash, 
        role: "customer" 
      })
      .returning({ 
        id: users.id, 
        name: users.name, 
        email: users.email, 
        phone: users.phone, 
        language: users.language,
        role: users.role 
      });

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    return NextResponse.json({ user, token });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
