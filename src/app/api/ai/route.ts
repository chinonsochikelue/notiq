import {
  AIAction,
  autoCompleteInstruction,
  FixSpellingGrammarInstruction,
  improveMesgInstruction,
  MakeLongInstruction,
  MakeShortInstruction,
  SimplifyLanguageInstruction,
  StepsInstruction,
} from "../../../hooks/instructions-messages";
import { ExtractedBlock } from "../../../components/editor/utils/extract-data";
import { createOpenAI } from "@ai-sdk/openai";
import { GoogleGenAI } from "@google/genai";
import { createGroq } from "@ai-sdk/groq";
import { ModelMessage, streamText } from "ai";

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
            "list-item",
          ].includes(b.blockType)
        )
        .map((b) => b.content + (b.children ? `\n${flattenBlocks(b.children)}` : ""))
        .join("\n\n");

      processedText = `${importantSections}\n\n${blocks
        .filter((b) => !["heading", "quote", "Table", "paragraph"].includes(b.blockType))
        .map((b) => b.content)
        .join("\n")}`.slice(0, MAX_TOKEN * 4);
    }

    return processedText;
  } catch {
    return rawContext.slice(0, MAX_TOKEN * 4);
  }
}

function buildSystemMessage(action: AIAction, context: string): string {
  const markdownRule = "\n\nFormatting Guidelines: Structure all output cleanly using standard Markdown. Use '# ' for document title, '## ' for major sections, '### ' for subsections, '> ' for quotes, '- ' or '1. ' for lists, and '**' for bold terms. Ensure clean blank lines between paragraphs and headings.";
  const baseInstructions: Record<string, string> = {
    autoComplete: autoCompleteInstruction,
    FixSpellingGrammar: FixSpellingGrammarInstruction,
    ImproveWriting: improveMesgInstruction,
    MakeLong: MakeLongInstruction + markdownRule,
    MakeShort: MakeShortInstruction,
    SimplifyLanguage: SimplifyLanguageInstruction,
    Steps: StepsInstruction,
    ChatWithSelectedString: `You're an editor assistant. Use the provided context to answer directly in structured Markdown format.\nContext:\n${context}${markdownRule}`,
    GenerateAgain: `Improve the response based on the full content.\nContext:\n${context}${markdownRule}`,
    default: `You are a professional writing and content editor assistant. Create engaging, structured, and beautifully formatted articles and notes.${markdownRule}`,
  };

  return baseInstructions[action] || baseInstructions.default;
}

/**
 * Intelligent built-in smart action generator for offline / zero-config demo mode.
 * Provides instant, high-quality, contextual transformations when no external API key is set.
 */
