import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt } = await req.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: "Зураг болон промпт шаардлагатай" },
        { status: 400 }
      );
    }

    // 1. Хэрэглэгчийн зургийг татна
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Эх зургийг татахад алдаа гарлаа" },
        { status: 400 }
      );
    }

    const imageArrayBuffer = await imageRes.arrayBuffer();

    // 2. Зургийн төрөл
    const contentType =
      imageRes.headers.get("content-type") || "image/jpeg";

    console.log("Image content type:", contentType);
    console.log("Image size:", imageArrayBuffer.byteLength);

    // 3. OpenAI-д файл хэлбэрээр өгөх
    const imageBlob = new Blob([imageArrayBuffer], {
      type: contentType,
    });

    const openaiForm = new FormData();

    openaiForm.append("model", "gpt-image-1");

    openaiForm.append(
      "image",
      imageBlob,
      contentType.includes("png") ? "input.png" : "input.jpg"
    );

    openaiForm.append("prompt", prompt);
    openaiForm.append("size", "1024x1024");

    // Нүүр царайг эх зурагтай аль болох адил хадгална
    openaiForm.append("input_fidelity", "high");

    // 4. OpenAI
    const openaiRes = await fetch(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: openaiForm,
      }
    );

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI error:", openaiData);

      return NextResponse.json(
        {
          error:
            openaiData?.error?.message ||
            "AI зураг үүсгэхэд алдаа гарлаа",
        },
        { status: 500 }
      );
    }

    // 5. AI зураг
    const base64Image = openaiData?.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error("OpenAI response:", openaiData);

      return NextResponse.json(
        { error: "AI-аас зураг ирсэнгүй" },
        { status: 500 }
      );
    }

    // 6. Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Image}`,
      {
        folder: "generated",
        resource_type: "image",
      }
    );

    // 7. URL буцаана
    return NextResponse.json({
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Generate error:", error);

    return NextResponse.json(
      { error: "Зураг үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
