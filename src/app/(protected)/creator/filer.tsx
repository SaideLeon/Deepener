import type { FichaLeitura, ConteudoRaspado } from '@/types';

// Função utilitária para chamar a API de fichamento
export default async function gerarFichaLeitura(conteudo: ConteudoRaspado, promptCustomizado?: string): Promise<FichaLeitura> {
  const response = await fetch('/api/fichamento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conteudo, promptCustomizado })
  });
  if (!response.ok) throw new Error('Erro ao gerar ficha: ' + response.status);
  return await response.json();
}

