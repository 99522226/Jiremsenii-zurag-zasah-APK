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
    const body = await req.json();

    // Олон зураг дэмжинэ
    // Хуучин imageUrl-ийг бас fallback болгож үлдээж байна.
    const imageUrls: string[] =
      Array.isArray(body.imageUrls) && body.imageUrls.length > 0
        ? body.imageUrls
        : body.imageUrl
          ? [body.imageUrl]
          : [];

    const prompt = body.prompt;

    if (imageUrls.length === 0 || !prompt) {
      return NextResponse.json(
        { error: "Зураг болон промпт шаардлагатай" },
        { status: 400 }
      );
    }

    // GPT Image 2 нэг хүсэлтэд олон reference image дэмжинэ.
    // Хэрэглэгч хэт олон зураг оруулсан тохиолдолд эхний 16-г ашиглана.
    const imagesToProcess = imageUrls.slice(0, 16);

    const openaiForm = new FormData();

    openaiForm.append("model", "gpt-image-2");

    // --------------------------------------------------
    // БҮХ ЗУРГИЙГ OpenAI руу reference image болгон явуулна
    // --------------------------------------------------

    for (let i = 0; i < imagesToProcess.length; i++) {
      const imageUrl = imagesToProcess[i];

      const imageRes = await fetch(imageUrl);

      if (!imageRes.ok) {
        return NextResponse.json(
          {
            error: `${i + 1}-р зургийг татахад алдаа гарлаа`,
          },
          { status: 400 }
        );
      }

      const imageArrayBuffer = await imageRes.arrayBuffer();

      // Зургийн харьцааг хадгалж,
      // 1024x1024 дотор багтаана.
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

      // Олон image[] reference
      openaiForm.append(
        "image[]",
        imageBlob,
        `input-${i + 1}.jpg`
      );
    }

    // --------------------------------------------------
    // IDENTITY PROMPT
    // --------------------------------------------------

    openaiForm.append(
      "prompt",
      `${prompt}

=== MULTI-PERSON IDENTITY PRESERVATION — HIGHEST PRIORITY ===

The uploaded images are authoritative identity references for the real people who must appear in the final image.

If multiple reference images are provided, EACH reference image represents a DIFFERENT REAL PERSON.

Preserve the identity of EVERY PERSON shown in the uploaded reference images.

Do not accidentally merge, replace, duplicate, or remove people.

PERSON 1:
Preserve the exact facial identity and natural appearance of the person shown in the first reference image.

PERSON 2:
If a second reference image is provided, preserve the exact facial identity and natural appearance of the person shown in the second reference image.

PERSON 3:
If a third reference image is provided, preserve the exact facial identity and natural appearance of the person shown in the third reference image.

ADDITIONAL PEOPLE:
For every additional reference image, preserve that person's individual identity and appearance.

=== FACE PRESERVATION ===

For EVERY PERSON:

- Keep the exact same real-person identity.
- Preserve the original face shape and proportions.
- Preserve the eyes and eye shape.
- Preserve eye spacing.
- Preserve eyebrows.
- Preserve nose shape and proportions.
- Preserve lips and mouth.
- Preserve cheeks.
- Preserve jawline.
- Preserve chin.
- Preserve forehead.
- Preserve distinctive facial characteristics.
- Preserve natural facial asymmetry.
- Preserve natural skin tone.
- Preserve apparent age.
- Keep each person's face recognizable as the SAME REAL PERSON from their reference image.

=== DO NOT CHANGE IDENTITY ===

Do NOT:

- Generate a new face.
- Replace a person's face with a generic AI face.
- Merge two people's faces together.
- Swap identities between people.
- Make one person look like another person.
- Duplicate one person instead of another.
- Remove a person unless the MAIN PROMPT explicitly requests it.
- Beautify or idealize the faces.
- Make people younger or older.
- Change facial proportions.
- Make faces wider, narrower, longer, or shorter.
- Change ethnicity or distinctive appearance.
- Change facial identity because of clothing, hairstyle, pose, lighting, background, or environment.

=== PERSON PRESERVATION ===

For EVERY PERSON:

- Preserve natural body proportions.
- Preserve natural physical appearance.
- Preserve head-to-body relationship.
- Preserve apparent age.
- Do not unnecessarily change height or body shape.
- Do not unnecessarily alter body proportions.

=== MULTI-PERSON RULE ===

When multiple reference images are provided:

- Treat each image as a separate identity reference.
- Match each person to their corresponding reference image.
- Keep all people visually distinct.
- Do not combine identities.
- Do not invent facial features for any person.
- Do not substitute one reference person's face for another.
- Ensure that every requested person is represented by their correct identity.

If the MAIN PROMPT describes a couple or family photograph, compose the people naturally together while preserving EACH person's individual identity.

=== EDITING RULE ===

Only modify the elements explicitly requested in the MAIN PROMPT.

Everything that is NOT explicitly requested to change should remain as close as possible to the reference images.

The requested transformation must be applied while maintaining the identity and natural appearance of EVERY PERSON.

=== PRIORITY ORDER ===

1. Preserve the identity of EVERY PERSON.
2. Preserve each person's facial features and proportions.
3. Keep each person visually distinct.
4. Follow the requested transformation.
5. Preserve natural photographic realism.

The final result should look like a realistic photograph containing the SAME REAL PEOPLE shown in the uploaded reference images, after the requested transformation.

It must NOT look like different people inspired by the reference images.
`
    );

    openaiForm.append("size", "1024x1024");

    // --------------------------------------------------
    // OPENAI
    // --------------------------------------------------

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

    // --------------------------------------------------
    // AI IMAGE
    // --------------------------------------------------

    const base64Image = openaiData?.data?.[0]?.b64_json;

    if (!base64Image) {
      return NextResponse.json(
        { error: "AI-аас зураг ирсэнгүй" },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // CLOUDINARY
    // --------------------------------------------------

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
