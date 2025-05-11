import { prisma } from '@/lib/prisma'

export type WorkStatus = 'draft' | 'completed'

export interface Paper {
  id: string
  title: string
  content: string
  status: WorkStatus
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface GeneratedWork {
  id: string
  title: string | null
  topic: string | null
  instructions: string
  generatedText: string
  language: string
  citationStyle: string
  sourceType: string | null
  sourceContent: string | null
  createdAt: Date
  updatedAt: Date
  status: WorkStatus
  metadata: any
  userId: string
  paperId: string | null
}

export const db = {
  // User related operations
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        papers: true,
        activityLogs: true,
      },
    })
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  // Paper related operations
  async createPaper(data: {
    title: string
    content: string
    userId: string
    status?: WorkStatus
  }) {
    return prisma.paper.create({
      data: {
        title: data.title,
        content: data.content,
        userId: data.userId,
        status: data.status || 'draft',
      },
    })
  },

  async getPapersByUserId(userId: string) {
    return prisma.paper.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async updatePaper(id: string, data: {
    title?: string
    content?: string
    status?: WorkStatus
  }) {
    const exists = await prisma.paper.findUnique({ where: { id } })
    if (!exists) throw new Error('Paper not found')

    return prisma.paper.update({
      where: { id },
      data,
    })
  },

  async deletePaper(id: string) {
    return prisma.paper.delete({
      where: { id },
    })
  },

  // GeneratedWork related operations
  async createGeneratedWork(data: Omit<GeneratedWork, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.generatedWork.create({
      data,
    })
  },

  async getGeneratedWorksByUserId(userId: string) {
    return prisma.generatedWork.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async updateGeneratedWork(id: string, data: Partial<Omit<GeneratedWork, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>) {
    return prisma.generatedWork.update({
      where: { id },
      data,
    })
  },

  async deleteGeneratedWork(id: string) {
    return prisma.generatedWork.delete({
      where: { id },
    })
  },

  // Activity log operations
  async createActivityLog(data: {
    action: string
    details: string
    userId: string
  }) {
    return prisma.activityLog.create({
      data: {
        action: data.action,
        details: data.details,
        userId: data.userId,
      },
    })
  },

  async getActivityLogsByUserId(userId: string) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },
}
