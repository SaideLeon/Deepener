import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface User {
  id: string;
  email: string | null;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  async createUser(data: { email: string; name?: string }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });
  },

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  },
};