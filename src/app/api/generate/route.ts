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

IDENTITY LOCK — EXTREMELY IMPORTANT:

Use the uploaded photo as the exact identity reference.

The person's face is NOT an element to redesign or regenerate.

Keep the person's original face unchanged and recognizable.

Preserve:
- eyes
- eyebrows
- nose
- lips
- mouth
- cheeks
- jaw
- chin
- face shape
- facial proportions
- skin tone
- distinctive facial features
- natural age
- natural asymmetry

DO NOT beautify, reshape, reconstruct, replace, reinterpret, or regenerate the face.

DO NOT create an AI version of the person.

DO NOT change the person's identity.

ONLY edit the elements requested in the main prompt.

If the requested scene requires a different outfit, pose, background, lighting, environment, or composition, change ONLY those requested elements.

DO NOT change the person's body proportions, body shape, height, weight, or apparent age unless the user's prompt explicitly requests it.

DO NOT make the person shorter, wider, heavier, thinner, older, or younger.

Preserve the person's original head-to-body proportions and overall physical appearance.

Keep the entire person visible whenever the reference photo shows the full body.

DO NOT crop the head, feet, hands, or other visible body parts unless the user's prompt explicitly requests cropping.

The person's face and body proportions must remain consistent with the uploaded reference photo.

The final image must clearly depict the SAME PERSON with the same facial identity and physical proportions.
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
