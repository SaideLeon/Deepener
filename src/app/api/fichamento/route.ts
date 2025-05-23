import { NextRequest, NextResponse } from 'next/server';
import { criarFichaLeitura } from '@/tools/ai/fichaAgent';

export async function POST(req: NextRequest) {
  const { conteudo, promptCustomizado } = await req.json();
  if (!conteudo) {
    return new NextResponse('Conteúdo não fornecido', { status: 400 });
  }
  const ficha = await criarFichaLeitura(conteudo, promptCustomizado);
  return NextResponse.json(ficha);
}
