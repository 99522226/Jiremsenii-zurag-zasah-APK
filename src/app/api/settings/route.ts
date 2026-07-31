import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

// Get all settings or specific setting by key
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (key) {
      const [setting] = await db.select().from(settings).where(eq(settings.key, key));
      if (!setting) {
        // Return default values
        const defaults: Record<string, string> = {
          photo_price: "5000",
          delivery_time: "24",
          phone: "95009809",
          email: "jaagiierdene96@gmail.com",
          location: "Дорноговь, Сайншанд",
          bank_account: "5000XXXXXXXX",
          bank_name: "Хаан банк",
          account_holder: "Жаргал Эрдэнэ",
        };
        return NextResponse.json({ key, value: defaults[key] || "" });
      }
      return NextResponse.json(setting);
    }

    const allSettings = await db.select().from(settings);
    
    // Merge with defaults
    const defaults: Record<string, { value: string; label: string }> = {
      photo_price: { value: "5000", label: "Нэг зургийн үнэ (₮)" },
      delivery_time: { value: "24", label: "Хүргэлтийн хугацаа (цаг)" },
      phone: { value: "95009809", label: "Утасны дугаар" },
      email: { value: "jaagiierdene96@gmail.com", label: "Имэйл хаяг" },
      location: { value: "Дорноговь, Сайншанд", label: "Байршил" },
      bank_account: { value: "5000XXXXXXXX", label: "Дансны дугаар" },
      bank_name: { value: "Хаан банк", label: "Банкны нэр" },
      account_holder: { value: "Жаргал Эрдэнэ", label: "Данс эзэмшигч" },
    };

    const settingsMap: Record<string, { value: string; label: string }> = {};
    
    // Add defaults first
    for (const [key, def] of Object.entries(defaults)) {
      settingsMap[key] = def;
    }
    
    // Override with saved settings
    for (const s of allSettings) {
      settingsMap[s.key] = { value: s.value, label: s.label || s.key };
    }

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}

// Update settings (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, label } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key болон value шаардлагатай" }, { status: 400 });
    }

    // Upsert setting
    const existing = await db.select().from(settings).where(eq(settings.key, key));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(settings)
        .set({ value, label, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return NextResponse.json(updated);
    } else {
      const [created] = await db
        .insert(settings)
        .values({ key, value, label })
        .returning();
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}

// Bulk update settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Буруу формат" }, { status: 400 });
    }

    const results = [];
    
    for (const [key, data] of Object.entries(body as Record<string, { value: string; label?: string }>)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key));
      
      if (existing.length > 0) {
        const [updated] = await db
          .update(settings)
          .set({ value: data.value, label: data.label, updatedAt: new Date() })
          .where(eq(settings.key, key))
          .returning();
        results.push(updated);
      } else {
        const [created] = await db
          .insert(settings)
          .values({ key, value: data.value, label: data.label })
          .returning();
        results.push(created);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
