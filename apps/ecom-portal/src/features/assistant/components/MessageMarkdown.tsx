// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { Link } from "@tanstack/react-router";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  a: ({ href = "", children }) =>
    href.startsWith("/app/") ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  img: () => null,
  // Wide tables scroll inside the message instead of stretching the panel.
  table: ({ children }) => (
    <div className="assistant-md__table-wrap">
      <table>{children}</table>
    </div>
  ),
};

export function MessageMarkdown({ text }: { text: string }) {
  return (
    <div className="assistant-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