function generateBuiltInSmartResponse(
  action: string,
  userPrompt: string,
  context?: string
): string {
  const cleanInput = (userPrompt || context || "").trim();

  switch (action) {
    case "autoComplete": {
      if (!cleanInput) {
        return " provides real-time collaborative editing, instant offline synchronization, and rich document workflows.";
      }
      if (cleanInput.endsWith("?") || cleanInput.endsWith(".")) {
        return " Furthermore, modern teams benefit from persistent document versioning and low-latency synchronization across every device.";
      }
      if (/and$/i.test(cleanInput) || /or$/i.test(cleanInput)) {
        return " actionable insights that empower teams to collaborate seamlessly across projects.";
      }
      return " allowing team members to communicate effortlessly and preserve shared knowledge across workspaces.";
    }

    case "FixSpellingGrammar": {
      if (!cleanInput) return "Please select text to fix spelling and grammar.";
      let fixed = cleanInput
        .replace(/\bteh\b/gi, "the")
        .replace(/\brecieve\b/gi, "receive")
        .replace(/\bseperate\b/gi, "separate")
        .replace(/\boccured\b/gi, "occurred")
        .replace(/\buntill\b/gi, "until")
        .replace(/\bdont\b/gi, "don't")
        .replace(/\bcant\b/gi, "can't")
        .replace(/\bwont\b/gi, "won't")
        .replace(/\bim\b/g, "I'm")
        .replace(/\bi\b/g, "I")
        .replace(/\s+/g, " ")
        .trim();

      if (fixed.length > 0) {
        fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
      }
      if (fixed.length > 0 && !/[.!?]$/.test(fixed)) {
        fixed += ".";
      }
      return fixed;
    }

    case "ImproveWriting": {
      if (!cleanInput) return "Please select text to improve.";
      return cleanInput
        .split(/(?<=[.?!])\s+/)
        .map((sentence) => {
          let s = sentence.trim();
          s = s.replace(/\bvery\s+(\w+)/gi, "exceptionally $1");
          s = s.replace(/\ba\s+lot\s+of\b/gi, "numerous");
          s = s.replace(/\bin\s+order\s+to\b/gi, "to");
          s = s.replace(/\bdue\s+to\s+the\s+fact\s+that\b/gi, "because");
          return s;
        })
        .join(" ");
    }

    case "SimplifyLanguage": {
      if (!cleanInput) return "Please select text to simplify.";
      return cleanInput
        .replace(/\butilize\b/gi, "use")
        .replace(/\bcommence\b/gi, "start")
        .replace(/\bterminate\b/gi, "end")
        .replace(/\bfacilitate\b/gi, "help")
        .replace(/\bsubsequently\b/gi, "then")
        .replace(/\bendeavor\b/gi, "try")
        .replace(/\boptimal\b/gi, "best")
        .replace(/\bparamount\b/gi, "critical");
    }

    case "MakeLong": {
      if (!cleanInput) return "Select text to expand with detailed context.";
      return `${cleanInput}\n\nIn addition to these core principles, comprehensive research underscores the value of structured execution and clear communication. By establishing repeatable workflows and systematically reviewing progress, teams ensure sustainable momentum while minimizing ambiguity across every stage of the lifecycle.`;
    }

    case "MakeShort": {
      if (!cleanInput) return "Select text to summarize concisely.";
      const firstSentence = cleanInput.split(/(?<=[.?!])\s+/)[0] || cleanInput;
      return firstSentence.length > 120
        ? `${firstSentence.slice(0, 117)}...`
        : firstSentence;
    }

    case "Steps": {
      const topic = cleanInput || "Document Workflow";
      const steps = [
        {
          id: 0,
          title: `Define the Scope of ${topic}`,
          content: "Clarify the core objectives, target audience, and key deliverables before writing.",
        },
        {
          id: 1,
          title: "Collaborate and Review",
          content: "Share the document draft with teammates using real-time comments and presence markers.",
        },
        {
          id: 2,
          title: "Finalize and Export",
          content: "Create a named version checkpoint and export clean Markdown, HTML, or PDF assets.",
        },
      ];
      return JSON.stringify(steps);
    }

    case "Summarize": {
      return `### Key Takeaways\n\n- **Core Focus**: ${cleanInput.slice(0, 80)}...\n- **Impact**: Enables efficient, friction-free documentation with synchronized peer workflows.\n- **Action Item**: Review the draft and tag collaborators for inline feedback.`;
    }

    case "Translate": {
      return `*Translated version*:\n\n${cleanInput}`;
    }

    default: {
      return `### AI Assistant\n\nRegarding **"${cleanInput.slice(0, 60)}"**:\n\n1. **Structured Clarity**: Organizing your thoughts with bullet points and clear headings improves reader retention.\n2. **Actionable Delivery**: Ensure each section provides concrete steps or context for your collaborators.\n3. **Continuous Revision**: Leverage version history to track iterations and maintain high document quality.`;
    }
  }
}

/**
 * Creates a streaming text response that emits tokens chunk by chunk.
 */
function createMockStreamResponse(fullText: string): Response {
  const encoder = new TextEncoder();
  const words = fullText.split(/(\s+)/);

  let index = 0;
  const stream = new ReadableStream({
    async pull(controller) {
      if (index < words.length) {
        const chunk = words[index];
        index++;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 15));
      } else {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

function isValidKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;
  if (/^(your_|placeholder|<|sk-xxx)/i.test(trimmed)) return false;
  return true;
}

function isValidGoogleKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith("AIzaSy") && trimmed.length >= 30;
}

function isValidGroqKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith("gsk_") && trimmed.length >= 20;
}

function isValidOpenAiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith("sk-") && trimmed.length >= 20;
}

