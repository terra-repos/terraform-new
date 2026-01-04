import {
  streamText,
  generateText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  TextUIPart,
  UIMessagePart,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { uploadImage } from "@/app/actions/uploads/uploadImage";
import { createClient } from "@/lib/supabase/server";

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

// Helper to strip images and base64 from messages sent to Claude
function stripImagesFromMessages(messages: UIMessage[]): UIMessage[] {
  return messages.map((msg) => {
    // Count images in this message
    const imageCount = msg.parts.filter(
      (p) => p.type === "file" && p.mediaType?.startsWith("image/")
    ).length;

    let imageMessageAdded = false;
    const strippedParts = msg.parts
      .map((part): UIMessagePart<any, any> | null => {
        // Replace first file part with a single text placeholder for all images
        if (part.type === "file" && part.mediaType?.startsWith("image/")) {
          if (!imageMessageAdded) {
            imageMessageAdded = true;
            return {
              type: "text",
              text:
                imageCount > 1
                  ? `[${imageCount} images uploaded - all available to generateDesign tool]`
                  : "[Image uploaded - use generateDesign tool to process it]",
            } as TextUIPart;
          }
          // Skip subsequent image parts
          return null;
        }

        // Strip base64 from tool outputs to prevent token limit errors
        if (
          part.type === "tool-generateDesign" &&
          part.state === "output-available"
        ) {
          const output = part.output as any;
          if (output && output.imageBase64) {
            return {
              ...part,
              output: {
                ...output,
                imageBase64: undefined, // Remove base64
              },
            };
          }
        }

        return part;
      })
      .filter((part): part is UIMessagePart<any, any> => part !== null);

    return {
      ...msg,
      parts: strippedParts,
    };
  });
}

// Build a catalog of all images in the conversation with context
function buildImageCatalog(messages: UIMessage[]): {
  catalog: Array<{ id: string; url: string; type: string; context: string }>;
  catalogText: string;
} {
  const catalog: Array<{
    id: string;
    url: string;
    type: string;
    context: string;
  }> = [];
  let imageCounter = 0;

  messages.forEach((msg, msgIndex) => {
    // Get text context from this message
    const textParts = msg.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as any).text)
      .join(" ");

    // Check for user-uploaded files
    if (msg.role === "user") {
      msg.parts.forEach((part) => {
        if (part.type === "file" && part.mediaType?.startsWith("image/")) {
          imageCounter++;
          catalog.push({
            id: `img_${imageCounter}`,
            url: part.url,
            type: "user_upload",
            context: `User uploaded image #${imageCounter} with message: "${textParts.substring(
              0,
              100
            )}"`,
          });
        }
      });
    }

    // Check for generated images in tool outputs (assistant messages)
    if (msg.role === "assistant") {
      msg.parts.forEach((part) => {
        if (
          part.type === "tool-generateDesign" &&
          part.state === "output-available"
        ) {
          const output = part.output as any;
          if (output && output.imageUrl) {
            imageCounter++;
            catalog.push({
              id: `img_${imageCounter}`,
              url: output.imageUrl,
              type: "generated",
              context: `Generated image #${imageCounter}`,
            });
          }
        }
      });
    }
  });

  // Create a text summary for Claude
  const catalogText =
    catalog.length > 0
      ? `\n\nAVAILABLE IMAGES:\n${catalog
          .map((img) => `- ${img.id}: ${img.context}`)
          .join("\n")}`
      : "";

  return { catalog, catalogText };
}

