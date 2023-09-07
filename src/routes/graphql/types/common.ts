import { PrismaClient } from '@prisma/client'
import { DataLoaders } from '../datalodaer.builder.js';

export interface Context extends DataLoaders {
  prisma: PrismaClient;
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