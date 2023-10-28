import { Context, ID, NoArgs } from "../types/common.js";
import { ProfileInput } from "../types/profile.js";
import { MemberTypeId } from "../../member-types/schemas.js";


const getProfile = async ({ id }: ID, { prisma }: Context) => {
  const profile = await prisma.profile.findUnique({ where: { id } });
  return profile;
};

const getProfiles = async (_: NoArgs, { prisma }: Context) => {
  const profiles = await prisma.profile.findMany();
  return profiles;
}

const createProfile = async ({ dto: data}: { dto: ProfileInput }, { prisma }: Context) => {
  try {
    const profile = await prisma.profile.create({ data });
    return profile;
  } catch {
    return null;
  }
};

const changeProfile = async ({ id, dto: data}: ID & { dto: Partial<ProfileInput> }, { prisma }: Context) => {
  try {
    const profile = await prisma.profile.update({
      where: { id },
      data
    });
    return profile;
  } catch {
    return null;
  }
};

const deleteProfile = async ({ id }: ID, { prisma }: Context) => {
  try {
    await prisma.profile.delete({ where: { id } });
    return id;
  } catch {
    return null;
  }
};

export default {
  profile: getProfile,
  profiles: getProfiles,
  createProfile,
  changeProfile,
  deleteProfile,
};

export const getProfileByUserId = async (userId: string, { prisma }: Context) => {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });
  return profile;
};

export const getProfilesByMemberTypeId = async (memberTypeId: MemberTypeId, { prisma }: Context) => {
  const profiles = await prisma.profile.findMany({ where: { memberTypeId } });
  return profiles;
}