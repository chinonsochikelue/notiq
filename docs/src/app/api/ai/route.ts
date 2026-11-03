import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, selectedText, action } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const openai = createOpenAI({ apiKey });
      const systemPrompt =
        "You are an expert writing assistant for Notiq editor. Provide high-quality, clear, and direct improvements or answers. Do not include markdown code fence formatting for text unless explicitly asked.";

      const userMessage = action
        ? `Action: ${action}\nSelected Text:\n${selectedText || prompt}\nInstruction: ${prompt || action}`
        : `${prompt}${selectedText ? `\n\nContext:\n${selectedText}` : ""}`;

      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: systemPrompt,
        prompt: userMessage,
      });

      return result.toDataStreamResponse();
    }

    // Demo fallback streaming response if no API key is configured
    const sampleResponses: Record<string, string> = {
      improve:
        "Notiq provides an unmatched editing experience, combining the fluid responsiveness of modern Lexical with the flexibility of an infinite spatial canvas.",
      grammar:
        "Notiq offers an exceptional editing experience by combining the fluid responsiveness of modern Lexical with the expansive power of an infinite canvas.",
      shorter:
        "Notiq combines modern Lexical performance with infinite canvas freedom for superior content creation.",
      longer:
        "Notiq redefines digital document creation by marrying Meta's high-performance Lexical framework with an expansive, spatial whiteboard canvas. Whether drafting long-form essays or orchestrating multi-column interactive widgets, Notiq delivers effortless fluidity.",
      default:
        `Notiq AI has processed your request: "${prompt || action || 'Improve text'}". Try setting your OPENAI_API_KEY for live GPT-4o intelligence!`,
    };

    const textToStream =
      sampleResponses[action as string] || sampleResponses.default;

    const encoder = new TextEncoder();
    const words = textToStream.split(" ");

    const stream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(`0:${JSON.stringify(word + " ")}\n`));
          await new Promise((r) => setTimeout(r, 40));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-data-stream": "v1",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process AI request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
