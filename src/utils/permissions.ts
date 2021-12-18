import { AreaPermission, GlobalPermission } from "../@types/permissions";
import { Area } from "../@types/area";
import { GuildMemberRoleManager } from "discord.js";
import { access } from "./database";
import config from "../config";

export const globalLadder: Record<GlobalPermission, number> = {
  OWNER: 2,
  ACCESS: 1,
  ALL: 0,
};

export const areaLadder: Record<AreaPermission, number> = {
  OWNER: 2,
  ELEVATED: 1,
  ALL: 0,
};

export async function getGlobalPermission(userId: string): Promise<GlobalPermission> {
  return config.DISCORD_OWNER_ID === userId ?
    "OWNER" :
    await access.get(userId) ?
      "ACCESS" :
      "ALL";
}

export async function testGlobalPermission(userId: string, requiredPermission: GlobalPermission): Promise<boolean> {
  const userPermission = await getGlobalPermission(userId);
  return globalLadder[userPermission] >= globalLadder[requiredPermission];
}

export function getAreaPermission(userRoles: string[] | GuildMemberRoleManager, area: Area): AreaPermission {
  const roles = Array.isArray(userRoles) ? userRoles : Array.from(userRoles.cache.keys());
  if (roles.includes(area.roles.owner)) return "OWNER";
  if (roles.includes(area.roles.elevated)) return "ELEVATED";
  return "ALL";
}

export function testAreaPermission(userRoles: string[] | GuildMemberRoleManager, area: Area, requiredPermission: AreaPermission): boolean {
  const userPermission = getAreaPermission(userRoles, area);
  return areaLadder[userPermission] >= areaLadder[requiredPermission];
}
