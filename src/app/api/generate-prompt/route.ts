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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `
Analyze this product/reference image carefully.

Create a detailed image-generation prompt that can later be used
to recreate this exact visual style and scene with a customer's photo.

Describe:
- person's pose and body position
- clothing and accessories
- background and environment
- lighting
- camera angle
- composition
- colors
- hairstyle
- important visual details
- realistic photography style

IMPORTANT:
Do not describe the person's identity or facial identity.
The future customer's face and identity must remain unchanged.

Return ONLY the final English image-generation prompt.
Do not add explanations or headings.
                `,
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
