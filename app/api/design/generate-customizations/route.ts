import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Build a conversation summary for Claude to analyze
  const conversationSummary = messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      const textParts = msg.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as any).text)
        .join(" ");

      // Check if there are images
      const hasImages = msg.parts.some(
        (p) => p.type === "file" || p.type === "tool-generateDesign"
      );

      return `${role}: ${textParts}${hasImages ? " [included image(s)]" : ""}`;
    })
    .join("\n");

  const result = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt: `You are analyzing a design conversation to extract the final, tangible customizations.

Here is the conversation:
${conversationSummary}

Generate a list of 3-7 specific, actionable specifications about the design's final state.

CRITICAL RULES:
- Only include TANGIBLE, SPECIFIC changes (colors, materials, features, dimensions, additions)
- Do NOT include vague statements like "maintains original design" or "keeps the same structure"
- Only include the LATEST value if something changed multiple times (e.g., blue→green = only mention green)
- Deduplicate redundant requests
- Each specification must describe something CONCRETE and VISIBLE
- Be precise with details (specific colors, materials, features, placements)

GOOD examples:
✓ "The chair is colored in forest green"
✓ "Two USB-C charging ports are installed on the right armrest"
✓ "The upholstery uses premium Italian leather"
✓ "The company logo is embossed on the headrest"

BAD examples:
✗ "The chair maintains its original design"
✗ "The structure remains unchanged"
✗ "It has a modern look"

Return ONLY a JSON array of strings, nothing else. If there are no tangible customizations, return an empty array [].`,
  });

  try {
    const customizations = JSON.parse(result.text);
    return Response.json({ customizations });
  } catch (error) {
    console.error("Failed to parse customizations:", error);
    return Response.json({ customizations: [] });
  }
}
