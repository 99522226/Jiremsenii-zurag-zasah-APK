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

    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Эх зургийг татахад алдаа гарлаа" },
        { status: 400 }
      );
    }

   const imageArrayBuffer = await imageRes.arrayBuffer();

const contentType =
  imageRes.headers.get("content-type") || "image/jpeg";

const imageBlob = new Blob([imageArrayBuffer], {
  type: contentType,
});

    const openaiForm = new FormData();

    openaiForm.append("model", "gpt-image-1");

    openaiForm.append("image", imageBlob, "input.jpg");

    openaiForm.append(
      "prompt",
      `${prompt}

IMPORTANT IDENTITY PRESERVATION INSTRUCTIONS:

The person in the generated image must remain the same person as in the input photo.

Preserve the person's identity and facial appearance as accurately as possible.

Do NOT change or redesign the face.

Preserve:
- facial structure
- face shape
- eyes
- eyebrows
- nose
- lips
- mouth
- jawline
- cheek structure
- skin tone
- age
- distinctive facial features
- hairstyle whenever possible

Do NOT create a new face.
Do NOT replace the person's face.
Do NOT beautify or significantly alter the person's facial features.
Do NOT make the person look like another person.

The input photo is the identity reference. Prioritize identity preservation above visual beautification.

Only modify the elements requested by the user's product prompt, such as clothing, body appearance, background, environment, lighting, pose, or other requested elements.

The final image should clearly look like the same person from the original input photo.`
    );

    openaiForm.append("size", "1024x1024");

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

    const base64Image = openaiData?.data?.[0]?.b64_json;

    if (!base64Image) {
      return NextResponse.json(
        { error: "AI-аас зураг ирсэнгүй" },
        { status: 500 }
      );
    }

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Image}`,
      {
        folder: "generated",
        resource_type: "image",
      }
    );

    return NextResponse.json({
      url: uploadResult.secure_url,
    });
  } catch (err) {
    console.error("Generate error:", err);

    return NextResponse.json(
      { error: "Зураг үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
