import { PrismaClient } from '@prisma/client';
import { DataLoaders } from '../datalodaer.builder.js';

export interface Context extends DataLoaders {
  prisma: PrismaClient;
}
export interface ID {
  id: string;
}

export interface Subscription {
  subscriberId: string;
  authorId: string;
}

export interface SubscriptionMutationInput {
  userId: string;
  authorId: string;
}

export type NoArgs = Record<string | number | symbol, never>;
