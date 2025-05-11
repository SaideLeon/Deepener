// app/api/generated-work/save/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ success: false, error: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado.' }, { status: 404 })
    }

    const body = await req.json()
    const {
      title,
      topic,
      instructions,
      generatedText,
      language,
      citationStyle,
      sourceType,
      sourceContent,
      paperId,
    } = body

    const result = await prisma.generatedWork.create({
      data: {
        userId: user.id,
        title,
        topic,
        instructions,
        generatedText,
        language,
        citationStyle,
        sourceType,
        sourceContent,
        status: 'draft',
        paperId,
      },
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[SAVE_GENERATED_WORK]', error)
    return NextResponse.json({ success: false, error: 'Erro ao salvar o trabalho' }, { status: 500 })
  }
}
