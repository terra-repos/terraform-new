import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const maxDuration = 60;

// Input schema for the API
const InputSchema = z.object({
  productId: z.string(),
  prompt: z.string(),
  product: z.object({
    title: z.string().nullable(),
    body_html: z.string().nullable(),
    thumbnail_image: z.string().nullable(),
    options: z.array(
      z.object({
        id: z.string(),
        option_type: z.string(),
        values: z.array(z.string()),
      })
    ),
    variants: z.array(
      z.object({
        id: z.string(),
        title: z.string().nullable(),
        options: z.record(z.string(), z.string()),
        images: z.array(z.string()),
      })
    ),
  }),
});

// Tool schemas
const createVariantsSchema = z.object({
  options: z.array(
    z.object({
      action: z.enum(["create", "update"]),
      id: z.string().optional().describe("Only needed for 'update' action"),
      option_type: z.string().describe("e.g., 'Color', 'Size', 'Material'"),
    })
  ),
  variants: z.array(
    z.object({
      title: z.string().describe("Display name for the variant, e.g., 'Red - Large'"),
      option_values: z
        .record(z.string(), z.string())
        .describe("Map of option type to value, e.g., { Color: 'Red', Size: 'Large' }"),
      generate_image: z.boolean().describe("Whether to generate an image for this variant"),
      image_prompt: z
        .string()
        .optional()
        .describe("Prompt for image generation, e.g., 'Product in red color'"),
    })
  ),
});

const requestInfoSchema = z.object({
  message: z.string().describe("A friendly message explaining what information is needed"),
  missing_fields: z
    .array(z.string())
    .describe("List of specific fields/details that are missing"),
});

const reportErrorSchema = z.object({
  message: z.string().describe("User-friendly error message"),
  reason: z.string().describe("Technical reason for the error"),
});

export type CreateVariantsInput = z.infer<typeof createVariantsSchema>;
export type RequestInfoInput = z.infer<typeof requestInfoSchema>;
export type ReportErrorInput = z.infer<typeof reportErrorSchema>;

export type AIVariantsResponse =
  | { type: "createVariants"; data: CreateVariantsInput }
  | { type: "requestInfo"; data: RequestInfoInput }
  | { type: "reportError"; data: ReportErrorInput };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = InputSchema.parse(body);

    // Build context about existing product
    const existingOptionsContext =
      input.product.options.length > 0
        ? `Existing options:\n${input.product.options
            .map((o) => `- ${o.option_type}: [${o.values.join(", ")}]`)
            .join("\n")}`
        : "No existing options defined.";

    const existingVariantsContext =
      input.product.variants.length > 0
        ? `Existing variants (${input.product.variants.length}):\n${input.product.variants
            .map((v) => {
              const optionStr = Object.entries(v.options)
                .map(([k, val]) => `${k}: ${val}`)
                .join(", ");
              return `- ${v.title || "Untitled"} (${optionStr || "no options"})`;
            })
            .join("\n")}`
        : "No existing variants.";

    const systemPrompt = `You are a product variant creation assistant. Your job is to help users create new variants for their products.

PRODUCT CONTEXT:
- Product: ${input.product.title || "Untitled Product"}
- Description: ${input.product.body_html || "No description"}
- Has product image: ${input.product.thumbnail_image ? "Yes" : "No"}

${existingOptionsContext}

${existingVariantsContext}

YOUR TASK:
Analyze the user's request and either:
1. Return structured operations to create new variants (use createVariants tool)
2. Ask for more information if the request is unclear (use requestInfo tool)
3. Report an error if the request is invalid (use reportError tool)

RULES:
- You can ONLY create NEW variants, not edit existing ones
- If the user wants an option type that doesn't exist, include it in the options array with action: "create"
- If the user mentions an existing option type, include it with action: "update" and provide its id
- Each variant needs a clear title and option_values mapping
- Set generate_image to true if the user wants images for variants, and provide an image_prompt
- For color variants, the image_prompt should describe how to modify the existing product image
- Be helpful and ask clarifying questions if needed

EXAMPLES:
- "Add size variants" → Ask which sizes they want
- "Add red, blue, green color variants" → Create Color option (if new) and 3 variants
- "Make it bigger" → Report error (can't edit, only create new)`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: input.prompt,
      tools: {
        createVariants: {
          description:
            "Create new variants with specified options. Use this when you have enough information to create variants.",
          inputSchema: createVariantsSchema,
        },
        requestInfo: {
          description:
            "Request more information from the user. Use this when the request is unclear or missing details.",
          inputSchema: requestInfoSchema,
        },
        reportError: {
          description:
            "Report an error or invalid request. Use this when the request cannot be fulfilled.",
          inputSchema: reportErrorSchema,
        },
      },
      toolChoice: "required",
    });

    // Extract the tool call from the result
    // AI SDK v6 uses 'input' instead of 'args' for tool parameters
    const rawToolCall = result.toolCalls?.[0];

    console.log("Raw tool call:", JSON.stringify(rawToolCall, null, 2));

    if (!rawToolCall) {
      return Response.json(
        {
          type: "reportError",
          data: {
            message: "Failed to process your request",
            reason: "No tool call was made by the AI",
          },
        } satisfies AIVariantsResponse,
        { status: 200 }
      );
    }

    // AI SDK uses 'input' property for tool arguments
    const toolName = rawToolCall.toolName;
    const toolArgs = (rawToolCall as { input?: unknown }).input ?? (rawToolCall as { args?: unknown }).args;

    console.log("Tool name:", toolName);
    console.log("Tool args:", JSON.stringify(toolArgs, null, 2));

    let response: AIVariantsResponse;

    if (toolName === "createVariants") {
      response = { type: "createVariants", data: toolArgs as CreateVariantsInput };
    } else if (toolName === "requestInfo") {
      response = { type: "requestInfo", data: toolArgs as RequestInfoInput };
    } else if (toolName === "reportError") {
      response = { type: "reportError", data: toolArgs as ReportErrorInput };
    } else {
      return Response.json(
        {
          type: "reportError",
          data: {
            message: "Unknown tool response",
            reason: `Received unknown tool: ${toolName}`,
          },
        } satisfies AIVariantsResponse,
        { status: 200 }
      );
    }

    return Response.json(response);
  } catch (error) {
    console.error("AI Variants API error:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          type: "reportError",
          data: {
            message: "Invalid request format",
            reason: error.issues.map((e) => e.message).join(", "),
          },
        } satisfies AIVariantsResponse,
        { status: 400 }
      );
    }

    return Response.json(
      {
        type: "reportError",
        data: {
          message: "An unexpected error occurred",
          reason: error instanceof Error ? error.message : "Unknown error",
        },
      } satisfies AIVariantsResponse,
      { status: 500 }
    );
  }
}
