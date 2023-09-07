import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { Context, ID, NoArgs, Subscription } from './common.js';
import { profileType } from './profile.js';
import { postType } from './post.js';
export interface UserInput {
  name: string;
  balance: number;
}

export interface User extends ID, UserInput {
  userSubscribedTo?: Subscription[];
  subscribedToUser?: Subscription[];
}

export const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: profileType as GraphQLObjectType,
      resolve: async (source: User, _: NoArgs, { profileByUserIdLoader }: Context) =>
        profileByUserIdLoader.load(source.id),
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (source: User, _: NoArgs, { postsByAuthorIdLoader }: Context) =>
        postsByAuthorIdLoader.load(source.id),
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (source: User, _: NoArgs, { userLoader }: Context) =>
        source.userSubscribedTo
          ? userLoader.loadMany(source.userSubscribedTo.map(({ authorId }) => authorId))
          : null,
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (source: User, _: NoArgs, { userLoader }: Context) =>
        source.subscribedToUser
          ? userLoader.loadMany(
              source.subscribedToUser.map(({ subscriberId }) => subscriberId),
            )
          : null,
    },
  }),
});

export const createUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const changeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
