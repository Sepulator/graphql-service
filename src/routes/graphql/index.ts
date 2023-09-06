import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  gqlSchema,
} from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import userResolvers from './resolvers/user.resolvers.js';
import postResolvers from './resolvers/post.resolvers.js';
import profileResolvers from './resolvers/profile.resolvers.js';
import memberResolvers from './resolvers/member.resolvers.js';
import depthLimit from 'graphql-depth-limit';

const rootValue = {
  ...userResolvers,
  ...memberResolvers,
  ...postResolvers,
  ...profileResolvers,
};

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req) {
      const { query, variables } = req.body;
      const errors = validate(gqlSchema, parse(query), [depthLimit(5)]);

      if (errors.length > 0) {
        return { errors };
      }

      const response = await graphql({
        schema: gqlSchema,
        source: query,
        rootValue,
        variableValues: variables,
        contextValue: { prisma }
      });

      return response;
    },
  });
};

export default plugin;
