'use client';

import { marked } from 'marked';

// Markdown is supplied by an LLM or by persisted chat history.  marked escapes
// most text, but it intentionally allows raw HTML, so sanitize the generated
// DOM before it reaches dangerouslySetInnerHTML.
const REMOVED_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'base',
  'meta',
  'link',
  'svg',
  'math',
  'video',
  'audio',
  'source',
  'picture',
  'img',
].join(',');

const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'srcset']);

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('//')) return false;
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return true;

  try {
    const base = typeof window === 'undefined' ? 'https://example.invalid/' : window.location.href;
    const protocol = new URL(trimmed, base).protocol.toLowerCase();
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:';
  } catch {
    return false;
  }
}

/** Render Markdown to HTML while removing executable/raw browser content. */
export function renderSafeMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { gfm: true, breaks: true }) as string;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';

  root.querySelectorAll(REMOVED_TAGS).forEach(node => node.remove());
  root.querySelectorAll<HTMLElement>('*').forEach(element => {
    Array.from(element.attributes).forEach(attribute => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc' || name === 'style' || (URL_ATTRIBUTES.has(name) && !isSafeUrl(attribute.value))) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return root.innerHTML;
}