export async function POST(req: Request) {
  const {
    messages,
    imageModel = "gemini",
    catalogItemId,
  }: {
    messages: UIMessage[];
    imageModel?: "gemini" | "gpt";
    catalogItemId?: string;
  } = await req.json();

  // Fetch catalog item context if catalogItemId is provided
  let catalogContext = "";
  if (catalogItemId) {
    const supabase = await createClient();
    const { data: catalogItem } = await supabase
      .from("temp_catalog_items")
      .select("*")
      .eq("id", catalogItemId)
      .single();

    if (catalogItem) {
      catalogContext = `

CATALOG ITEM CONTEXT:
The user is customizing a catalog item with these details:
- Category: ${catalogItem.category || "N/A"}
- Material: ${catalogItem.materials || "N/A"}
- Dimensions: ${catalogItem.dimension || "N/A"}
- Details: ${catalogItem.extra_details || "N/A"}
- Reference Image: ${catalogItem.image_url || "N/A"}

When generating designs, use this as the baseline and apply the user's requested modifications.`;
    }
  }

  // Keep original messages for tool access (via closure)
  const originalMessages = messages;

  // Build image catalog for context
  const { catalog, catalogText } = buildImageCatalog(messages);

  // Strip images to avoid token limit with Claude
  const messagesWithoutImages = stripImagesFromMessages(messages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are an expert product designer assistant. Help users customize and iterate on their product designs.
${catalogContext}

${catalogText}

CRITICAL: When users describe a design they want, ALWAYS use the generateDesign tool immediately.

Image handling:
- If images are available in the catalog above, specify which to use by their IDs
- If NO images are available, still use the tool - it will generate from scratch based on the text description
- Examples:
  * "create a red chair" → use generateDesign with no imageIds (generates from scratch)
  * "make it blue" → use the most recent image
  * "add the logo to the chair" → use both the chair and logo images

ONLY use the generateDesign tool when the user wants to:
- Create a new design/image
- Modify/edit an existing design
- Change colors, materials, add features, etc.

DO NOT use the tool for:
- Questions about the design
- Explanations or clarifications
- General conversation

Keep your text responses brief and conversational (1-2 sentences).`,
    messages: await convertToModelMessages(messagesWithoutImages),
    stopWhen: stepCountIs(3),
    tools: {
      generateDesign: {
        description:
          "Generate or edit a product design image based on a text description. Use this when the user wants to create a new design or modify an existing one.",
        inputSchema: z.object({
          prompt: z
            .string()
            .describe(
              "A detailed description of the design to generate or the edits to make"
            ),
          imageIds: z
            .array(z.string())
            .optional()
            .describe(
              "Array of image IDs to use (e.g., ['img_1', 'img_2']). If not specified, uses most recent images. Use specific IDs when user references earlier images in conversation."
            ),
        }),
        execute: async ({ prompt, imageIds }) => {
          try {
            // Determine which images to use
            let sourceImageUrls: string[] = [];

            if (imageIds && imageIds.length > 0) {
              // Use specified image IDs from catalog
              sourceImageUrls = imageIds
                .map((id) => catalog.find((img) => img.id === id)?.url)
                .filter((url): url is string => url !== undefined);
            } else {
              // Fallback: use all images from most recent message
              for (let i = originalMessages.length - 1; i >= 0; i--) {
                const msg = originalMessages[i];
                const urls: string[] = [];

                // Check user uploads
                if (msg.role === "user") {
                  msg.parts.forEach((part) => {
                    if (
                      part.type === "file" &&
                      part.mediaType?.startsWith("image/")
                    ) {
                      urls.push(part.url);
                    }
                  });
                }

                // Check generated images
                if (msg.role === "assistant") {
                  msg.parts.forEach((part) => {
                    if (
                      part.type === "tool-generateDesign" &&
                      part.state === "output-available"
                    ) {
                      const output = part.output as any;
                      if (output?.imageUrl) {
                        urls.push(output.imageUrl);
                      }
                    }
                  });
                }

                if (urls.length > 0) {
                  sourceImageUrls = urls;
                  break;
                }
              }
            }

            // Add consistent formatting instructions to the prompt
            const formattedPrompt = `${prompt}

IMPORTANT: The generated image MUST follow this exact format:
- Front view perspective only
- Pure white background (#FFFFFF)
- No shadows, no floor, no environment
- Clean product shot style
- Centered composition`;

            // Select the model based on imageModel parameter
            const selectedModel =
              imageModel === "gpt"
                ? openai("gpt-image-1.5")
                : google("gemini-2.5-flash-image");

            // Generate image using selected model
            const imageResult =
              sourceImageUrls.length > 0
                ? await generateText({
                    model: selectedModel,
                    messages: [
                      {
                        role: "user",
                        content: [
                          {
                            type: "text",
                            text: formattedPrompt,
                          },
                          // Include all images in the content
                          ...sourceImageUrls.map((url) => ({
                            type: "image" as const,
                            image: url,
                          })),
                        ],
                      },
                    ],
                  })
                : await generateText({
                    model: selectedModel,
                    prompt: formattedPrompt,
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

              // Upload to GCS using your existing uploadImage function
              const file = base64ToFile(base64);
              const imageUrl = await uploadImage(file, "generated-designs");

              return {
                success: true,
                imageUrl: imageUrl,
                mediaType: generatedImage.mediaType,
              };
            }

            return {
              success: false,
              error: "No image was generated",
            };
          } catch (error) {
            console.error("Image generation error:", error);
            return {
              success: false,
              error: "Failed to generate image",
            };
          }
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
