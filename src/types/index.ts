// filepath: meu-scraper-next/meu-scraper-next/src/types/index.ts
export interface ConteudoRaspado {
  url: string;
  titulo: string;
  autor: string;
  imagens: { src: string; legenda: string }[];
  conteudo: string;
  citacao?: string;
}

export interface FichaLeitura {
  url: string;
  titulo: string;
  autor: string;
  imagens: { src: string; legenda: string }[];
  resumo: string;
 citacao?: string;
}

export interface FormatarDataOptions {
    day: '2-digit';
    month: 'short';
    year: 'numeric';
}