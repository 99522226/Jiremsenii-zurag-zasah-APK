```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Бүтээгдэхүүний зураг шаардлагатай" },
        { status: 400 }
      );
    }

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Analyze this product/reference image carefully. Create a detailed English image-generation prompt that describes the scene, person's pose, clothing, accessories, background, environment, lighting, camera angle, composition, colors, hairstyle, and important visual details. Keep the customer's future face and identity unchanged. Do not describe or identify the person's identity. Return ONLY the final English image-generation prompt.",
              },
              {
                type: "input_image",
                image_url: imageUrl,
              },
            ],
          },
        ],
      }),
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI Vision error:", openaiData);

      return NextResponse.json(
        {
          error:
            openaiData?.error?.message ||
            "Prompt үүсгэхэд алдаа гарлаа",
        },
        { status: 500 }
      );
    }

    const prompt =
      openaiData?.output
        ?.flatMap((item: any) => item.content || [])
        ?.find((content: any) => content.type === "output_text")
        ?.text?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "OpenAI-аас prompt ирсэнгүй" },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt });
  } catch (err) {
    console.error("Generate prompt error:", err);

    return NextResponse.json(
      { error: "Prompt үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
```
