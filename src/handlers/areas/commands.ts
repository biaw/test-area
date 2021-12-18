import { ApplicationCommand, Guild, GuildApplicationCommandPermissionData } from "discord.js";
import { areaCommands, slashCommandsFolder, userCommandsFolder } from "../interactions";
import { Area } from "../../@types/area";
import { SlashCommand } from "../../@types/interactions";
import { areas } from "../../utils/database";
import { join } from "path";

export function registerCommands(guild: Guild): Promise<boolean> {
  return new Promise(resolve => {
    guild.commands.set(areaCommands).then(async commands => {
      resolve(true);
      const area = await areas.get(guild.id);
      const fullPermissions = await getPermissions(Array.from(commands.values()), area);
      guild.commands.permissions.set({ fullPermissions });
    }).catch(() => resolve(false));
  });
}

async function getPermissions(commands: Array<ApplicationCommand>, area: Area) {
  const fullPermissions: Array<GuildApplicationCommandPermissionData> = [];

  for (const command of commands) {
    if (!command.defaultPermission) {
      const { areaPermissionLevel }: SlashCommand = (await import(join(command.type === "CHAT_INPUT" ? slashCommandsFolder : userCommandsFolder, command.name))).default;
      fullPermissions.push({
        id: command.id,
        permissions: [
          {
            type: "ROLE",
            id: area.roles.owner,
            permission: true,
          },
          {
            type: "ROLE",
            id: area.roles.elevated,
            permission: areaPermissionLevel === "ELEVATED",
          },
        ],
      });
    }
  }

  return fullPermissions;
}
