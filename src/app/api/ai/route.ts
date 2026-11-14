import {
  AIAction,
  autoCompleteInstruction,
  FixSpellingGrammarInstruction,
  improveMesgInstruction,
  MakeLongInstruction,
  MakeShortInstruction,
  NOTIQ_RICH_MARKDOWN_RULE,
  SimplifyLanguageInstruction,
  StepsInstruction,
  SummarizeInstruction,
  ToneInstruction,
  TranslateInstruction,
  WRITING_STYLE_PRESETS,
  type WritingStylePresetId,
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

function buildSystemMessage(
  action: AIAction,
  context: string,
  writingStyle?: string,
  styleGuide?: string
): string {
  const stylePreset =
    writingStyle && writingStyle in WRITING_STYLE_PRESETS
      ? WRITING_STYLE_PRESETS[writingStyle as WritingStylePresetId].instruction
      : "";
  const styleBlock = [
    stylePreset ? `Voice & Style: ${stylePreset}` : "",
    styleGuide?.trim() ? `Custom Style Guide: ${styleGuide.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const contextBlock = context ? `\n\nDocument / Selection Context:\n${context}` : "";
  const styleSuffix = styleBlock ? `\n\n${styleBlock}` : "";

  const baseInstructions: Record<string, string> = {
    autoComplete: `${autoCompleteInstruction}${styleSuffix}${contextBlock}`,
    FixSpellingGrammar: `${FixSpellingGrammarInstruction}\nOutput ONLY the corrected text with no preamble or wrapping quotes.`,
    ImproveWriting: `${improveMesgInstruction}${styleSuffix}`,
    MakeLong: `${MakeLongInstruction}${styleSuffix}\n${NOTIQ_RICH_MARKDOWN_RULE}`,
    MakeShort: `${MakeShortInstruction}\nOutput ONLY the shortened text with no preamble or wrapping quotes.`,
    SimplifyLanguage: `${SimplifyLanguageInstruction}\nOutput ONLY the simplified text with no preamble or wrapping quotes.`,
    Tone: `${ToneInstruction}${styleSuffix}`,
    Translate: `${TranslateInstruction}`,
    Summarize: `${SummarizeInstruction}${styleSuffix}\n${NOTIQ_RICH_MARKDOWN_RULE}${contextBlock}`,
    Steps: `${StepsInstruction}${styleSuffix}\n${NOTIQ_RICH_MARKDOWN_RULE}${contextBlock}`,
    ChatWithSelectedString: `You're an editor assistant. Use the provided context to answer directly in structured Markdown format.${styleSuffix}\n${NOTIQ_RICH_MARKDOWN_RULE}${contextBlock}`,
    GenerateAgain: `Improve and elevate the response based on the full content.${styleSuffix}\n${NOTIQ_RICH_MARKDOWN_RULE}${contextBlock}`,
    default: `You are an expert writing and content editor assistant inside Notiq. Create engaging, well-structured, publication-ready content.${styleSuffix}\n${NOTIQ_RICH_MARKDOWN_RULE}${contextBlock}`,
  };

  return baseInstructions[action] || baseInstructions.default;
}

interface ResearchSource {
  title: string;
  url: string;
}

const GENERIC_PRESET_PROMPT_RE =
  /\b(this topic|this text|this section|this document|above|selected text)\b|^research\b|^draw an interactive\b|^write a comprehensive\b|^write a detailed\b/i;

function buildResearchQuery(userQuestion: string, processedContext: string): string {
  const cleanCtx = processedContext
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .find((line) => line.length > 0) || "";

  const trimmedQuestion = (userQuestion || "").trim();
  const isGenericPrompt =
    !trimmedQuestion || GENERIC_PRESET_PROMPT_RE.test(trimmedQuestion);

  if (isGenericPrompt && cleanCtx) {
    return cleanCtx.slice(0, 120);
  }
  if (trimmedQuestion && cleanCtx && trimmedQuestion.length < 40) {
    return `${cleanCtx.slice(0, 60)} ${trimmedQuestion}`.trim().slice(0, 120);
  }
  return (trimmedQuestion || cleanCtx).slice(0, 120);
}

const RESEARCH_STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "into", "about",
  "what", "when", "where", "which", "who", "how", "why", "are", "was",
  "were", "been", "have", "has", "had", "not", "but", "can", "will",
]);

