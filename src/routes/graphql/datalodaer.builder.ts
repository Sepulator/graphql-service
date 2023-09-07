import { MemberType, PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';
import { MemberTypeId } from '../member-types/schemas.js';
import { Post } from './types/post.js';
import { User } from './types/user.js';

export interface DataLoaders {
  postsByAuthorIdLoader: DataLoader<string, Post[]>;
  profileByUserIdLoader: DataLoader<string, Profile>;
  profilesByMemberTypeIdLoader: DataLoader<string, Profile[]>;
  memberTypeLoader: DataLoader<MemberTypeId, MemberType>;
  userLoader: DataLoader<string, User>;
}

export const buildDataLoaders = (prisma: PrismaClient): DataLoaders => {
  const batchGetPostsByAuthorId = async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids as string[] } },
    });

    const postMap = posts.reduce(
      (acc, post) => {
        acc[post.authorId]
          ? acc[post.authorId].push(post)
          : (acc[post.authorId] = [post]);
        return acc;
      },
      {} as Record<string, Post[]>,
    );

    return ids.map((id) => postMap[id]);
  };

  const batchGetProfileByUserrId = async (ids: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: ids as string[] } },
    });

    const profileMap = profiles.reduce(
      (acc, profile) => {
        acc[profile.userId] = profile;

        return acc;
      },
      {} as Record<string, Profile>,
    );

    return ids.map((id) => profileMap[id]);
  };

  const batchGetProfilesByMemberTypeId = async (ids: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { memberTypeId: { in: ids as MemberTypeId[] } },
    });

    const profileMap = profiles.reduce(
      (acc, profile) => {
        acc[profile.memberTypeId]
          ? acc[profile.memberTypeId].push(profile)
          : (acc[profile.memberTypeId] = [profile]);

        return acc;
      },
      {} as Record<string, Profile[]>,
    );

    return ids.map((id) => profileMap[id]);
  };

  const batchGetMemberType = async (ids: readonly MemberTypeId[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: ids as MemberTypeId[] } },
    });

    const memberTypeMap = memberTypes.reduce(
      (acc, memberType) => {
        acc[memberType.id] = memberType;
        return acc;
      },
      {} as Record<MemberTypeId, MemberType>,
    );

    return ids.map((id) => memberTypeMap[id]);
  };

  const batchGetUserSubscriptions = async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { subscribedToUser: { some: { subscriberId: { in: ids as string[] } } } },
      include: { subscribedToUser: { select: { subscriberId: true } } },
    });

    const usersMap = users.reduce(
      (acc, { subscribedToUser, ...user }) => {
        subscribedToUser.forEach(({ subscriberId }) => {
          acc[subscriberId] ? acc[subscriberId].push(user) : (acc[subscriberId] = [user]);
        });
        return acc;
      },
      {} as Record<string, User[]>,
    );

    return ids.map((id) => usersMap[id]);
  };

  const batchGetUserFollowers = async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { userSubscribedTo: { some: { authorId: { in: ids as string[] } } } },
      include: { userSubscribedTo: { select: { authorId: true } } },
    });

    const userMap = users.reduce(
      (acc, { userSubscribedTo, ...user }) => {
        userSubscribedTo.forEach(({ authorId }) => {
          acc[authorId] ? acc[authorId].push(user) : (acc[authorId] = [user]);
        });
        return acc;
      },
      {} as Record<string, User[]>,
    );

    return ids.map((id) => userMap[id]);
  };

  return {
    postsByAuthorIdLoader: new DataLoader(batchGetPostsByAuthorId),
    profileByUserIdLoader: new DataLoader(batchGetProfileByUserrId),
    profilesByMemberTypeIdLoader: new DataLoader(batchGetProfilesByMemberTypeId),
    memberTypeLoader: new DataLoader(batchGetMemberType),
    userSubscriptionsLoader: new DataLoader(batchGetUserSubscriptions),
    userFollowersLoader: new DataLoader(batchGetUserFollowers),
  };
};