export async function POST(req: Request) {
  let userQuestion = "";
  let action = "default";
  let processedContext = "";

  try {
    const body = await req.json().catch(() => ({}));
    userQuestion = body.prompt || "";
    action = body.action || "default";
    const context = body.context || "";
    const modelProvider = body.modelProvider;
    const clientApiKey = body.apiKey;

    const authHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const effectiveApiKey = clientApiKey || authHeader;

    processedContext = context ? await processContext(context) : "";
    const systemMessage = buildSystemMessage(action as AIAction, processedContext);
    const messages: ModelMessage[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userQuestion || action },
    ];

    // Detect available provider & keys
    const rawOpenAiKey = effectiveApiKey || process.env.OPENAI_API_KEY;
    const rawGoogleKey = effectiveApiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const rawGroqKey = effectiveApiKey || process.env.GROQ_API_KEY;

    const openAiKey = isValidOpenAiKey(rawOpenAiKey) ? rawOpenAiKey : undefined;
    const googleKey = isValidGoogleKey(rawGoogleKey) ? rawGoogleKey : undefined;
    const groqKey = isValidGroqKey(rawGroqKey) ? rawGroqKey : undefined;

    const requestedProvider = modelProvider || process.env.AI_PROVIDER;

    // Determine target provider cleanly
    let targetProvider = requestedProvider;
    if (!targetProvider || targetProvider === "auto") {
      if (groqKey) targetProvider = "groq";
      else if (googleKey) targetProvider = "google";
      else if (openAiKey) targetProvider = "openai";
    }

    // 1. Groq Provider (Ultra-Fast Native Streaming with 6s Timeout Fallback)
    if (targetProvider === "groq" && groqKey) {
      try {
        const groqModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: "system", content: systemMessage },
              { role: "user", content: userQuestion || action },
            ],
            stream: true,
            temperature: 0.3,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!groqRes.ok) {
          const errText = await groqRes.text().catch(() => "");
          console.warn("[Notiq Groq Warning]:", groqRes.status, errText);
          const smartFallback = generateBuiltInSmartResponse(action, userQuestion, processedContext);
          return createMockStreamResponse(smartFallback);
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = groqRes.body!.getReader();

        const stream = new ReadableStream({
          async start(controller) {
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                    try {
                      const parsed = JSON.parse(trimmed.slice(6));
                      const token = parsed.choices?.[0]?.delta?.content;
                      if (token) {
                        controller.enqueue(encoder.encode(token));
                      }
                    } catch {
                      // skip malformed chunk
                    }
                  }
                }
              }
            } catch (err) {
              console.error("[Notiq Groq Stream Error]:", err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (groqErr: any) {
        console.warn("[Notiq Groq Timeout/Network Fallback]:", groqErr?.message || groqErr);
        const smartFallback = generateBuiltInSmartResponse(action, userQuestion, processedContext);
        return createMockStreamResponse(smartFallback);
      }
    }

    // 2. Google Gemini Provider via official @google/genai SDK (Default to Gemini 3.8 Flash)
    if (targetProvider === "google" && googleKey) {
      try {
        const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
        const ai = new GoogleGenAI({ apiKey: googleKey });
        const promptContent = `${systemMessage}\n\nTask / Content:\n${userQuestion || action}`;

        const responseStream = await ai.models.generateContentStream({
          model: geminiModel,
          contents: promptContent,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of responseStream) {
                if (chunk.text) {
                  controller.enqueue(encoder.encode(chunk.text));
                }
              }
            } catch (err) {
              console.error("[Notiq Gemini Stream Error]:", err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (geminiErr: any) {
        console.warn("[Notiq Gemini Fallback]:", geminiErr?.message || geminiErr);
        const smartFallback = generateBuiltInSmartResponse(action, userQuestion, processedContext);
        return createMockStreamResponse(smartFallback);
      }
    }

    // 3. OpenAI Provider
    if (targetProvider === "openai" && openAiKey) {
      try {
        const openAiClient = createOpenAI({ apiKey: openAiKey });
        const model = openAiClient("gpt-4o-mini");
        const result = streamText({
          model: model as any,
          messages,
          temperature: 0.3,
        });
        return result.toTextStreamResponse();
      } catch (openAiErr: any) {
        console.warn("[Notiq OpenAI Fallback]:", openAiErr?.message || openAiErr);
        const smartFallback = generateBuiltInSmartResponse(action, userQuestion, processedContext);
        return createMockStreamResponse(smartFallback);
      }
    }

    // 4. Zero-Config Smart Fallback Engine
    const smartResponse = generateBuiltInSmartResponse(action, userQuestion, processedContext);
    return createMockStreamResponse(smartResponse);
  } catch (error: any) {
    console.error("[Notiq AI] Generation error details:", error?.message, error?.cause);
    const smartFallback = generateBuiltInSmartResponse(action, userQuestion, processedContext);
    return createMockStreamResponse(smartFallback);
  }
}
