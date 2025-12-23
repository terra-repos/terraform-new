import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { UIMessage } from "ai";

export const maxDuration = 10;

export async function POST(req: Request) {
  const body = await req.json();

  let conversationSummary = "";

  if (body.messages) {
    // Build a conversation summary from all messages
    const messages: UIMessage[] = body.messages;
    conversationSummary = messages
      .map((msg) => {
        const role = msg.role === "user" ? "User" : "Assistant";
        const textParts = msg.parts
          .filter((p) => p.type === "text")
          .map((p) => (p as any).text)
          .join(" ");
        return `${role}: ${textParts}`;
      })
      .join("\n");
  } else {
    conversationSummary = `User: ${body.firstMessage}`;
  }

  const result = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt: `Based on this design conversation, generate a very short, concise product title (2-4 words max).

Conversation:
${conversationSummary}

Only return the title, nothing else. No quotes, no punctuation at the end.

Examples:
- "User: Make this chair red" -> "Red Modern Chair"
- "User: Create a futuristic sofa" -> "Futuristic Smart Sofa"
- "User: Design a sleek laptop stand with adjustable height" -> "Adjustable Laptop Stand"`,
  });

  return Response.json({ title: result.text.trim() });
}
