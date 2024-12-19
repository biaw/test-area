import type{ ChatInputCommandInteraction } from "discord.js";
import type{ ChatInputCommand } from "../../commands/chatInput";
import { allChatInputCommands } from "../../commands/chatInput";

export default function chatInputCommandHandler(interaction: ChatInputCommandInteraction): void {
  const hierarchy = [interaction.commandName, interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)] as const;
  const firstLevelCommand = allChatInputCommands.find(({ name }) => name === hierarchy[0]) ?? null;

  let command: ChatInputCommand | null = firstLevelCommand;
  if (firstLevelCommand && hierarchy[1] && "subcommands" in firstLevelCommand) command = firstLevelCommand.subcommands.find(({ name }) => name === hierarchy[1]) ?? null;
  if (command && hierarchy[2] && "subcommands" in command) command = command.subcommands.find(({ name }) => name === hierarchy[2]) ?? null;

  if (command && "execute" in command) return void command.execute(interaction);
}
