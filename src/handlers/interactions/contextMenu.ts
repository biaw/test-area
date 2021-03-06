import { areaCommands, globalCommands, userCommandsFolder } from ".";
import { testAreaPermission, testGlobalPermission } from "../../utils/permissions";
import type { Area } from "../../@types/area";
import type { ContextMenuInteraction } from "discord.js";
import type { UserCommand } from "../../@types/interactions";
import { inspect } from "util";
import { join } from "path";
import { permissionError } from "../../constants/messages";
import { testAreaLogger } from "../../utils/logger";

export default async (interaction: ContextMenuInteraction, area?: Area) => {
  if (interaction.targetType === "USER") {
    const areaCommand = areaCommands.find(command => command.name === interaction.commandName);
    if (areaCommand && area) {
      const { areaPermissionLevel, execute }: UserCommand = (await import(join(userCommandsFolder, areaCommand.name))).default;

      const hasPermission = areaPermissionLevel ? testAreaPermission(interaction.user.id, area, areaPermissionLevel) : true;
      if (!hasPermission) return interaction.reply(permissionError);

      return execute(interaction);
    }

    const globalCommand = globalCommands.find(command => command.name === interaction.commandName);
    if (globalCommand) {
      const { globalPermissionLevel, execute }: UserCommand = (await import(join(userCommandsFolder, globalCommand.name))).default;

      const hasPermission = globalPermissionLevel ? await testGlobalPermission(interaction.user.id, globalPermissionLevel) : true;
      if (!hasPermission) return interaction.reply(permissionError);

      return execute(interaction);
    }

    return void testAreaLogger.warn(`Unknown user command interaction: ${inspect(interaction.toJSON())}`);
  }

  return void testAreaLogger.warn(`Unknown context menu interaction: ${inspect(interaction.toJSON())}`);
};
