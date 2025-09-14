import {
  AIAction,
  autoCompleteInstruction,
  FixSpellingGrammarInstruction,
  improveMesgInstruction,
  MakeLongInstruction,
  MakeShortInstruction,
  SimplifyLanguageInstruction,
  StepsInstruction,
} from "@/components/editor/hooks/instructions-messages";
import { ExtractedBlock } from "@/components/editor/utils/extract-data";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { createClient } from "redis";



const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: parseInt(process.env.REDIS_PORT!),
  },
});

client.connect().catch((err) => console.error("Redis connection error:", err));

export const maxDuration = 30;
const MAX_TOKEN = 60000;

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}


function computeHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
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

/**
 * Asynchronously process the raw context JSON string.
 * It checks Redis for a cached version (valid for 30 seconds),
 * and if not found, processes the JSON into flat text, applies smart truncation,
 * stores it in Redis, and returns the processed text.
 */


async function processContext(rawContext: string): Promise<string> {
  const currentHash = computeHash(rawContext);
  const cacheKey = `context:${currentHash}`;

  try {
    const cached = await client.get(cacheKey);    
    if (cached) {
      const cachedData = JSON.parse(cached);
      if (Date.now() - cachedData.timestamp < 30000) {
        console.log("Returning cached context from Redis");
        return cachedData.processedText;
      }
    }
  } catch (error) {
    console.error("Redis error while fetching cache:", error);
  }

  try {
    const blocks: ExtractedBlock[] = JSON.parse(rawContext);
    let processedText = flattenBlocks(blocks);

    // If processed text is too long, preserve important sections and truncate
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

      processedText = `${importantSections}\n\n${
        blocks
          .filter((b) => !["heading", "quote", "Table","paragraph"].includes(b.blockType))
          .map((b) => b.content)
          .join("\n")
      }`.slice(0, MAX_TOKEN * 4);
    }

    // Store in Redis with an expiration of 30 seconds
    const cacheData = JSON.stringify({ processedText, timestamp: Date.now() });
    try {
      await client.set(cacheKey, cacheData, { EX: maxDuration });
    } catch (error) {
      console.error("Redis error while setting cache:", error);
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
  const { prompt: userQuestion, action, context } = await req.json();
  const processedContext = context ? await processContext(context) : "";
  const systemMessage = buildSystemMessage(action, processedContext);
  const messages: CoreMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: userQuestion },
  ];
  try {
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      temperature: 0.2,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Streaming failed:", error);
    return new Response("Error generating response", { status: 500 });
  }

 
}
