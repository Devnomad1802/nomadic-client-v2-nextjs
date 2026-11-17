import { Fragment } from "react";

// ─────────────────────────────────────────────────────────────
// Safe limited-Markdown renderer. Supports **bold**, *italic*,
// "- "/"* " bullets and preserved line breaks / blank lines.
// Builds React nodes directly — NO dangerouslySetInnerHTML, so no
// HTML/script injection is possible; all text is React-escaped.
// ─────────────────────────────────────────────────────────────

function renderInline(text, keyBase) {
  const nodes = [];
  const boldParts = String(text).split(/(\*\*[^*]+\*\*)/g);
  boldParts.forEach((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      nodes.push(<strong key={`${keyBase}-b${i}`}>{part.slice(2, -2)}</strong>);
      return;
    }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    italicParts.forEach((ip, j) => {
      if (/^\*[^*]+\*$/.test(ip)) {
        nodes.push(<em key={`${keyBase}-i${i}-${j}`}>{ip.slice(1, -1)}</em>);
      } else if (ip) {
        nodes.push(<Fragment key={`${keyBase}-t${i}-${j}`}>{ip}</Fragment>);
      }
    });
  });
  return nodes;
}

export default function RichMessage({ text }) {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let bullets = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    const items = bullets;
    const base = blocks.length;
    blocks.push(
      <ul key={`ul-${base}`} className="rm-ul">
        {items.map((b, i) => (
          <li key={i}>{renderInline(b, `li-${base}-${i}`)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line, i) => {
    const m = line.match(/^\s*[-*]\s+(.*)$/);
    if (m) { bullets.push(m[1]); return; }
    flushBullets();
    if (line.trim() === "") {
      blocks.push(<div key={`sp-${i}`} className="rm-sp" aria-hidden />);
    } else {
      blocks.push(
        <p key={`p-${i}`} className="rm-p">{renderInline(line, `p-${i}`)}</p>
      );
    }
  });
  flushBullets();

  return <div className="rm-root">{blocks}</div>;
}
