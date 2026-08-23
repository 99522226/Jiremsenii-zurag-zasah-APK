import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const body = await req.json();

    // Одоогийн захиалгыг эхлээд авах
    const [currentOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 }
      );
    }

    // ==========================================
    // 1. ЭХЛЭЭД ЗАХИАЛГЫГ ШИНЭЧИЛНЭ
    // ==========================================
    const [updated] = await db
      .update(orders)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Захиалга шинэчлэхэд алдаа гарлаа" },
        { status: 500 }
      );
    }

    // ==========================================
    // 2. "БОЛОВСРУУЛЖ БАЙНА" БОЛСОН ҮЕД AI ЗУРАГ ҮҮСГЭНЭ
    // ==========================================
    if (
      body.status === "processing" &&
      currentOrder.status !== "processing" &&
      currentOrder.uploadedPhoto &&
      currentOrder.prompt &&
      !currentOrder.editedPhoto
    ) {
      try {
        console.log(`🤖 Order #${orderId}: AI зураг үүсгэж байна...`);

        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          req.nextUrl.origin;

        const generateRes = await fetch(
          `${baseUrl}/api/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageUrl: currentOrder.uploadedPhoto,
              prompt: currentOrder.prompt,
            }),
          }
        );

        const generateData = await generateRes.json();

        if (!generateRes.ok || !generateData?.url) {
          console.error(
            "AI generate error:",
            generateData
          );

          return NextResponse.json({
            ...updated,
            error: "AI зураг үүсгэхэд алдаа гарлаа",
          });
        }

        // ==========================================
        // 3. ҮҮССЭН ЗУРГИЙГ editedPhoto-Д ХАДГАЛНА
        // ==========================================
        const [withPhoto] = await db
          .update(orders)
          .set({
            editedPhoto: generateData.url,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId))
          .returning();

        console.log(
          `✅ Order #${orderId}: AI зураг амжилттай үүслээ`
        );

        return NextResponse.json(withPhoto);
      } catch (generateError) {
        console.error(
          "AI generate error:",
          generateError
        );

        return NextResponse.json({
          ...updated,
          error: "AI зураг үүсгэхэд алдаа гарлаа",
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Order update error:", error);

    return NextResponse.json(
      { error: "Серверийн алдаа" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)));

    if (!order) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order detail error:", error);

    return NextResponse.json(
      { error: "Серверийн алдаа" },
      { status: 500 }
    );
  }
}
