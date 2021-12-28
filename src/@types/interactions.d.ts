import { ApplicationCommandOptionData, CommandInteraction, ContextMenuInteraction } from "discord.js";
import { AreaPermission, GlobalPermission } from "./permissions";

export type Command = {
  globalPermissionLevel?: GlobalPermission;
  areaPermissionLevel?: AreaPermission;
}

export type SlashCommand = {
  description: string;
  options?: Array<ApplicationCommandOptionData>;
  execute(interaction: CommandInteraction, args: CommandArguments): Promise<void>;
} & Command

export type UserCommand = {
  execute(interaction: ContextMenuInteraction): Promise<void>;
} & Command

export type CommandArguments = {
  [argument: string]: CommandInteractionOption["value"];
}
