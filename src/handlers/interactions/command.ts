import type { CommandArguments, SlashCommand } from "../../@types/interactions";
import type { CommandInteraction, CommandInteractionOptionResolver } from "discord.js";
import { areaCommands, globalCommands, slashCommandsFolder } from ".";
import { testAreaPermission, testGlobalPermission } from "../../utils/permissions";
import type { Area } from "../../@types/area";
import { inspect } from "util";
import { join } from "path";
import { permissionError } from "../../constants/messages";
import { testAreaLogger } from "../../utils/logger";

export default async (interaction: CommandInteraction, area?: Area) => {
  const areaCommand = areaCommands.find(command => command.name === interaction.commandName);
  if (areaCommand && area) {
    const { areaPermissionLevel, execute }: SlashCommand = (await import(join(slashCommandsFolder, areaCommand.name))).default;

    const hasPermission = areaPermissionLevel ? testAreaPermission(interaction.user.id, area, areaPermissionLevel) : true;
    if (!hasPermission) return interaction.reply(permissionError);

    return execute(interaction, convertArguments(interaction.options.data));
  }

  const globalCommand = globalCommands.find(command => command.name === interaction.commandName);
  if (globalCommand) {
    const { globalPermissionLevel, execute }: SlashCommand = (await import(join(slashCommandsFolder, globalCommand.name))).default;

    const hasPermission = globalPermissionLevel ? await testGlobalPermission(interaction.user.id, globalPermissionLevel) : true;
    if (!hasPermission) return interaction.reply(permissionError);

    return execute(interaction, convertArguments(interaction.options.data));
  }

  return void testAreaLogger.warn(`Unknown command interaction: ${inspect(interaction.toJSON())}`);
};

function convertArguments(options: CommandInteractionOptionResolver["data"]) {
  const args: CommandArguments = {};
  for (const o of options) args[o.name] = o.type === "SUB_COMMAND" ? convertArguments(o.options || []) : o.value;
  return args;
}
