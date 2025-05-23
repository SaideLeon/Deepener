"use client";
import React, { useState } from 'react';
import type { FichaLeitura, ConteudoRaspado } from '../types';

// Função utilitária para chamar a API de fichamento
async function gerarFichaLeitura(conteudo: ConteudoRaspado, promptCustomizado?: string): Promise<FichaLeitura> {
  const response = await fetch('/api/fichamento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conteudo, promptCustomizado })
  });
  if (!response.ok) throw new Error('Erro ao gerar ficha: ' + response.status);
  return await response.json();
}

export default function FichadorComponent() {
  const [termoBusca, setTermoBusca] = useState('');
  const [todasPaginas, setTodasPaginas] = useState(false);
  const [fichas, setFichas] = useState<FichaLeitura[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const adicionarLog = (mensagem: string) => {
    setLog((prev: string[]) => [...prev.slice(-2), mensagem]);
  };

  const iniciarFichamento = async () => {
    setCarregando(true);
    setFichas([]);
    setLog([]);
    setPaginaAtual(0);

    adicionarLog(`🔍 Buscando artigos para: ${termoBusca}`);

    let resultados: { titulo: string; url: string }[] = [];
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termoBusca, todasPaginas })
      });
      if (!response.ok) throw new Error('Erro na resposta da API: ' + response.status);
      resultados = await response.json();
      setTotalResultados(resultados.length);
      adicionarLog(`🔗 ${resultados.length} artigos encontrados`);
    } catch (erro: unknown) {
      if (erro instanceof Error) {
        adicionarLog('❌ Erro ao buscar links: ' + erro.message);
      } else {
        adicionarLog('❌ Erro ao buscar links: ' + String(erro));
      }
      setCarregando(false);
      return;
    }

    const fichasGeradas: FichaLeitura[] = [];
    for (let i = 0; i < resultados.length; i++) {
      const { url } = resultados[i];
      setPaginaAtual(i + 1);
      
      try {
        adicionarLog(`📄 Processando página ${i + 1} de ${resultados.length}: ${url}`);
        
        const conteudoResp = await fetch('/api/scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        if (!conteudoResp.ok) throw new Error('Erro ao raspar conteúdo: ' + conteudoResp.status);
        const conteudo = await conteudoResp.json();
        
        // Chama API para gerar ficha no backend
        const ficha = await gerarFichaLeitura(conteudo);
        fichasGeradas.push(ficha);
        setFichas([...fichasGeradas]); // Atualiza em tempo real

        adicionarLog(`✅ Ficha criada: ${ficha.titulo}`);
      } catch (erro: unknown) {
        adicionarLog(`❌ Erro ao processar página ${i + 1}: ${erro instanceof Error ? erro.message : String(erro)}`);
      }
    }

    adicionarLog(`🎉 Processo finalizado! ${fichasGeradas.length} fichas geradas`);
    setCarregando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto glass rounded-2xl p-6 shadow-2xl space-y-6">
        <h2 className="text-2xl font-bold text-white/90">Gerador de Fichas de Leitura</h2>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Digite o termo de busca"
              className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          
          <label className="flex items-center gap-3 text-white/80">
            <input
              type="checkbox"
              checked={todasPaginas}
              onChange={(e) => setTodasPaginas(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-blue-500"
            />
            <span>Buscar em todas as páginas</span>
          </label>

          <button
            onClick={iniciarFichamento}
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-medium 
                     disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                     disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {carregando ? 'Processando...' : 'Iniciar Fichamento'}
          </button>
        </div>

        {/* Progress Section */}
        {carregando && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-white/80 text-sm mb-2">
              <span>Progresso</span>
              <span>{paginaAtual} de {totalResultados}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 progress-bar-animated"
                style={{
                  width: totalResultados ? `${(paginaAtual / totalResultados) * 100}%` : '0%'
                }}
              />
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/90 font-mono text-sm">
                {log.map((linha, i) => (
                  <div 
                    key={i} 
                    className="transition-all duration-300 animate-fade-in"
                    style={{
                      opacity: 1 - (i * 0.3),
                      transform: `scale(${1 - i * 0.05})`
                    }}
                  >
                    {linha}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="mt-8 space-y-4">
          {fichas.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-white/90">
                Fichas Geradas ({fichas.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {fichas.map((ficha, index) => (
                  <div 
                    key={index} 
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 
                             transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <h4 className="font-medium text-white/90">{ficha.titulo}</h4>
                    <h5 className="font-medium text-white/90">Autor: {ficha.autor}</h5> 
                     <p className="mt-2 text-white/70 text-sm">{ficha.resumo}</p>
                     <h5 className="font-medium text-white/90">{ficha.citacao}</h5>  

                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
