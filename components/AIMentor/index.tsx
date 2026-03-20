"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, RotateCcw, Send, Sparkles, User, Loader2 } from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIMentorProps {
  courseId: string;
  lessonTitle?: string;
  progressPercent?: number;
}

const STARTER_PROMPTS = [
  "Bu darsni tushuntirib bering",
  "Misollar keltiring",
  "Qanday mashq qilaman?",
  "Keyingi dars haqida ma'lumot",
];

function makeGreeting(lessonTitle?: string) {
  return `Salom! Men AI Mentoringizman. ${
    lessonTitle ? `"${lessonTitle}" darsi bo'yicha` : "Kurs bo'yicha"
  } savol va muammolaringizda yordam beraman. Nima so'rashni xohlaysiz?`;
}

export default function AIMentor({
  courseId,
  lessonTitle,
  progressPercent,
}: AIMentorProps) {
  const defaultMessages: Message[] = [
    { role: "assistant", content: makeGreeting(lessonTitle) },
  ];

  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    fetch(`/api/conversation?courseId=${courseId}`)
      .then((r) => r.json())
      .then(({ messages: saved }: { messages?: Message[] }) => {
        if (Array.isArray(saved) && saved.length > 0) {
          setMessages(saved);
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [courseId]);

  // Save conversation after each exchange (debounced via ref)
  const saveConversation = useCallback(
    (msgs: Message[]) => {
      fetch("/api/conversation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, messages: msgs }),
      }).catch(() => {
        // silent - conversation save is best-effort
      });
    },
    [courseId]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      // Add empty assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/mentor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            courseId,
            lessonTitle,
            progressPercent,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          let errorMessage = "AI Mentor so'rovini bajarib bo'lmadi.";
          try {
            const payload = await res.json();
            if (typeof payload?.error === "string") errorMessage = payload.error;
          } catch {
            // optional body
          }
          throw new Error(errorMessage);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.done) break;
              if (parsed.text) {
                fullText += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullText,
                  };
                  return updated;
                });
              }
            } catch {
              // malformed chunks silently skipped
            }
          }
        }

        // Persist the completed exchange
        const finalMessages: Message[] = [
          ...updatedMessages,
          { role: "assistant", content: fullText },
        ];
        saveConversation(finalMessages);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errorMsg =
          err instanceof Error ? err.message : "Xatolik yuz berdi.";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Xatolik: ${errorMsg}`,
          };
          return updated;
        });
      } finally {
        setIsLoading(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [messages, isLoading, courseId, lessonTitle, progressPercent, saveConversation]
  );

  const handleSubmit = (event: { preventDefault(): void }) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    const fresh: Message[] = [
      { role: "assistant", content: makeGreeting(lessonTitle) },
    ];
    setMessages(fresh);
    saveConversation(fresh);
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/40">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            AI Mentor
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            Online
          </span>
          {!historyLoaded && (
            <span className="text-xs text-gray-400">Yuklanmoqda...</span>
          )}
        </div>
        <button
          onClick={handleReset}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title="Suhbatni tozalash"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2.5 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  message.role === "assistant"
                    ? "bg-purple-100 dark:bg-purple-950/40"
                    : "bg-blue-100 dark:bg-blue-950/40"
                }`}
              >
                {message.role === "assistant" ? (
                  <Bot className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  message.role === "assistant"
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    : "bg-blue-600 text-white"
                }`}
              >
                {message.content === "" && message.role === "assistant" ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400" />
                  </div>
                ) : message.role === "assistant" ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  <span className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Starter prompts - shown when only greeting is present */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-purple-800 dark:hover:bg-purple-950/20 dark:hover:text-purple-400"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Savol yozing... (Enter - yuborish)"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-purple-400 focus:bg-white disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
            style={{ maxHeight: "120px" }}
            onInput={(event) => {
              const target = event.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-gray-400">
          Anthropic Claude | Kings Education AI
        </p>
      </div>
    </div>
  );
}

