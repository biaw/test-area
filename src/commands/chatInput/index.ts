import type { ApplicationCommandAutocompleteNumericOptionData, ApplicationCommandAutocompleteStringOptionData, ApplicationCommandBooleanOptionData, ApplicationCommandChannelOptionData, ApplicationCommandMentionableOptionData, ApplicationCommandNonOptionsData, ApplicationCommandNumericOptionData, ApplicationCommandRoleOptionData, ApplicationCommandStringOptionData, ApplicationCommandUserOptionData, Awaitable, ChatInputCommandInteraction } from "discord.js";
import { readdirSync } from "fs";
import type { Autocomplete } from "../../handlers/interactions/autocompletes";

export interface ChatInputCommandMeta {
  description: string;
  name: string;
}

export interface ChatInputCommandExecutable {
  execute(interaction: ChatInputCommandInteraction): Awaitable<void>;
  options?: [ChatInputCommandOptionData, ...ChatInputCommandOptionData[]];
}

export interface ChatInputCommandGroup<NthLevelChatInputCommand extends SecondLevelChatInputCommand | ThirdLevelChatInputCommand> {
  subcommands: [NthLevelChatInputCommand, ...NthLevelChatInputCommand[]];
}

export type FirstLevelChatInputCommand =
  & { applicableTo: Array<"main" | "workers"> }
  & (ChatInputCommandExecutable | ChatInputCommandGroup<SecondLevelChatInputCommand>)
  & ChatInputCommandMeta;

export type SecondLevelChatInputCommand =
  & (ChatInputCommandExecutable | ChatInputCommandGroup<ThirdLevelChatInputCommand>)
  & ChatInputCommandMeta;

export type ThirdLevelChatInputCommand =
  & ChatInputCommandExecutable
  & ChatInputCommandMeta;

export type ChatInputCommand =
  | FirstLevelChatInputCommand
  | SecondLevelChatInputCommand
  | ThirdLevelChatInputCommand;

export type ChatInputCommandOptionDataAutocomplete =
  | ({ autocomplete: Autocomplete<number> } & Omit<ApplicationCommandAutocompleteNumericOptionData, "autocomplete">)
  | ({ autocomplete: Autocomplete<string> } & Omit<ApplicationCommandAutocompleteStringOptionData, "autocomplete">);

export type ChatInputCommandOptionDataNoAutocomplete =
  | ApplicationCommandBooleanOptionData
  | ApplicationCommandChannelOptionData
  | ApplicationCommandMentionableOptionData
  | ApplicationCommandNonOptionsData
  | ApplicationCommandRoleOptionData
  | ApplicationCommandUserOptionData
  | Omit<ApplicationCommandNumericOptionData, "autocomplete">
  | Omit<ApplicationCommandStringOptionData, "autocomplete">;

export type ChatInputCommandOptionData = ChatInputCommandOptionDataAutocomplete | ChatInputCommandOptionDataNoAutocomplete;

export const allChatInputCommands = readdirSync(__dirname)
  .filter(file => !file.includes("index"))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports -- we need this for it to be synchronous
  .map(file => require(`./${file}`).default as FirstLevelChatInputCommand);
