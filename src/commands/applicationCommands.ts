import type { ApplicationCommandData, ApplicationCommandOptionData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData } from "discord.js";
import { ApplicationCommandOptionType, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord.js";


import type{ ChatInputCommand, ChatInputCommandExecutable, ChatInputCommandOptionData, ChatInputCommandOptionDataAutocomplete, FirstLevelChatInputCommand } from "./chatInput";
import { allChatInputCommands } from "./chatInput";
import { allMenuCommands } from "./menu";

export default function getAllApplicationCommands(commandType?: FirstLevelChatInputCommand["applicableTo"][number]): ApplicationCommandData[] {
  const applicationCommands: ApplicationCommandData[] = [];

  for (const command of allChatInputCommands) {
    if (!commandType || command.applicableTo.includes(commandType)) {
      applicationCommands.push({
        name: command.name,
        description: command.description,
        type: ApplicationCommandType.ChatInput,
        ...chatInputIsExecutable(command) ?
          { ...command.options && { options: convertChatInputCommandOptionsToApplicationCommandOptions(command.options) } } :
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
        integrationTypes: [commandType === "main" ? ApplicationIntegrationType.UserInstall : ApplicationIntegrationType.GuildInstall],
        ...commandType === "main" && { contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel] },
      });
    }
  }

  for (const command of allMenuCommands) {
    if (!commandType || command.worksIn.includes(commandType)) {
      applicationCommands.push({
        name: command.name,
        type: command.type === "message" ? ApplicationCommandType.Message : ApplicationCommandType.User,
        integrationTypes: [commandType === "main" ? ApplicationIntegrationType.UserInstall : ApplicationIntegrationType.GuildInstall],
        ...commandType === "main" && { contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel] },
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
