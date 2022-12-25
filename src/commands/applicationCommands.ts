import type{ ApplicationCommandData, ApplicationCommandOptionData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData } from "discord.js";
import type{ ChatInputCommand, ChatInputCommandExecutable, ChatInputCommandOptionData, ChatInputCommandOptionDataAutocomplete } from "./chatInput";
import { ApplicationCommandOptionType } from "discord.js";
import { ApplicationCommandType } from "discord.js";
import { allChatInputCommands } from "./chatInput";
import { allMenuCommands } from "./menu";

export default function getAllApplicationCommands(commandType?: "non-test-areas" | "test-areas"): ApplicationCommandData[] {
  const applicationCommands: ApplicationCommandData[] = [];

  for (const command of allChatInputCommands) {
    if (!commandType || command.worksIn.includes(commandType)) {
      applicationCommands.push({
        name: command.name,
        description: command.description,
        type: ApplicationCommandType.ChatInput,
        ...chatInputIsExecutable(command) ?
          { ...command.options && { options: convertChatInputCommandOptionsToApplicationCommandOptions(command.options) }} :
          {
            options: command.subcommands.map(subcommand => ({
              name: subcommand.name,
              description: subcommand.description,
              ...chatInputIsExecutable(subcommand) ?
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
        ...!command.public && commandType === "non-test-areas" && { defaultMemberPermissions: 0n },
      });
    }
  }

  for (const command of allMenuCommands) {
    if (!commandType || command.worksIn.includes(commandType)) {
      applicationCommands.push({
        name: command.name,
        type: command.type === "message" ? ApplicationCommandType.Message : ApplicationCommandType.User,
        ...!command.public && commandType === "non-test-areas" && { defaultMemberPermissions: 0n },
      });
    }
  }

  return applicationCommands;
}

function convertChatInputCommandOptionsToApplicationCommandOptions(chatInputCommandOptions: ChatInputCommandOptionData[]): Array<Exclude<ApplicationCommandOptionData, ApplicationCommandSubCommandData | ApplicationCommandSubGroupData>> {
  return chatInputCommandOptions.map(option => {
    if (chatInputCommandOptionIsAutocomplete(option)) return { ...option, autocomplete: true };
    return option;
  });
}

function chatInputIsExecutable(chatInputCommand: ChatInputCommand): chatInputCommand is ChatInputCommandExecutable & typeof chatInputCommand {
  // it's basically the same so it doesn't really matter
  return "execute" in chatInputCommand;
}

function chatInputCommandOptionIsAutocomplete(option: ChatInputCommandOptionData): option is ChatInputCommandOptionDataAutocomplete {
  return "autocomplete" in option;
}
