import { Context, ID, NoArgs } from "../types/common.js";

export const getMemberType = async ({ id }: ID, { prisma }: Context) => {
  const memberType = await prisma.memberType.findUnique({ where: { id } });
  return memberType;
}

const getMemberTypes = async (_: NoArgs, { prisma }: Context) => {
  const memberTypes = await prisma.memberType.findMany();
  return memberTypes;
}

export default {
  memberType: getMemberType,
  memberTypes: getMemberTypes,
}