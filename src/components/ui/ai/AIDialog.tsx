"use client";

import React, { useState, useEffect } from "react";
import { LexicalEditor } from "lexical";
import { useCompletion } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  FilePlus,
  RotateCcw,
  Settings2,
  Key,
} from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { toast } from "sonner";
import { insertText, getSelectedText } from "../../editor/utils/ai";
import { ExtractData } from "../../editor/utils/extract-data";
import { cn } from "../../../lib/utils";

interface AIDialogProps {
  editor: LexicalEditor;
  onClose: () => void;
  defaultAction?: string;
}

const PROMPT_SUGGESTIONS = [
  { label: "💡 Brainstorm ideas", prompt: "Brainstorm 5 innovative ideas for this project with brief rationales." },
  { label: "📝 Write intro", prompt: "Write an engaging, authoritative introduction outlining the problem and solution." },
  { label: "🗺️ Step-by-step guide", prompt: "Create a step-by-step roadmap with actionable milestones.", action: "Steps" },
  { label: "📊 Comparison table", prompt: "Generate a markdown comparison table analyzing key tradeoffs." },
  { label: "⚡ Summarize draft", prompt: "Summarize the primary takeaways and next steps in crisp bullet points.", action: "Summarize" },
];

export default function AIDialog({ editor, onClose, defaultAction = "default" }: AIDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [action, setAction] = useState<string>(defaultAction);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notiq_ai_provider") || "auto";
    }
    return "auto";
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notiq_ai_api_key") || "";
    }
    return "";
  });

  const { completion, isLoading, complete, setCompletion } = useCompletion({
    api: "/api/ai",
    streamProtocol: "text",
    onError: (err) => {
      toast.error(err.message || "Failed to generate AI response.");
    },
  });

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notiq_ai_provider", selectedProvider);
      localStorage.setItem("notiq_ai_api_key", apiKey);
    }
    setShowSettings(false);
    toast.success("AI preferences saved.");
  };

  const handleGenerate = async (customPrompt?: string, customAction?: string) => {
    const activePrompt = customPrompt !== undefined ? customPrompt : prompt;
    const activeAction = customAction !== undefined ? customAction : action;

    if (!activePrompt.trim() && activeAction === "default") {
      toast.error("Please enter a prompt or instruction.");
      return;
    }

    try {
      const docContext = ExtractData(editor);
      const selectedText = getSelectedText(editor, 40);

      await complete(activePrompt, {
        body: {
          action: activeAction,
          prompt: activePrompt || selectedText,
          context: docContext,
          modelProvider: selectedProvider !== "auto" ? selectedProvider : undefined,
          apiKey: apiKey.trim() || undefined,
        },
      });
    } catch {
      toast.error("Generation encountered an issue.");
    }
  };

  const handleInsert = () => {
    if (!completion) return;
    insertText(completion, editor);
    toast.success("Inserted AI content into document.");
    onClose();
  };

  const handleCopy = () => {
    if (!completion) return;
    navigator.clipboard.writeText(completion).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-[520px] max-h-[80vh] w-full max-w-[620px] bg-background text-foreground select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-none">Notiq AI Assistant</h3>
            <span className="text-[10px] text-muted-foreground">
              {selectedProvider === "auto" ? "Smart Engine (Zero-Config)" : `${selectedProvider.toUpperCase()} Cloud`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground",
            showSettings && "bg-muted text-foreground"
          )}
          title="AI Settings & API Keys"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      {/* Settings Drawer / Panel */}
      {showSettings && (
        <div className="p-3 bg-muted/40 border-b border-border/60 space-y-2.5 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Model & API Key Configuration</span>
            <Button size="sm" variant="ghost" onClick={handleSaveSettings} className="h-6 text-xs px-2">
              Save
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("notiq_ai_provider", e.target.value);
                  }
                }}
                className="w-full h-7 rounded border border-border bg-background px-2 text-xs"
              >
                <option value="auto">Auto (Smart Engine)</option>
                <option value="google">Google Gemini (Gemini 3.8 Flash)</option>
                <option value="openai">OpenAI (GPT-4o mini)</option>
                <option value="groq">Groq (Ultra-Fast - Recommended)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Custom API Key</label>
              <div className="relative">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("notiq_ai_api_key", e.target.value);
                    }
                  }}
                  placeholder="Optional (uses env if empty)"
                  className="h-7 text-xs font-mono pr-6"
                />
                <Key className="h-3 w-3 absolute right-2 top-2 text-muted-foreground/60" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main output area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {completion ? (
          <div className="prose prose-xs dark:prose-invert max-w-none leading-relaxed break-words">
            <ReactMarkdown>{completion}</ReactMarkdown>
          </div>
        ) : isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-6">
            <Loader2 className="h-7 w-7 text-purple-500 animate-spin" />
            <p className="text-xs font-medium text-foreground">Generating response...</p>
            <p className="text-[11px] text-muted-foreground">Streaming content from Notiq AI engine</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3 py-6">
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="font-medium text-foreground text-sm">How can Notiq AI help you?</p>
              <p className="text-[11px] text-muted-foreground">
                Ask a question, generate an outline, expand sections, or pick a quick template below.
              </p>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-md pt-2">
              {PROMPT_SUGGESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setPrompt(item.prompt);
                    if (item.action) setAction(item.action);
                    handleGenerate(item.prompt, item.action || "default");
                  }}
                  className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground transition-all border border-border/50 hover:border-purple-500/40"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input controls */}
      <div className="p-3 border-t border-border/60 bg-muted/20 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI to write, outline, edit, or explain..."
              disabled={isLoading}
              className="h-9 text-xs pr-8"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !prompt.trim()}
            className="h-9 px-3 gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Generate</span>
          </Button>
        </form>

        {/* Footer actions when completion is available */}
        {completion && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="h-7 px-2 text-xs gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Retry</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs gap-1"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 px-2.5 text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleInsert}
                className="h-7 px-3 text-xs gap-1 bg-primary text-primary-foreground"
              >
                <FilePlus className="h-3 w-3" />
                <span>Insert into doc</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}