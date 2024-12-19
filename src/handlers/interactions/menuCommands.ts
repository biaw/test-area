import type{ ContextMenuCommandInteraction } from "discord.js";
import { allMenuCommands } from "../../commands/menu";

export default async function menuCommandHandler(interaction: ContextMenuCommandInteraction): Promise<void> {
  const command = allMenuCommands.find(({ name }) => name === interaction.commandName);
  if (interaction.isMessageContextMenuCommand() && command?.type === "message") return command.execute(interaction, interaction.targetMessage);
  if (interaction.isUserContextMenuCommand() && command?.type === "user") return command.execute(interaction, interaction.targetMember);
}
