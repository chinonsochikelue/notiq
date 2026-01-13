import {
  AIAction,
  autoCompleteInstruction,
  FixSpellingGrammarInstruction,
  improveMesgInstruction,
  MakeLongInstruction,
  MakeShortInstruction,
  SimplifyLanguageInstruction,
  StepsInstruction,
} from "@/hooks/instructions-messages";
import { ExtractedBlock } from "@/components/editor/utils/extract-data";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { CoreMessage, streamText } from "ai";

export const maxDuration = 30;
const MAX_TOKEN = 60000;

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

function flattenBlocks(blocks: ExtractedBlock[]): string {
  return blocks
    .map((block) => {
      let content = block.content;
      if (block.children) {
        content += `\n${flattenBlocks(block.children)}`;
      }
      return content;
    })
    .join("\n\n");
}

async function processContext(rawContext: string): Promise<string> {
  try {
    const blocks: ExtractedBlock[] = JSON.parse(rawContext);
    let processedText = flattenBlocks(blocks);

    if (estimateTokenCount(processedText) > MAX_TOKEN) {
      const importantSections = blocks
        .filter((b) =>
          [
            "heading",
            "Collapsible",
            "Table",
            "text",
            "paragraph",
            "list",
            "quote",
            "code",
            "CollapsibleContent",
            "Collapsible",
            "list-item",
          ].includes(b.blockType)
        )
        .map((b) => b.content + (b.children ? `\n${flattenBlocks(b.children)}` : ""))
        .join("\n\n");

      processedText = `${importantSections}\n\n${blocks
          .filter((b) => !["heading", "quote", "Table", "paragraph"].includes(b.blockType))
          .map((b) => b.content)
          .join("\n")
        }`.slice(0, MAX_TOKEN * 4);
    }

    return processedText;
  } catch (error) {
    console.error("Context processing failed:", error);
    return rawContext.slice(0, MAX_TOKEN * 4);
  }
}

function buildSystemMessage(action: AIAction, context: string): string {
  const baseInstructions: any = {
    autoComplete: autoCompleteInstruction,
    FixSpellingGrammar: FixSpellingGrammarInstruction,
    ImproveWriting: improveMesgInstruction,
    MakeLongInstruction: MakeLongInstruction,
    MakeShortInstruction: MakeShortInstruction,
    SimplifyLanguage: SimplifyLanguageInstruction,
    Steps: StepsInstruction,
    ChatWithSelectedString: `You're an editor assistant. Use all the provided context from the document to answer the user's question directly in concise Markdown format. Answer ONLY the question without including additional suggestions or extra context. If the blog does not contain the necessary data, you may supplement your answer with external information.       
    Context:
    ${context}`,
    GenerateAgain: `Improve the response based on the full content.
    Context:
    ${context}
    Consider: 1. Phrasing  2. Details  3. Alternatives`,
    default: "You are a professional writing assistant",
  };

  return baseInstructions[action] || baseInstructions.default!;
}

export async function POST(req: Request) {
  const { prompt: userQuestion, action, context, modelProvider } = await req.json();
  const processedContext = context ? await processContext(context) : "";
  const systemMessage = buildSystemMessage(action, processedContext);
  const messages: CoreMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: userQuestion },
  ];

  // Model Selection Logic
  let model;
  const provider = modelProvider || process.env.AI_PROVIDER || "openai";

  if (provider === "google") {
    model = google("gemini-2.5-flash"); // Free tier friendly
  } else if (provider === "groq") {
    model = groq("llama-3.1-70b-versatile"); // Fast and usually free/cheap
  } else {
    model = openai("gpt-4o"); // Default
  }

  try {
    const result = streamText({
      model,
      messages,
      temperature: 0.2,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Streaming failed:", error);
    return new Response("Error generating response", { status: 500 });
  }
}
