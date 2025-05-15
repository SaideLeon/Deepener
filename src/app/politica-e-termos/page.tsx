import fs from 'fs';
import path from 'path';
import React from 'react';
import Markdown from 'react-markdown';
import { ChevronDown } from 'lucide-react';

export default async function PoliticaETermosPage() {
  // Lê o arquivo Markdown com a política e termos
  const filePath = path.join(process.cwd(), 'docs', 'politica-e-termos.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Cabeçalho do documento */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
            Política de Privacidade e Termos de Serviço
          </h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        {/* Cartão principal com sombra suave */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Introdução destacada */}
          <div className="bg-slate-100 dark:bg-slate-700 p-6 border-b border-slate-200 dark:border-slate-600">
            <p className="text-slate-700 dark:text-slate-200 text-lg">
              Este documento estabelece os termos e condições para utilização de nossos serviços,
              bem como nossa política de privacidade e tratamento de dados.
              Leia com atenção antes de utilizar nossos serviços.
            </p>
          </div>
          
          {/* Conteúdo principal */}
          <div className="p-8">
            <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-blue-900 dark:prose-headings:text-blue-300 prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-700 prose-h2:pb-2 prose-h2:mt-8 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300 prose-a:transition-colors prose-a:duration-200 prose-a:no-underline hover:prose-a:underline">
              <Markdown>{fileContent}</Markdown>
            </div>
          </div>
          
          {/* Rodapé do documento */}
          <div className="bg-slate-50 dark:bg-slate-700 p-6 border-t border-slate-200 dark:border-slate-600">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 dark:text-slate-300 text-sm">
                © {new Date().getFullYear()} DeepPenAI. Todos os direitos reservados.
              </p>
              <a href="#topo" className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300">
                Voltar ao topo
                <ChevronDown className="ml-1 h-4 w-4 transform rotate-180" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Informações de contato */}
        <div className="mt-12 text-center text-slate-600 dark:text-slate-400 text-sm">
          <p>Dúvidas sobre nossos termos ou política de privacidade?</p>
          <p className="mt-1">
            <a href="mailto:saideomarsaideleon@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              saideomarsaideleon@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
