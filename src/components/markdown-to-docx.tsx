'use client';

import React from 'react';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun, // habilita suporte a imagens
} from 'docx';
import MarkdownIt from 'markdown-it';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Use IRunOptions instead of ITextRunOptions (lint fix)
import type { IRunOptions } from 'docx';

interface MarkdownToDocxProps {
  markdownContent: string | null;
  fileName?: string;
  disabled?: boolean;
}

const DEFAULT_FONT = 'Times New Roman';
const DEFAULT_FONT_SIZE = 24; // 12pt * 2 (half-points)
const CODE_FONT = 'Courier New';
const CODE_FONT_SIZE = 22; // 11pt * 2

// 1.5 line spacing in docx is 360 (240 = single, 480 = double)
const LINE_SPACING_1_5 = 360;

// Instância global do markdown-it (sem plugins por enquanto)
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
});

export default function MarkdownToDocx({ markdownContent, fileName = "documento_deeppen_ai", disabled = false }: MarkdownToDocxProps) {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = React.useState(false);

  const gerarDoc = async () => {
    if (!markdownContent) {
      toast({
        title: "Sem Conteúdo",
        description: "Não há texto para converter para DOCX.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      // Corrige listas numeradas em negrito (mesmo fix do marked)
      const corrigido = markdownContent.replace(/^(\d+)\.\s*\*\*(.*?)\*\*/gm, '**$1. $2**');
      // Converte markdown para HTML usando markdown-it
      const html = md.render(corrigido);

      // Parseia HTML para DOM
      const parser = new DOMParser();
      const docHTML = parser.parseFromString(html, 'text/html');
      const docxElements: (Paragraph | Table)[] = [];

      // Helper para parsear elementos inline (bold, italic, etc)
      const parseInlineElements = (node: ChildNode): IRunOptions[] => {
        const runsOptions: IRunOptions[] = [];
        node.childNodes.forEach(childNode => {
          if (childNode.nodeType === Node.TEXT_NODE) {
            runsOptions.push({ text: childNode.textContent || '', font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE });
          } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            const element = childNode as HTMLElement;
            const tagName = element.tagName.toLowerCase();

            if (tagName === 'br') {
              runsOptions.push({ text: '', break: 1, font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE });
            } else if (tagName === 'strong' || tagName === 'b') {
              const childrenAsOptions: IRunOptions[] = parseInlineElements(element);
              runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, bold: true })));
            } else if (tagName === 'em' || tagName === 'i') {
              const childrenAsOptions: IRunOptions[] = parseInlineElements(element);
              runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, italics: true })));
            } else if (tagName === 'u') {
              const childrenAsOptions: IRunOptions[] = parseInlineElements(element);
              runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, underline: {} })));
            } else if (tagName === 'code') {
              const childrenAsOptions: IRunOptions[] = parseInlineElements(element);
              runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, font: CODE_FONT, size: CODE_FONT_SIZE })));
            } else if (tagName === 'span' && element.classList.contains('katex')) {
              // Futuro: aqui vamos converter a fórmula KaTeX em imagem e inserir via ImageRun
              // Por enquanto, insere o LaTeX como texto simples
              runsOptions.push({ text: element.textContent || '', font: CODE_FONT, size: CODE_FONT_SIZE });
            } else {
              // Default: processa filhos recursivamente
              const childrenAsOptions: IRunOptions[] = parseInlineElements(element);
              runsOptions.push(...childrenAsOptions);
            }
          }
        });
        return runsOptions;
      };

      // Helper para parsear uma <table> em docx Table
      const parseTable = (tableEl: HTMLTableElement): Table => {
        const rows: TableRow[] = [];
        const tableRows = Array.from(tableEl.querySelectorAll('tr'));
        tableRows.forEach((tr) => {
          const cells: TableCell[] = [];
          const cellEls = Array.from(tr.children) as HTMLElement[];
          cellEls.forEach((cellEl) => {
            const cellRuns = parseInlineElements(cellEl);
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: cellRuns.map(opt => new TextRun(opt)),
                    alignment: AlignmentType.LEFT,
                    spacing: { line: LINE_SPACING_1_5 },
                  }),
                ],
                verticalAlign: "center",
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                width: { size: 5000, type: WidthType.DXA },
              })
            );
          });
          rows.push(new TableRow({ children: cells }));
        });

        return new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          },
        });
      };

      // Main block-level parsing
      const fetchImageAsBuffer = async (url: string): Promise<ArrayBuffer | null> => {
        try {
          const response = await fetch(url);
          if (!response.ok) return null;
          return await response.arrayBuffer();
        } catch {
          return null;
        }
      };

      const parseImage = async (imgEl: HTMLImageElement) => {
        const src = imgEl.getAttribute('src');
        const alt = imgEl.getAttribute('alt') || '';
        if (!src) return null;
        const buffer = await fetchImageAsBuffer(src);
        if (!buffer) return null;
        return new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: 400, height: 250 },
              altText: { name: alt || "image", description: alt || "image", title: alt || "image" },
            }),
            ...(alt ? [new TextRun({ text: alt, break: 1, italics: true, size: 20 })] : [])
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        });
      };

      // Atualiza para processar imagens e outros elementos
      for (const node of Array.from(docHTML.body.childNodes)) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        if (tagName === 'img') {
          const imgParagraph = await parseImage(el as HTMLImageElement);
          if (imgParagraph) docxElements.push(imgParagraph);
        } else if (tagName.match(/^h[1-6]$/)) {
          const level = parseInt(tagName.substring(1), 10);
          let headingLevel: "Heading1" | "Heading2" | "Heading3" | "Heading4" | "Heading5" | "Heading6" | "Title";
          switch (level) {
            case 1: headingLevel = "Heading1"; break;
            case 2: headingLevel = "Heading2"; break;
            case 3: headingLevel = "Heading3"; break;
            case 4: headingLevel = "Heading4"; break;
            case 5: headingLevel = "Heading5"; break;
            case 6: headingLevel = "Heading6"; break;
            default: headingLevel = "Heading1";
          }
          const headingOptions = parseInlineElements(el);
          if (headingOptions.length > 0 || el.textContent?.trim()) {
            docxElements.push(new Paragraph({
              children: headingOptions.map(opt => new TextRun(opt)),
              heading: headingLevel,
              alignment: tagName === 'h1' ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { line: LINE_SPACING_1_5, after: 120 },
            }));
          }
        } else if (tagName === 'p') {
          // Se o parágrafo contém apenas uma imagem
          if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.ELEMENT_NODE && (el.childNodes[0] as HTMLElement).tagName.toLowerCase() === 'img') {
            const imgParagraph = await parseImage(el.childNodes[0] as HTMLImageElement);
            if (imgParagraph) docxElements.push(imgParagraph);
          } else {
            const paragraphOptions = parseInlineElements(el);
            if (paragraphOptions.some(opt => (opt.text && opt.text.trim() !== '') || opt.break)) {
              docxElements.push(new Paragraph({
                children: paragraphOptions.map(opt => new TextRun(opt)),
                alignment: AlignmentType.JUSTIFIED,
                spacing: { line: LINE_SPACING_1_5, after: 120 }
              }));
            } else if (el.innerHTML.trim() === '&nbsp;' || el.innerHTML.trim() === '') {
              docxElements.push(new Paragraph({
                children: [new TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE })],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { line: LINE_SPACING_1_5, after: 120 }
              }));
            }
          }
        } else if (tagName === 'ul' || tagName === 'ol') {
          Array.from(el.childNodes).forEach(liNode => {
            if (liNode.nodeType === Node.ELEMENT_NODE && (liNode as HTMLElement).tagName.toLowerCase() === 'li') {
              const listItem = liNode as HTMLElement;
              const listItemOptions = parseInlineElements(listItem);
              if (listItemOptions.length > 0) {
                docxElements.push(new Paragraph({
                  children: listItemOptions.map(opt => new TextRun(opt)),
                  bullet: tagName === 'ul' ? { level: 0 } : undefined,
                  numbering: tagName === 'ol' ? { reference: "default-numbering", level: 0 } : undefined,
                  alignment: AlignmentType.JUSTIFIED,
                  indent: { left: 720 },
                  spacing: { line: LINE_SPACING_1_5, after: 60 }
                }));
              }
            }
          });
        } else if (tagName === 'hr') {
          docxElements.push(new Paragraph({
            children: [new TextRun({ text: "___________________________", font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE })],
            alignment: AlignmentType.CENTER,
            spacing: { line: LINE_SPACING_1_5, before: 240, after: 240 }
          }));
        } else if (tagName === 'table') {
          docxElements.push(parseTable(el as HTMLTableElement));
        }
      }

      const doc = new Document({
        sections: [{ children: docxElements }],
        numbering: {
          config: [
            {
              reference: "default-numbering",
              levels: [
                {
                  level: 0,
                  format: "decimal",
                  text: "%1.",
                  alignment: AlignmentType.LEFT,
                  style: {
                    paragraph: {
                      indent: { left: 720, hanging: 360 },
                    },
                  },
                },
              ],
            },
          ],
        },
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              run: { font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE },
              paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE_SPACING_1_5, after: 120 } }
            },
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: 32, bold: true, font: DEFAULT_FONT },
              paragraph: { alignment: AlignmentType.CENTER, spacing: { line: LINE_SPACING_1_5, before: 240, after: 120 } }
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: 28, bold: true, font: DEFAULT_FONT },
              paragraph: { spacing: { line: LINE_SPACING_1_5, before: 240, after: 120 } }
            },
            {
              id: "Heading3",
              name: "Heading 3",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: DEFAULT_FONT_SIZE, bold: true, font: DEFAULT_FONT },
              paragraph: { spacing: { line: LINE_SPACING_1_5, before: 120, after: 60 } }
            },
            {
              id: "Heading4",
              name: "Heading 4",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: DEFAULT_FONT_SIZE, bold: true, italics: true, font: DEFAULT_FONT },
              paragraph: { spacing: { line: LINE_SPACING_1_5, before: 120, after: 60 } }
            },
            {
              id: "Heading5",
              name: "Heading 5",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: DEFAULT_FONT_SIZE, italics: true, font: DEFAULT_FONT },
              paragraph: { spacing: { line: LINE_SPACING_1_5, before: 120, after: 60 } }
            },
            {
              id: "Heading6",
              name: "Heading 6",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: 22, italics: true, font: DEFAULT_FONT },
              paragraph: { spacing: { line: LINE_SPACING_1_5, before: 120, after: 60 } }
            },
          ],
        },
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "DOCX Gerado",
        description: `${fileName}.docx foi baixado.`,
        variant: "default",
        className: "bg-accent text-accent-foreground",
      });

    } catch (error) {
      console.error("Erro ao gerar DOCX:", error);
      toast({
        title: "Falha na Geração do DOCX",
        description: "Ocorreu um erro ao criar o arquivo DOCX. Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Button
      onClick={gerarDoc}
      disabled={!markdownContent || isConverting || disabled}
      variant="default"
      className="w-full py-3 bg-accent hover:bg-accent/90 text-accent-foreground"
      aria-label="Baixar texto gerado como arquivo DOCX"
    >
      {isConverting ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Download className="mr-2 h-5 w-5" />
      )}
      {isConverting ? "Convertendo..." : "Baixar como DOCX"}
    </Button>
  );
}