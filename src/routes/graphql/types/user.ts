import { GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { UUIDType } from "./uuid.js";
import { Context, ID, NoArgs } from "./common.js";
import { profileType } from "./profile.js";
import { getProfileByUserId } from "../resolvers/profile.resolvers.js";
import { postType } from "./post.js";
import { getPostsByUserId } from "../resolvers/post.resolvers.js";
import { getUserFollowers, getUserSubscriptions } from "../resolvers/user.resolvers.js";

export interface UserInput {
  name: string;
  balance: number;
};

export interface User extends ID, UserInput {};

export const userType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: profileType as GraphQLObjectType,
      resolve: async(source: User, _: NoArgs, context: Context) => await getProfileByUserId(source.id, context),
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async(source: User, _: NoArgs, context: Context) => await getPostsByUserId(source.id, context),
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve :async (source: User, _: NoArgs, context: Context) => await getUserSubscriptions(source.id, context),
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (source: User, _: NoArgs, context: Context) => await getUserFollowers(source.id, context),
    }
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