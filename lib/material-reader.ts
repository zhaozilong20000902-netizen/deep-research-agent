'use client';

export interface ParsedTeachingMaterial {
  name: string;
  kind: 'pdf' | 'docx' | 'pptx' | 'text';
  text: string;
  characters: number;
  truncated: boolean;
}

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TEXT_CHARACTERS = 60_000;

function normalizeText(value: string): string {
  return value
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function finish(name: string, kind: ParsedTeachingMaterial['kind'], rawText: string): ParsedTeachingMaterial {
  const normalized = normalizeText(rawText);
  const truncated = normalized.length > MAX_TEXT_CHARACTERS;
  const text = truncated
    ? `${normalized.slice(0, MAX_TEXT_CHARACTERS)}\n\n[教材内容过长，已在 ${MAX_TEXT_CHARACTERS.toLocaleString('zh-CN')} 字处截断]`
    : normalized;
  return { name, kind, text, characters: text.length, truncated };
}

async function readPdf(file: File): Promise<ParsedTeachingMaterial> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data, useWorkerFetch: false }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean)
      .join(' ');
    if (pageText.trim()) pages.push(`第 ${pageNumber} 页\n${pageText}`);
  }
  if (pages.length === 0) {
    throw new Error('没有提取到文字。该 PDF 可能是扫描件，请先进行 OCR 后再上传。');
  }
  return finish(file.name, 'pdf', pages.join('\n\n'));
}

async function readDocx(file: File): Promise<ParsedTeachingMaterial> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  if (!result.value.trim()) throw new Error('Word 文档中没有可读取的正文。');
  return finish(file.name, 'docx', result.value);
}

async function readPptx(file: File): Promise<ParsedTeachingMaterial> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((a, b) => {
      const aNumber = Number(a.match(/slide(\d+)\.xml/i)?.[1] || 0);
      const bNumber = Number(b.match(/slide(\d+)\.xml/i)?.[1] || 0);
      return aNumber - bNumber;
    });

  const slides: string[] = [];
  for (let index = 0; index < slidePaths.length; index += 1) {
    const xml = await zip.file(slidePaths[index])!.async('string');
    const parsed = new DOMParser().parseFromString(xml, 'application/xml');
    const textNodes = Array.from(parsed.getElementsByTagName('*'))
      .filter((node) => node.localName === 't')
      .map((node) => node.textContent?.trim() || '')
      .filter(Boolean);
    if (textNodes.length > 0) slides.push(`第 ${index + 1} 页\n${textNodes.join('\n')}`);
  }
  if (slides.length === 0) throw new Error('PPT 中没有可读取的文本框内容。');
  return finish(file.name, 'pptx', slides.join('\n\n'));
}

async function readText(file: File): Promise<ParsedTeachingMaterial> {
  const buffer = await file.arrayBuffer();
  let text = new TextDecoder('utf-8').decode(buffer);
  if (text.includes('\uFFFD')) {
    try {
      text = new TextDecoder('gb18030').decode(buffer);
    } catch {}
  }
  return finish(file.name, 'text', text);
}

export async function readTeachingMaterial(file: File): Promise<ParsedTeachingMaterial> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('单个文件不能超过 25 MB。');
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return readPdf(file);
  if (extension === 'docx') return readDocx(file);
  if (extension === 'pptx') return readPptx(file);
  if (extension === 'txt' || extension === 'md') return readText(file);
  if (extension === 'doc' || extension === 'ppt') {
    throw new Error('暂不支持旧版 .doc 或 .ppt，请先另存为 .docx 或 .pptx。');
  }
  throw new Error('仅支持 PDF、DOCX、PPTX、TXT 和 Markdown 文件。');
}

export function combineTeachingMaterials(materials: ParsedTeachingMaterial[]): string {
  return materials
    .map((material) => `===== 文件：${material.name} =====\n${material.text}`)
    .join('\n\n');
}
