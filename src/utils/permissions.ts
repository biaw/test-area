import { AreaPermission, GlobalPermission } from "../@types/permissions";
import { Area } from "../@types/area";
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

export function getAreaPermission(userId: string, area: Area): AreaPermission {
  if (userId === area.roles.owner) return "OWNER";
  if (area.roles.elevated.includes(userId)) return "ELEVATED";
  return "ALL";
}

export function testAreaPermission(userId: string, area: Area, requiredPermission: AreaPermission): boolean {
  const userPermission = getAreaPermission(userId, area);
  return areaLadder[userPermission] >= areaLadder[requiredPermission];
}
