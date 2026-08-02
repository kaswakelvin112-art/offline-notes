import type { ReactNode } from 'react';

// Tiny, safe markdown renderer. It turns a small, useful subset of
// markdown into React elements — no innerHTML, no external dependency.
// Supported: headings, paragraphs, bold/italic, inline + fenced code,
// ordered/unordered lists, blockquotes, links and horizontal rules.

type Block =
  | { type: 'code'; lang: string; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'hr' }
  | { type: 'quote'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'p'; text: string };

const INLINE_TOKEN =
  /(`[^`]+`)|(\*\*[^*\n]+\*\*)|(__[^_\n]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]]+\]\([^)]+\))/g;

const BLOCK_START = /^(```|#{1,6}\s|>\s?|[-*+]\s|\d+[.)]\s|---+\s*$|\*\*\*+\s*$)/;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  INLINE_TOKEN.lastIndex = 0;
  while ((match = INLINE_TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em] text-accent">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {renderInline(token.slice(2, -2), key)}
        </strong>
      );
    } else if (token.startsWith('*') || token.startsWith('_')) {
      nodes.push(
        <em key={key} className="italic text-ink">
          {renderInline(token.slice(1, -1), key)}
        </em>
      );
    } else if (token.startsWith('[')) {
      const linkEnd = token.indexOf('](');
      const label = token.slice(1, linkEnd);
      const href = token.slice(linkEnd + 2, -1);
      nodes.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          {renderInline(label, key)}
        </a>
      );
    }
    lastIndex = INLINE_TOKEN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function parseBlocks(source: string): Block[] {
  const lines = source.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      const lang = trimmed.replace(/^```/, '').trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'code', lang, text: code.join('\n') });
      continue;
    }

    if (/^#{1,6}\s/.test(trimmed)) {
      const level = trimmed.match(/^#+/)?.[0].length ?? 1;
      blocks.push({ type: 'heading', level, text: trimmed.replace(/^#+\s*/, '') });
      i++;
      continue;
    }

    if (/^(---+|\*\*\*+)\s*$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', lines: quote });
      continue;
    }

    if (/^[-*+]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (trimmed === '') {
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !BLOCK_START.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'p', text: para.join(' ').trim() });
  }

  return blocks;
}

function BlockView({ block, index }: { block: Block; index: number }) {
  switch (block.type) {
    case 'code':
      return (
        <pre
          key={index}
          className="overflow-x-auto rounded-lg border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-ink"
        >
          {block.text}
        </pre>
      );
    case 'heading': {
      const Tag = `h${Math.min(block.level, 4)}` as 'h1' | 'h2' | 'h3' | 'h4';
      return (
        <Tag
          key={index}
          className={
            block.level === 1
              ? 'mt-2 text-xl font-bold text-ink'
              : block.level === 2
                ? 'mt-2 text-lg font-semibold text-ink'
                : 'mt-1.5 text-base font-semibold text-ink'
          }
        >
          {renderInline(block.text, `h${index}`)}
        </Tag>
      );
    }
    case 'hr':
      return <hr key={index} className="my-4 border-border" />;
    case 'quote':
      return (
        <blockquote key={index} className="border-l-2 border-accent/50 pl-3 text-ink-dim">
          {block.lines.map((l, j) => (
            <p key={j}>{renderInline(l, `q${index}-${j}`)}</p>
          ))}
        </blockquote>
      );
    case 'ul':
      return (
        <ul key={index} className="list-disc space-y-1 pl-5 text-ink-dim">
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item, `ul${index}-${j}`)}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={index} className="list-decimal space-y-1 pl-5 text-ink-dim">
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item, `ol${index}-${j}`)}</li>
          ))}
        </ol>
      );
    case 'p':
    default:
      return (
        <p key={index} className="leading-relaxed text-ink-dim">
          {renderInline(block.text, `p${index}`)}
        </p>
      );
  }
}

export function MarkdownView({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  if (blocks.length === 0) {
    return <p className="text-ink-faint">Nothing to preview yet.</p>;
  }
  return <div className="space-y-2.5">{blocks.map((block, i) => <BlockView key={i} block={block} index={i} />)}</div>;
}
