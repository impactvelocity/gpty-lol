import { Fragment, type ReactNode } from "react";

/**
 * reddit's markdown as people used it in 2009: paragraphs, *italics*,
 * **bold**, `code`, [links](http://…) and bare links, > quotes, * and 1.
 * lists, and lines indented four spaces for code. One concession to chat: a
 * single line break stays a line break (reddit swallowed them, and everyone
 * complained).
 */

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; text: string }
  | { kind: "hr" }
  | { kind: "head"; text: string };

const LIST = /^\s{0,3}([*+-]|\d{1,3}[.)])\s+(.*)$/;
const CODE = /^( {4}|\t)/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const HEAD = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;

function blocks(text: string): Block[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (HR.test(line)) {
      out.push({ kind: "hr" });
      i++;
      continue;
    }
    const head = HEAD.exec(line);
    if (head) {
      out.push({ kind: "head", text: head[1] });
      i++;
      continue;
    }
    if (CODE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && (CODE.test(lines[i]) || (!lines[i].trim() && CODE.test(lines[i + 1] ?? "")))) {
        body.push(lines[i].replace(CODE, ""));
        i++;
      }
      out.push({ kind: "code", text: body.join("\n") });
      continue;
    }
    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        body.push(QUOTE.exec(lines[i])![1]);
        i++;
      }
      out.push({ kind: "quote", text: body.join("\n") });
      continue;
    }
    const item = LIST.exec(line);
    if (item) {
      const ordered = /\d/.test(item[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = LIST.exec(lines[i]);
        if (m && /\d/.test(m[1]) === ordered) {
          items.push(m[2]);
          i++;
        } else if (lines[i].trim() && !LIST.exec(lines[i]) && !QUOTE.test(lines[i]) && items.length && /^\s+/.test(lines[i])) {
          // An indented continuation of the item above.
          items[items.length - 1] += `\n${lines[i].trim()}`;
          i++;
        } else break;
      }
      out.push({ kind: "list", ordered, items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !QUOTE.test(lines[i]) && !LIST.exec(lines[i]) && !HR.test(lines[i]) && !HEAD.exec(lines[i]) && !(para.length === 0 && CODE.test(lines[i]))) {
      para.push(lines[i].trim());
      i++;
    }
    out.push({ kind: "p", lines: para });
  }
  return out;
}

/* ───────── Inline ───────── */

const INLINE = new RegExp(
  [
    "(`[^`\\n]+`)", // code
    "(\\[[^\\]\\n]+\\]\\((?:https?:\\/\\/|www\\.)[^)\\s]+\\))", // [text](url)
    "(\\*\\*[^*\\n]+?\\*\\*|__[^_\\n]+?__)", // bold
    "(\\*[^*\\s][^*\\n]*?\\*|(?<![A-Za-z0-9])_[^_\\s][^_\\n]*?_(?![A-Za-z0-9]))", // italics
    "((?:https?:\\/\\/|www\\.)[^\\s<>()]+[^\\s<>().,!?;:'\"])", // bare link
  ].join("|"),
  "g",
);

function href(url: string) {
  return url.startsWith("www.") ? `http://${url}` : url;
}

function Link({ url, children }: { url: string; children: ReactNode }) {
  return (
    <a href={href(url)} target="_blank" rel="noreferrer noopener nofollow" title={href(url)}>
      {children}
    </a>
  );
}

export function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}${n++}`;
    const [all, code, link, bold, em, bare] = m;
    if (code) out.push(<code key={k}>{code.slice(1, -1)}</code>);
    else if (link) {
      const [, label, url] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(link)!;
      out.push(
        <Link key={k} url={url}>
          {inline(label, k)}
        </Link>,
      );
    } else if (bold) out.push(<strong key={k}>{inline(bold.slice(2, -2), k)}</strong>);
    else if (em) out.push(<em key={k}>{inline(em.slice(1, -1), k)}</em>);
    else if (bare) out.push(<Link key={k} url={bare}>{bare}</Link>);
    else out.push(all);
    last = at + all.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Inline markdown with single line breaks kept. */
function lines(text: string, key: string) {
  return text.split("\n").map((l, i) => (
    <Fragment key={`${key}l${i}`}>
      {i > 0 && <br />}
      {inline(l, `${key}l${i}`)}
    </Fragment>
  ));
}

function render(b: Block, i: number): ReactNode {
  const k = `b${i}`;
  switch (b.kind) {
    case "p":
      return <p key={k}>{lines(b.lines.join("\n"), k)}</p>;
    case "head":
      return (
        <p key={k}>
          <strong>{inline(b.text, k)}</strong>
        </p>
      );
    case "hr":
      return <hr key={k} />;
    case "code":
      return (
        <pre key={k}>
          <code>{b.text}</code>
        </pre>
      );
    case "quote":
      return <blockquote key={k}>{blocks(b.text).map(render)}</blockquote>;
    case "list": {
      const items = b.items.map((it, j) => <li key={j}>{lines(it, `${k}i${j}`)}</li>);
      return b.ordered ? <ol key={k}>{items}</ol> : <ul key={k}>{items}</ul>;
    }
  }
}

/** A comment or self post body. */
export function Md({ text, className = "" }: { text: string; className?: string }) {
  return <div className={`rd-md ${className}`}>{blocks(text).map(render)}</div>;
}

/** The text with the markup taken out, for one-line previews. */
export function plain(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__|\*|`)/g, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
