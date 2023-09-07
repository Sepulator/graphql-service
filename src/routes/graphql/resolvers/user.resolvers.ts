import { UserInput, userType } from '../types/user.js';
import {
  Context,
  ID,
  NoArgs,
  Subscription,
  SubscriptionMutationInput,
} from '../types/common.js';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { GraphQLList, GraphQLResolveInfo } from 'graphql';

export const getUser = async ({ id }: ID, { prisma }: Context) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
};

const getUsers = async (
  _: NoArgs,
  { prisma, userLoader }: Context,
  resolveInfo: GraphQLResolveInfo,
) => {
  const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
  const { fields }: { fields: { [key in string]: ResolveTree } } =
    simplifyParsedResolveInfoFragmentWithType(
      parsedResolveInfoFragment as ResolveTree,
      new GraphQLList(userType),
    );

  const users = await prisma.user.findMany({
    include: {
      userSubscribedTo: !!fields.userSubscribedTo,
      subscribedToUser: !!fields.subscribedToUser,
    },
  });

  users.forEach((user) => {
    userLoader.prime(user.id, user);
  });

  return users;
};

const createUser = async ({ dto: data }: { dto: UserInput }, { prisma }: Context) => {
  const user = await prisma.user.create({ data });
  return user;
};

const changeUser = async (
  { id, dto: data }: ID & { dto: Partial<UserInput> },
  { prisma }: Context,
) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  } catch {
    return null;
  }
};

const deleteUser = async ({ id }: ID, { prisma }: Context) => {
  try {
    await prisma.user.delete({ where: { id } });
    return id;
  } catch {
    return null;
  }
};

const subscribeTo = async (
  { userId: id, authorId }: SubscriptionMutationInput,
  { prisma }: Context,
) => {
  try {
    const user = prisma.user.update({
      where: { id },
      data: { userSubscribedTo: { create: { authorId } } },
    });
    return user;
  } catch {
    return null;
  }
};

const unsubscribeFrom = async (
  { userId: subscriberId, authorId }: SubscriptionMutationInput,
  { prisma }: Context,
) => {
  try {
    await prisma.subscribersOnAuthors.delete({
      where: { subscriberId_authorId: { subscriberId, authorId } },
    });
  } catch {
    return null;
  }
};

export default {
  user: getUser,
  users: getUsers,
  createUser,
  changeUser,
  deleteUser,
  subscribeTo,
  unsubscribeFrom,
};

export const getUserSubscriptions = async (subscriberId: string, { prisma }: Context) => {
  const subscriptions = await prisma.user.findMany({
    where: { subscribedToUser: { some: { subscriberId } } },
  });
  return subscriptions;
};

export const getUserFollowers = async (authorId: string, { prisma }: Context) => {
  const followers = await prisma.user.findMany({
    where: { userSubscribedTo: { some: { authorId } } },
  });
  return followers;
};
