"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  /** Show only the first ~2 lines worth of content (for feed previews) */
  preview?: boolean;
};

export default function MarkdownRenderer({ content, preview }: Props) {
  const text = preview && content.length > 280 ? content.slice(0, 280) + "…" : content;

  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings → slightly smaller in feed context
          h1: ({ children }) => (
            <strong style={{ fontSize: "1.1em", display: "block", marginBottom: 4 }}>{children}</strong>
          ),
          h2: ({ children }) => (
            <strong style={{ fontSize: "1.05em", display: "block", marginBottom: 4 }}>{children}</strong>
          ),
          h3: ({ children }) => (
            <strong style={{ display: "block", marginBottom: 2 }}>{children}</strong>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p style={{ margin: "0 0 8px 0", lineHeight: "22px" }}>{children}</p>
          ),
          // Inline code
          code: ({ children, className }) => {
            const isBlock = className?.startsWith("language-");
            if (isBlock) {
              return (
                <code
                  style={{
                    display: "block",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontFamily: "monospace",
                    overflowX: "auto",
                    margin: "8px 0",
                    color: "var(--foreground)",
                  }}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  padding: "1px 5px",
                  fontSize: 13,
                  fontFamily: "monospace",
                  color: "var(--accent)",
                }}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: "3px solid var(--accent)",
                paddingLeft: 12,
                margin: "8px 0",
                color: "var(--muted)",
                fontStyle: "italic",
              }}
            >
              {children}
            </blockquote>
          ),
          // Lists
          ul: ({ children }) => (
            <ul style={{ paddingLeft: 20, margin: "6px 0", listStyleType: "disc" }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingLeft: 20, margin: "6px 0", listStyleType: "decimal" }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: 2, lineHeight: "20px" }}>{children}</li>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              {children}
            </a>
          ),
          // Strong / em
          strong: ({ children }) => (
            <strong style={{ fontWeight: 700, color: "var(--foreground)" }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: "italic", color: "var(--foreground)" }}>{children}</em>
          ),
          // Strikethrough (GFM)
          del: ({ children }) => (
            <del style={{ opacity: 0.55 }}>{children}</del>
          ),
          // Horizontal rule
          hr: () => (
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
