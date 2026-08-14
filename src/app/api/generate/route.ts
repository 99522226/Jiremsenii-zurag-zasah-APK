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

=== CRITICAL IDENTITY PRESERVATION ===

The uploaded image is the PRIMARY IDENTITY REFERENCE.

Preserve the exact identity of every person visible in the input image.

The generated person must be immediately recognizable as the SAME REAL PERSON from the uploaded photo.

FACIAL IDENTITY — HIGHEST PRIORITY:

- Preserve the exact facial structure and proportions.
- Preserve the exact face shape.
- Preserve both eyes, including their shape, size, spacing, and natural appearance.
- Preserve eyebrows, including their natural shape and position.
- Preserve the exact nose shape, width, bridge, and tip.
- Preserve lips, mouth shape, and natural proportions.
- Preserve cheekbones and cheek structure.
- Preserve jawline and chin shape.
- Preserve forehead and facial proportions.
- Preserve natural skin tone and complexion.
- Preserve distinctive facial characteristics, asymmetries, marks, and unique features.
- Preserve the person's apparent age.
- Preserve the person's natural physical characteristics.

DO NOT:

- create a new face
- redesign the face
- replace the face
- reinterpret the person's identity
- change facial proportions
- make the face more symmetrical
- beautify the face
- make the person look younger or older
- change eye shape
- change nose shape
- change lips
- change jawline
- change skin tone
- apply a generic AI face
- merge the face with another person's face
- invent facial details that are not present in the reference

IDENTITY PRIORITY:

Identity preservation is more important than beautification, stylization, cinematic enhancement, or aesthetic perfection.

If there is any conflict between the requested visual style and the person's real facial identity, ALWAYS prioritize preserving the original person's identity.

The uploaded person's face must remain recognizable as the same person.

=== EDITING INSTRUCTION ===

Only change the visual elements specifically requested by the user's prompt, such as:

clothing,
hairstyle,
body appearance,
pose,
environment,
background,
lighting,
composition,
props,
decorations,
or photographic style.

Do not modify unrelated facial characteristics.

The final result should look like a professionally photographed version of the SAME PERSON, not a different AI-generated person.

=== END IDENTITY PRESERVATION ===`
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
