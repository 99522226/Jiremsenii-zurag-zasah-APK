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

    openaiForm.append("model", "gpt-image-1");

   openaiForm.append("image", imageBlob, "input.jpg");

openaiForm.append(
  "prompt",
  `${prompt}

=== IDENTITY PRESERVATION — HIGHEST PRIORITY ===

The uploaded photograph is the primary identity reference.

Generate the requested scene using the SAME PERSON shown in the uploaded photograph.

The person's face must remain as close as possible to the reference photograph.

Preserve the person's:
- exact facial identity
- natural face shape
- facial proportions
- eyes and eye spacing
- eyebrows
- nose
- lips and mouth
- cheeks
- jawline
- chin
- skin tone
- natural age
- distinctive facial characteristics
- natural asymmetry

Do NOT make the person look older.
Do NOT make the person look younger.
Do NOT change the person's facial proportions.
Do NOT make the face wider or narrower.
Do NOT make the face heavier or thinner.
Do NOT beautify or stylize the face.
Do NOT replace the face with a generic AI face.
Do NOT invent a different person.

The person's face is NOT part of the requested transformation.

Only change the elements explicitly requested in the main prompt, such as clothing, hairstyle, pose, background, environment, lighting, decorations, or composition.

Preserve the person's original body proportions, apparent height, and overall physical appearance unless the main prompt explicitly requests otherwise.

If the reference photo shows the full body, keep the entire person visible and preserve the original head-to-body proportions.

The final image must clearly look like the SAME PERSON from the uploaded photograph.
`
);
    openaiForm.append("size", "1024x1024");
    openaiForm.append("input_fidelity", "high");

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
