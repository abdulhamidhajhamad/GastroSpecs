import type { ReactNode } from "react";

/** **bold** spans inside a line. */
function inline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part));
}

/**
 * The small part of Markdown the agent writes: paragraphs, "- " lists (indented ones too) and **bold**.
 * `dir="auto"` lets Arabic lines read right-to-left and English ones left-to-right.
 */
export function RichText({ text }: { text: string }) {
  const lines = text.replace(/```\w*\n?/g, "").split("\n");
  return (
    <div className="grid gap-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const item = line.match(/^(\s*)[-•]\s+(.*)$/);
        if (item) {
          return (
            <p key={i} dir="auto" className={`flex gap-2 ${item[1].length >= 2 ? "ps-6" : "ps-1"}`}>
              <span className="text-steel">•</span>
              <span>{inline(item[2])}</span>
            </p>
          );
        }
        return line.trim() ? (
          <p key={i} dir="auto">
            {inline(line)}
          </p>
        ) : (
          <span key={i} className="h-1" />
        );
      })}
    </div>
  );
}
