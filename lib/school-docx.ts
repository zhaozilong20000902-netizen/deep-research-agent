'use client';

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { marked } from 'marked';

const SCHOOL_NAME = '江苏省徐州经贸高等职业学校';
const PAGE_WIDTH_DXA = 11_906;
const PAGE_HEIGHT_DXA = 16_838;
const TABLE_WIDTH_DXA = 9_024;

function plainText(value: string): string {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1 ($2)')
    .trim();
}

function paragraph(text: string, options: { bold?: boolean; center?: boolean; heading?: boolean } = {}) {
  return new Paragraph({
    heading: options.heading ? HeadingLevel.HEADING_2 : undefined,
    alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: options.heading ? 180 : 0, after: options.heading ? 120 : 80, line: 360 },
    children: [
      new TextRun({
        text: plainText(text),
        bold: options.bold || options.heading,
        font: '宋体',
        size: options.heading ? 28 : 24,
      }),
    ],
  });
}

function tableWidths(columnCount: number): number[] {
  if (columnCount === 7) {
    const source = [1242, 1560, 1701, 1077, 1758, 1412, 1461];
    const sourceTotal = source.reduce((sum, width) => sum + width, 0);
    return source.map((width) => Math.round(width / sourceTotal * TABLE_WIDTH_DXA));
  }
  const base = Math.floor(TABLE_WIDTH_DXA / Math.max(1, columnCount));
  return Array.from({ length: columnCount }, (_, index) => (
    index === columnCount - 1 ? TABLE_WIDTH_DXA - base * (columnCount - 1) : base
  ));
}

function cell(text: string, width: number, header: boolean) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: header ? { type: ShadingType.CLEAR, fill: 'E7EFEA', color: 'auto' } : undefined,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: header ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { line: 320, after: 0 },
        children: [new TextRun({ text: plainText(text) || ' ', font: '宋体', size: 22, bold: header })],
      }),
    ],
  });
}

function markdownTable(token: any): Table {
  const headers = (token.header || []).map((item: any) => item.text || item.raw || '');
  const rows = (token.rows || []).map((row: any[]) => row.map((item: any) => item.text || item.raw || ''));
  const columnCount = Math.max(headers.length, ...rows.map((row: string[]) => row.length), 1);
  const widths = tableWidths(columnCount);
  const tableRows = [headers, ...rows].map((row: string[], rowIndex: number) => new TableRow({
    cantSplit: true,
    tableHeader: rowIndex === 0,
    children: Array.from({ length: columnCount }, (_, columnIndex) => cell(row[columnIndex] || '', widths[columnIndex], rowIndex === 0)),
  }));

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: widths,
    rows: tableRows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: '999999' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: '999999' },
    },
  });
}

function reportChildren(markdown: string): Array<Paragraph | Table> {
  const children: Array<Paragraph | Table> = [];
  const tokens = marked.lexer(markdown) as any[];
  for (const token of tokens) {
    if (token.type === 'space' || token.type === 'hr') continue;
    if (token.type === 'heading') {
      const text = plainText(token.text || '');
      children.push(paragraph(text, {
        bold: true,
        center: text.includes(SCHOOL_NAME) || (token.depth === 1 && children.length < 3),
        heading: token.depth >= 2,
      }));
      continue;
    }
    if (token.type === 'table') {
      children.push(markdownTable(token));
      children.push(paragraph(''));
      continue;
    }
    if (token.type === 'list') {
      for (const item of token.items || []) {
        children.push(new Paragraph({
          bullet: token.ordered ? undefined : { level: 0 },
          numbering: token.ordered ? { reference: 'school-numbering', level: 0 } : undefined,
          spacing: { after: 60, line: 360 },
          children: [new TextRun({ text: plainText(item.text || ''), font: '宋体', size: 24 })],
        }));
      }
      continue;
    }
    if (token.type === 'paragraph' || token.type === 'text' || token.type === 'blockquote') {
      children.push(paragraph(token.text || token.raw || ''));
    }
  }
  return children;
}

export async function downloadSchoolLessonPlan(markdown: string, filename: string): Promise<void> {
  const document = new Document({
    creator: SCHOOL_NAME,
    title: filename,
    description: '徐州经贸教学研创智能体生成的课程授课教案',
    styles: {
      default: {
        document: { run: { font: '宋体', size: 24 }, paragraph: { spacing: { line: 360 } } },
      },
      paragraphStyles: [
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: '宋体', size: 28, bold: true, color: '111111' },
          paragraph: { spacing: { before: 180, after: 120 }, keepNext: true },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'school-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 420, hanging: 240 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH_DXA, height: PAGE_HEIGHT_DXA },
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1800, header: 850, footer: 990 },
          },
        },
        children: reportChildren(markdown),
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename.replace(/[\\/:*?"<>|]+/g, '-').trim() || '徐州经贸课程授课教案'}.docx`;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
