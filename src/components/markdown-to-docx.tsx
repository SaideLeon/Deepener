
'use client';

import React from 'react';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Indent, Spacing, ITextRunOptions } from 'docx';
import { parse } from 'marked';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarkdownToDocxProps {
  markdownContent: string | null;
  fileName?: string;
  disabled?: boolean;
}

const DEFAULT_FONT = 'Times New Roman';
const DEFAULT_FONT_SIZE = 24; // 12pt * 2 (half-points)
const CODE_FONT = 'Courier New';
const CODE_FONT_SIZE = 22; // 11pt * 2

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
      const corrigido = markdownContent.replace(/^(\d+)\.\s*\*\*(.*?)\*\*/gm, '**$1. $2**');
      const html = parse(corrigido, { gfm: true, breaks: true }) as string;
      const parser = new DOMParser();
      const docHTML = parser.parseFromString(html, 'text/html');
      const docxElements: Paragraph[] = [];

      const parseInlineElements = (node: ChildNode): ITextRunOptions[] => {
        const runsOptions: ITextRunOptions[] = [];
        node.childNodes.forEach(childNode => {
          if (childNode.nodeType === Node.TEXT_NODE) {
            runsOptions.push({ text: childNode.textContent || '', font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE });
          } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            const element = childNode as HTMLElement;
            const tagName = element.tagName.toLowerCase();

            if (tagName === 'br') {
              runsOptions.push({ text: '', break: 1, font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE });
            } else {
              const childrenAsOptions: ITextRunOptions[] = parseInlineElements(element);

              if (tagName === 'strong' || tagName === 'b') {
                runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, bold: true })));
              } else if (tagName === 'em' || tagName === 'i') {
                runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, italics: true })));
              } else if (tagName === 'u') {
                runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, underline: {} })));
              } else if (tagName === 'code') {
                runsOptions.push(...childrenAsOptions.map(opt => ({ ...opt, font: CODE_FONT, size: CODE_FONT_SIZE })));
              } else { 
                runsOptions.push(...childrenAsOptions);
              }
            }
          }
        });
        return runsOptions;
      };

      docHTML.body.childNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        if (tagName.match(/^h[1-6]$/)) {
          const level = parseInt(tagName.substring(1), 10);
          let headingLevel: HeadingLevel;
          switch (level) {
            case 1: headingLevel = HeadingLevel.HEADING_1; break;
            case 2: headingLevel = HeadingLevel.HEADING_2; break;
            case 3: headingLevel = HeadingLevel.HEADING_3; break;
            case 4: headingLevel = HeadingLevel.HEADING_4; break;
            case 5: headingLevel = HeadingLevel.HEADING_5; break;
            case 6: headingLevel = HeadingLevel.HEADING_6; break;
            default: headingLevel = HeadingLevel.HEADING_1;
          }
          const headingOptions = parseInlineElements(el);
          if (headingOptions.length > 0 || el.textContent?.trim()) {
            docxElements.push(new Paragraph({
              children: headingOptions.map(opt => new TextRun(opt)),
              heading: headingLevel,
              alignment: tagName === 'h1' ? AlignmentType.CENTER : AlignmentType.LEFT,
            }));
          }
        } else if (tagName === 'p') {
          const paragraphOptions = parseInlineElements(el);
          if (paragraphOptions.some(opt => (opt.text && opt.text.trim() !== '') || opt.break)) {
             docxElements.push(new Paragraph({
                children: paragraphOptions.map(opt => new TextRun(opt)),
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 120 }
             }));
          } else if (el.innerHTML.trim() === '&nbsp;' || el.innerHTML.trim() === '') { 
            docxElements.push(new Paragraph({
              children: [new TextRun({text: '', font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE})],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 120 }
           }));
          }
        } else if (tagName === 'ul' || tagName === 'ol') {
            Array.from(el.childNodes).forEach(liNode => {
                if (liNode.nodeType === Node.ELEMENT_NODE && (liNode as HTMLElement).tagName.toLowerCase() === 'li') {
                    const listItem = liNode as HTMLElement;
                    const listItemOptions = parseInlineElements(listItem);
                    if(listItemOptions.length > 0) {
                        docxElements.push(new Paragraph({
                            children: listItemOptions.map(opt => new TextRun(opt)),
                            bullet: tagName === 'ul' ? { level: 0 } : undefined,
                            numbering: tagName === 'ol' ? { reference: "default-numbering", level: 0 } : undefined,
                            alignment: AlignmentType.JUSTIFIED,
                            indent: { left: 720 },
                            spacing: { after: 60 }
                        }));
                    }
                }
            });
        } else if (tagName === 'hr') {
            docxElements.push(new Paragraph({ // This is a simple horizontal line, customization might be needed
                children: [new TextRun({text: "___________________________", font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE })], // Simplistic HR
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 240 }
            }));
        }
      });

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
                { id: "Normal", name: "Normal", run: { font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE }, paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }}},
                { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: DEFAULT_FONT }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 }}},
                { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: DEFAULT_FONT }, paragraph: { spacing: { before: 240, after: 120 }}},
                { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: DEFAULT_FONT_SIZE, bold: true, font: DEFAULT_FONT }, paragraph: { spacing: { before: 120, after: 60 }}},
                { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: DEFAULT_FONT_SIZE, bold: true, italics: true, font: DEFAULT_FONT }, paragraph: { spacing: { before: 120, after: 60 }}},
                { id: "Heading5", name: "Heading 5", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: DEFAULT_FONT_SIZE, italics: true, font: DEFAULT_FONT }, paragraph: { spacing: { before: 120, after: 60 }}},
                { id: "Heading6", name: "Heading 6", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, italics: true, font: DEFAULT_FONT }, paragraph: { spacing: { before: 120, after: 60 }}},
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
        variant="default" // Changed to default to use accent color as per theme
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


    