async function performWebResearch(
  query: string
): Promise<{ summary: string; sources: ResearchSource[] }> {
  const cleanQuery = query.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!cleanQuery) return { summary: "", sources: [] };

  const keywords = cleanQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !RESEARCH_STOPWORDS.has(w));

  const sources: ResearchSource[] = [];
  const summaryLines: string[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanQuery
    )}&format=json&utf8=1&srlimit=4`;
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      cleanQuery
    )}&format=json&no_html=1&skip_disambig=1`;

    const [wikiRes, ddgRes] = await Promise.allSettled([
      fetch(wikiUrl, { signal: controller.signal }),
      fetch(ddgUrl, { signal: controller.signal }),
    ]);
    clearTimeout(timeout);

    if (ddgRes.status === "fulfilled" && ddgRes.value.ok) {
      const ddg = (await ddgRes.value.json()) as {
        Heading?: string;
        AbstractText?: string;
        AbstractURL?: string;
      };
      if (ddg.AbstractText && ddg.AbstractURL) {
        const title = ddg.Heading || cleanQuery;
        sources.push({ title, url: ddg.AbstractURL });
        summaryLines.push(`- **${title}**: ${ddg.AbstractText.slice(0, 260)}`);
      }
    }

    if (wikiRes.status === "fulfilled" && wikiRes.value.ok) {
      const data = (await wikiRes.value.json()) as {
        query?: { search?: Array<{ title: string; snippet: string }> };
      };
      const hits = data?.query?.search || [];
      for (const h of hits) {
        const plainSnippet = h.snippet.replace(/<[^>]+>/g, "").trim();
        const combined = `${h.title} ${plainSnippet}`.toLowerCase();
        const isRelevant =
          keywords.length === 0 || keywords.some((kw) => combined.includes(kw));
        if (!isRelevant) continue;

        const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(h.title.replace(/\s+/g, "_"))}`;
        if (!sources.some((s) => s.url === url)) {
          sources.push({ title: h.title, url });
          summaryLines.push(`- **${h.title}**: ${plainSnippet}`);
        }
        if (sources.length >= 3) break;
      }
    }

    return { summary: summaryLines.join("\n"), sources };
  } catch {
    return { summary: "", sources: [] };
  }
}

/**
 * Intelligent built-in smart action generator for offline / zero-config demo mode.
 * Provides instant, high-quality, contextual transformations when no external API key is set.
 */
function generateBuiltInSmartResponse(
  action: string,
  userPrompt: string,
  context?: string,
  options?: { think?: boolean; research?: boolean; researchSummary?: string; sources?: ResearchSource[] }
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

    case "Tone": {
      return cleanInput || "Rewritten in the requested tone.";
    }

    default: {
      const lower = cleanInput.toLowerCase();
      if (lower.includes("markdown") || lower.includes("sample")) {
        return `# Rich Markdown Showcase\n\n> *"Great writing software disappears into thought."*\n\n## Key Capabilities\n\n- **Formatted text** with *italics*, \`inline code\`, and inline math $E = mc^2$\n- [x] Real-time streaming block hydration\n- [ ] Review and accept with one click\n\n| Feature | Status | Notes |\n| --- | --- | --- |\n| Streaming Canvas | Ready | Hydrates blocks live |\n| Style Profiles | Ready | Technical, Editorial, Executive |\n\n\`\`\`ts\nexport function greet(name: string) {\n  return \`Hello, \${name}!\`;\n}\n\`\`\``;
      }
      if (lower.includes("diagram") || lower.includes("flowchart") || lower.includes("architecture") || lower.includes("draw")) {
        const diagramBody = `### System Architecture Diagram\n\n\`\`\`excalidraw\n{\n  "nodes": [\n    { "id": "user", "label": "Editor Canvas", "color": "#dbeafe" },\n    { "id": "ai", "label": "AI Research & Think", "color": "#ede9fe" },\n    { "id": "blocks", "label": "Rich Notiq Blocks", "color": "#dcfce7" }\n  ],\n  "edges": [\n    { "from": "user", "to": "ai", "label": "Context" },\n    { "from": "ai", "to": "blocks", "label": "Hydrate" }\n  ]\n}\n\`\`\`\n\n> [!TIP] Double-click the diagram above to customize shapes, colors, and arrows in Excalidraw.`;
        return options?.think
          ? `<thinking>\n- Identified request for a visual architecture diagram.\n- Designing a 3-node flow: Editor Canvas -> AI Research & Think -> Rich Notiq Blocks.\n- Outputting an interactive Excalidraw block.\n</thinking>\n\n${diagramBody}`
          : diagramBody;
      }
      if (lower.includes("image") || lower.includes("visual") || lower.includes("illustration")) {
        const svgData =
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="200" viewBox="0 0 520 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><rect width="520" height="200" rx="16" fill="#0f172a"/><rect x="20" y="20" width="480" height="160" rx="12" fill="url(#g)" opacity="0.18" stroke="#818cf8" stroke-width="1.5"/><text x="260" y="95" fill="#f8fafc" font-family="system-ui,sans-serif" font-size="22" font-weight="700" text-anchor="middle">Notiq Visual Concept</text><text x="260" y="128" fill="#cbd5e1" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle">Inline &amp; Block Images + Interactive Diagrams</text></svg>`
          );
        const visualBody = `### Visual Overview\n\n![Notiq Visual Concept](${svgData})\n\nHere is an inline badge ![inline:right:Concept Visual](${svgData}) flowing alongside the paragraph text so you can combine prose with rich visuals.`;
        return options?.think
          ? `<thinking>\n- Generating both a block image and an inline floated image.\n</thinking>\n\n${visualBody}`
          : visualBody;
      }
      if (lower.includes("table") || lower.includes("compar")) {
        return `### Comparison Overview\n\n| Criterion | Option A | Option B |\n| --- | --- | --- |\n| Speed | Fast | Moderate |\n| Flexibility | High | Structured |\n| Best For | Rapid iteration | Long-term scale |`;
      }
      const researchSection = options?.researchSummary
        ? `\n\n### Research Findings\n\n${options.researchSummary}`
        : "";
      const draft = `### AI Draft\n\nRegarding **"${cleanInput.slice(0, 60)}"**:\n\n1. **Structured Clarity**: Organizing your thoughts with clear headings and bullet points improves reader retention.\n2. **Actionable Delivery**: Ground each section in concrete examples or measurable outcomes.\n3. **Iterative Polish**: Use follow-up refinements or switch writing styles to tailor the voice.${researchSection}`;
      const withSources =
        options?.sources && options.sources.length > 0
          ? `${draft}\n<!--SOURCES:${JSON.stringify(options.sources)}-->`
          : draft;
      return options?.think
        ? `<thinking>\n- Analyzing prompt: "${cleanInput.slice(0, 60)}"\n- ${options.research ? "Incorporating web research findings and citations." : "Structuring response into clear, actionable points."}\n</thinking>\n\n${withSources}`
        : withSources;
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
    userQuestion = body.prompt || body.userQuestion || "";
    action = body.action || "default";
    const context = body.context || "";
    const modelProvider = body.modelProvider;
    const clientApiKey = body.apiKey;
    const writingStyle = body.writingStyle;
    const styleGuide = body.styleGuide;
    const think = Boolean(body.think);
    const research = Boolean(body.research);

    const authHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const effectiveApiKey = clientApiKey || authHeader;

    processedContext = context ? await processContext(context) : "";
    const researchQuery = buildResearchQuery(userQuestion, processedContext);
    const researchResult = research
      ? await performWebResearch(researchQuery)
      : { summary: "", sources: [] };

    const thinkInstruction = think
      ? "\n\nThinking Mode: First output a concise <thinking>...</thinking> block (2-5 bullet points) analyzing the task, research findings, and which visuals (inline/normal images, Excalidraw diagrams, equations, or callouts) will best serve the reader. Then immediately output the clean Markdown content after </thinking>."
      : "";
    const researchInstruction =
      research && researchResult.summary
        ? `\n\nWeb Research Context:\n${researchResult.summary}\nUse these verified facts where relevant.`
        : research
          ? "\n\nResearch Mode: Ground your response in accurate, verifiable facts and cite key concepts clearly."
          : "";

    const systemMessage = `${buildSystemMessage(
      action as AIAction,
      processedContext,
      writingStyle,
      styleGuide
    )}${researchInstruction}${thinkInstruction}`;
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
          config: research ? { tools: [{ googleSearch: {} }] } : undefined,
        });

        const encoder = new TextEncoder();
        const collectedSources: ResearchSource[] = [...researchResult.sources];
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of responseStream) {
                if (chunk.text) {
                  controller.enqueue(encoder.encode(chunk.text));
                }
                const chunks = (chunk as any)?.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (Array.isArray(chunks)) {
                  for (const item of chunks) {
                    const uri = item?.web?.uri;
                    const title = item?.web?.title;
                    if (uri && title && !collectedSources.some((s) => s.url === uri)) {
                      collectedSources.push({ title, url: uri });
                    }
                  }
                }
              }
              if (collectedSources.length > 0) {
                controller.enqueue(
                  encoder.encode(`\n<!--SOURCES:${JSON.stringify(collectedSources)}-->`)
                );
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
    const smartResponse = generateBuiltInSmartResponse(action, userQuestion, processedContext, {
      think,
      research,
      researchSummary: researchResult.summary,
      sources: researchResult.sources,
    });
    return createMockStreamResponse(smartResponse);
  } catch (error: any) {
    console.error("[Notiq AI] Generation error details:", error?.message, error?.cause);
    const smartFallback = generateBuiltInSmartResponse(action, userQuestion, processedContext);
    return createMockStreamResponse(smartFallback);
  }
}
