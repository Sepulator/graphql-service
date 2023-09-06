import { PrismaClient } from '@prisma/client'

export interface Context {
  prisma: PrismaClient
}

export interface ID {
  id: string;
};

export interface Subscription {
  userId: string;
  authorId: string;
};

export interface NoArgs {
  [key: string]: never
};