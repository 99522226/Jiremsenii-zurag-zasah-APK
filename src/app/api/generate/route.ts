import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

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

// Эх зургийн харьцааг хадгалж,
// 1024x1024 хэмжээний дотор багтаана.
// Хүнийг сунгаж эсвэл шахахгүй.
const processedImageBuffer = await sharp(imageArrayBuffer)
  .rotate()
  .resize({
    width: 1024,
    height: 1024,
    fit: "contain",
    background: {
      r: 255,
      g: 255,
      b: 255,
      alpha: 1,
    },
  })
  .jpeg({
    quality: 95,
  })
  .toBuffer();
const imageBlob = new Blob(
  [new Uint8Array(processedImageBuffer)],
  {
    type: "image/jpeg",
  }
);

    const openaiForm = new FormData();

    openaiForm.append("model", "gpt-image-2");

   openaiForm.append("image", imageBlob, "input.jpg");

openaiForm.append(
  "prompt",
  `${prompt}

=== IDENTITY & PERSON PRESERVATION — HIGHEST PRIORITY ===

Use the uploaded photograph as the primary and authoritative reference for the person.

The final image must depict the SAME REAL PERSON shown in the uploaded photograph.

Preserve the person's identity with maximum fidelity.

FACE PRESERVATION:
- Keep the exact same facial identity.
- Preserve the original face shape and proportions.
- Preserve the eyes, eye shape, eye spacing, eyebrows, nose, lips, mouth, cheeks, jawline, chin, forehead, and overall facial structure.
- Preserve the person's natural skin tone, apparent age, and distinctive facial characteristics.
- Preserve natural facial asymmetry.
- Keep the person's face recognizable as the same real person in the reference photograph.

DO NOT:
- Do not generate a new or different face.
- Do not replace the person's face with a generic AI face.
- Do not beautify or idealize the face.
- Do not make the person younger or older.
- Do not change facial proportions.
- Do not make the face wider, narrower, longer, or shorter.
- Do not change the person's ethnicity or distinctive appearance.
- Do not alter facial identity because of clothing, hairstyle, pose, lighting, background, or environment.

PERSON PRESERVATION:
- Preserve the person's original body proportions.
- Preserve the person's natural physical appearance.
- Preserve the original head-to-body relationship.
- If the reference shows the full body, keep the person fully visible when appropriate.
- Do not unnecessarily change body shape, height, or proportions.

EDITING RULE:
Only modify the elements explicitly requested in the MAIN PROMPT above.

Everything that is NOT explicitly requested to change should remain as close as possible to the uploaded photograph.

The requested transformation must be applied while maintaining the person's identity and natural appearance.

PRIORITY ORDER:
1. Preserve the person's identity.
2. Preserve facial features and proportions.
3. Follow the requested transformation.
4. Preserve natural photographic realism.

The final result should look like a realistic photograph of the SAME PERSON after the requested transformation, not a different person inspired by the reference image.
`
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
