import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { uploadImage } from "@/app/actions/uploads/uploadImage";

export const maxDuration = 60;

// Helper to convert base64 to File for upload
function base64ToFile(
  base64Data: string,
  filename: string = "generated.png"
): File {
  const buffer = Buffer.from(base64Data, "base64");
  const blob = new Blob([buffer], { type: "image/png" });
  return new File([blob], filename, { type: "image/png" });
}

export async function POST(req: Request) {
  const { imageUrl }: { imageUrl: string } = await req.json();

  try {
    const angles = ["front view", "side view", "top view"];
    const generatedImages: string[] = [];

    for (const angle of angles) {
      const prompt = `Generate a ${angle} of this product. Maintain the exact same design, colors, materials, and features.

IMPORTANT: The generated image MUST follow this exact format:
- ${angle} perspective
- Pure white background (#FFFFFF)
- No shadows, no floor, no environment
- Clean product shot style
- Centered composition`;

      const imageResult = await generateText({
        model: google("gemini-2.5-flash-image"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image" as const,
                image: imageUrl,
              },
            ],
          },
        ],
      });

      // Find the generated image in result.files
      const generatedImage = imageResult.files?.find((file) =>
        file.mediaType.startsWith("image/")
      );

      if (generatedImage) {
        // Convert Uint8Array to base64
        const base64 = Buffer.from(generatedImage.uint8Array).toString(
          "base64"
        );

        // Upload to GCS
        const file = base64ToFile(base64);
        const uploadedUrl = await uploadImage(file, "generated-angles");
        generatedImages.push(uploadedUrl);
      }
    }

    return Response.json({ success: true, images: generatedImages });
  } catch (error) {
    console.error("Angle generation error:", error);
    return Response.json({
      success: false,
      error: "Failed to generate angles",
    });
  }
}
