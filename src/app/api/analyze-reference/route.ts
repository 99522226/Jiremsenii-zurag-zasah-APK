import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Каталогийн зураг шаардлагатай" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
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
                text: `Analyze this catalog/reference photo and create a detailed image-generation prompt.

The goal is to recreate the same scene using another person's face/photo later.

Describe:
- background and environment
- person's pose and body position
- clothing, colors and materials
- lighting
- camera angle and framing
- composition
- important visual details

IMPORTANT:
Do not describe or identify the person's identity.
Do not describe facial identity.
The final prompt must explicitly instruct the image model to preserve the uploaded person's real facial identity when the user's photo is used.

Return ONLY the final image-generation prompt, with no explanation.`,
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

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI Vision error:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "OpenAI Vision ажиллахад алдаа гарлаа",
        },
        { status: 500 }
      );
    }

    const prompt = data?.output
      ?.flatMap((item: any) => item.content || [])
      ?.find((content: any) => content.type === "output_text")
      ?.text;

    if (!prompt) {
      return NextResponse.json(
        { error: "OpenAI-аас prompt ирсэнгүй" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prompt: prompt.trim(),
    });
  } catch (error) {
    console.error("Analyze reference error:", error);

    return NextResponse.json(
      { error: "Каталогийн зураг боловсруулахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
