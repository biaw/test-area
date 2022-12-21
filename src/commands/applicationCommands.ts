import type{ ApplicationCommandData, ApplicationCommandOptionData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData } from "discord.js";
import type{ ChatInput, ChatInputCommand, ChatInputCommandOptionData, ChatInputCommandOptionDataAutocomplete, ChatInputSubcommand } from "./chatInput";
import { ApplicationCommandOptionType } from "discord.js";
import { ApplicationCommandType } from "discord.js";
import { allChatInputCommands } from "./chatInput";
import { allMenuCommands } from "./menu";

export default function getAllApplicationCommands(): ApplicationCommandData[] {
  const applicationCommands: ApplicationCommandData[] = [];

  for (const command of allChatInputCommands) {
    applicationCommands.push({
      name: command.name,
      description: command.description,
      type: ApplicationCommandType.ChatInput,
      ...chatInputIsCommandOrSubcommand(command) ?
        { ...command.options && { options: convertChatInputCommandOptionsToApplicationCommandOptions(command.options) }} :
        {
          options: command.subcommands.map(subcommand => ({
            name: subcommand.name,
            description: subcommand.description,
            ...chatInputIsCommandOrSubcommand(subcommand) ?
              {
                type: ApplicationCommandOptionType.Subcommand,
                ...subcommand.options && { options: convertChatInputCommandOptionsToApplicationCommandOptions(subcommand.options) },
              } :
              {
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: subcommand.subcommands.map(subsubcommand => ({
                  name: subsubcommand.name,
                  description: subsubcommand.description,
                  type: ApplicationCommandOptionType.Subcommand,
                  ...subsubcommand.options && { options: convertChatInputCommandOptionsToApplicationCommandOptions(subsubcommand.options) },
                })),
              },
          })),
        },
      ...!command.public && { defaultMemberPermissions: 0n },
    });
  }

  for (const command of allMenuCommands) {
    applicationCommands.push({
      name: command.name,
      type: command.type === "message" ? ApplicationCommandType.Message : ApplicationCommandType.User,
      ...!command.public && { defaultMemberPermissions: 0n },
    });
  }

  return applicationCommands;
}

function convertChatInputCommandOptionsToApplicationCommandOptions(chatInputCommandOptions: ChatInputCommandOptionData[]): Array<Exclude<ApplicationCommandOptionData, ApplicationCommandSubCommandData | ApplicationCommandSubGroupData>> {
  return chatInputCommandOptions.map(option => {
    if (chatInputCommandOptionIsAutocomplete(option)) return { ...option, autocomplete: true };
    return option;
  });
}

function chatInputIsCommandOrSubcommand(chatInputCommand: ChatInput): chatInputCommand is ChatInputCommand | ChatInputSubcommand {
  // it's basically the same so it doesn't really matter
  return !("subcommands" in chatInputCommand);
}

function chatInputCommandOptionIsAutocomplete(option: ChatInputCommandOptionData): option is ChatInputCommandOptionDataAutocomplete {
  return "autocomplete" in option;
}
