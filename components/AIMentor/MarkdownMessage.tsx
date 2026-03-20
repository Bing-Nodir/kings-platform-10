"use client";

import type { ReactNode } from "react";

// Parse inline formatting: `code`, **bold**, *italic*
function parseInline(text: string, baseKey: string): ReactNode[] {
  const result: ReactNode[] = [];
  const regex = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let i = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const m = match[0];
    if (m.startsWith("`")) {
      result.push(
        <code
          key={`${baseKey}-c${i++}`}
          className="rounded bg-gray-200/80 px-1.5 py-0.5 font-mono text-[11px] dark:bg-gray-700/80"
        >
          {m.slice(1, -1)}
        </code>
      );
    } else if (m.startsWith("**")) {
      result.push(
        <strong key={`${baseKey}-b${i++}`} className="font-semibold">
          {m.slice(2, -2)}
        </strong>
      );
    } else if (m.startsWith("*")) {
      result.push(
        <em key={`${baseKey}-i${i++}`}>{m.slice(1, -1)}</em>
      );
    }

    lastIndex = match.index + m.length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

export function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={key++}
          className="my-2 overflow-x-auto rounded-xl bg-gray-900 p-3 text-[11px] font-mono leading-relaxed text-gray-100"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++; // skip closing ```
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <p key={key++} className="mt-2 font-bold text-gray-900 dark:text-white">
          {parseInline(trimmed.slice(4), `h3-${key}`)}
        </p>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <p key={key++} className="mt-2 font-bold text-gray-900 dark:text-white">
          {parseInline(trimmed.slice(3), `h2-${key}`)}
        </p>
      );
      i++;
      continue;
    }

    // Unordered list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const listItems: ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        const itemText = lines[i].trim().slice(2);
        listItems.push(
          <li key={i}>{parseInline(itemText, `ul-${i}`)}</li>
        );
        i++;
      }
      elements.push(
        <ul
          key={key++}
          className="my-1 ml-4 list-disc space-y-0.5"
        >
          {listItems}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s/, "");
        listItems.push(
          <li key={i}>{parseInline(itemText, `ol-${i}`)}</li>
        );
        i++;
      }
      elements.push(
        <ol key={key++} className="my-1 ml-4 list-decimal space-y-0.5">
          {listItems}
        </ol>
      );
      continue;
    }

    // Empty line
    if (trimmed === "") {
      elements.push(<div key={key++} className="h-1.5" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="leading-relaxed">
        {parseInline(trimmed, `p-${key}`)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5 text-sm">{elements}</div>;
}
