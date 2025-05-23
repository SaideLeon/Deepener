import { NextRequest, NextResponse } from 'next/server';
import { rasparTodasPaginasBusca, rasparConteudoPagina } from '@/utils/raspagem';

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.termoBusca) {
    // Buscar links de artigos
    const resultados = await rasparTodasPaginasBusca(body.termoBusca, body.todasPaginas);
    return NextResponse.json(resultados);
  } else if (body.url) {
    // Raspar conteúdo de uma página
    const conteudo = await rasparConteudoPagina(body.url);
    return NextResponse.json(conteudo);
  } else {
    return new NextResponse('Parâmetros inválidos', { status: 400 });
  }
}