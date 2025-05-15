'use client';

import { Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GeneratedWork } from "@/services/db";
import { useState } from 'react';
import MarkdownToDocx from '@/components/markdown-to-docx';

interface GeneratedWorkContentProps {
  work: GeneratedWork;
}

export function GeneratedWorkContent({ work }: GeneratedWorkContentProps) {
  const { toast } = useToast();
  const [isLoadingGenerate, setIsLoadingGenerate] = useState<boolean>(false);
  const [isLoadingExpand, setIsLoadingExpand] = useState<boolean>(false);
  const [isLoadingDeepen, setIsLoadingDeepen] = useState<boolean>(false);

  const copyToClipboard = () => {
    if (work.generatedText) {
      navigator.clipboard
        .writeText(work.generatedText)
        .then(() =>
          toast({
            title: 'Copiado!',
            description: 'Texto gerado copiado para a área de transferência.',
            className: 'bg-accent text-accent-foreground',
          })
        )
        .catch(err =>
          toast({
            title: 'Erro',
            description: 'Falha ao copiar texto.',
            variant: 'destructive',
          })
        );
    }
  };

  return (
    <div className="min-h-[400px] sm:ml-1 sm:mr-1 bg-black/60 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-300">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50/10 dark:bg-gray-900/50 border-b border-gray-200/20 dark:border-gray-700/30">
        <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100">
          Texto Acadêmico Gerado
        </h3>
        <div className="flex items-center gap-2">
          <MarkdownToDocx
            markdownContent={work.generatedText}
            fileName={
              work.topic
                ? `DeepPenAI_${work.topic.replace(/[\s:]+/g, '_').replace(/[^\w.-]/g, '')}_${work.citationStyle}_${work.language}`
                : `DeepPenAI_Output_${work.citationStyle}_${work.language}`
            }
            disabled={isLoadingGenerate || isLoadingExpand || isLoadingDeepen}
          />
          <button
            onClick={copyToClipboard}
            title="Copiar texto"
            className="text-gray-300 dark:text-gray-300 hover:bg-gray-200/20 dark:hover:bg-gray-700/50 rounded p-1.5 transition-colors"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-1 sm:p-6 min-h-[300px]">
        <div 
          className="bg-white dark:bg-gray-100 p-2 sm:p-8 rounded shadow-sm overflow-auto max-h-[600px]"
          style={{ 
            backgroundImage: "linear-gradient(to bottom, #f9f9f9 0%, white 100%)",
            border: "1px solid #e0e0e0"
          }}
        >
          <div className="
            mr-1 ml-1 sm:mr-24 sm:ml-24 max-w-none
            text-gray-900 dark:text-gray-800
            font-serif prose prose-lg dark:prose-invert
            prose-headings:font-bold prose-headings:text-back-900 dark:prose-headings:text-blue-800
            prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
            prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
            prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
            prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
            prose-p:my-4 prose-p:leading-relaxed
            prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1
            prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-gray-100
            prose-em:italic
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg"
            style={{ lineHeight: "1.9", textAlign: "justify" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{work.generatedText}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200/20 dark:border-gray-700/30 text-sm text-gray-400 dark:text-gray-400">
        <div>
          Estilo: <span className="font-semibold text-primary-foreground/80 dark:text-primary-foreground/80">{work.citationStyle}</span>
        </div>
        <div>
          Idioma: <span className="font-semibold text-primary-foreground/80 dark:text-primary-foreground/80">{work.language}</span>
        </div>
      </div>
    </div>
  );
} 