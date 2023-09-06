import { Context, ID, NoArgs } from "../types/common.js";
import { PostInput } from "../types/post.js";

const getPost = async ({ id }: ID, { prisma }: Context) => {
  const post = await prisma.post.findUnique({ where: { id } });
  return post;
};

const getPosts = async (_: NoArgs, { prisma }: Context) => {
  const posts = await prisma.post.findMany();
  return posts;
};

const createPost = async ({ dto: data }: { dto: PostInput }, { prisma }: Context) => {
  const post = await prisma.post.create({ data });
  return post;
};

const changePost = async ({ id, dto: data}: ID & { dto: Partial<PostInput> }, { prisma }: Context) => {
  try {
    const post = await prisma.post.update({
      where: { id },
      data,
    });
    return post;
  } catch {
    return null;
  }
};

const deletePost = async ({ id }: ID, { prisma }: Context) => {
  try {
    await prisma.post.delete({ where: { id } });
    return id;
  } catch {
    return null;
  }
};

export default {
  post: getPost,
  posts: getPosts,
  createPost,
  changePost,
  deletePost,
};

export const getPostsByUserId = async (authorId: string, { prisma }: Context) => {
  const posts = await prisma.post.findMany({ where: { authorId } });
  return posts;
};