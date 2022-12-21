import type{ Client } from "discord.js";
import autocompleteHandler from "./autocompletes";
import chatInputCommandHandler from "./chatInputCommands";
import componentHandler from "./components";
import config from "../../config";
import getAllApplicationCommands from "../../commands/applicationCommands";
import { mainLogger } from "../../utils/logger/main";
import menuCommandHandler from "./menuCommands";
import modalHandler from "./modals";

export default function handleInteractions(client: Client<true>): void {
  client.on("interactionCreate", interaction => {
    if (!interaction.inCachedGuild()) return void mainLogger.warn(`Received interaction ${interaction.id} (guild ${interaction.guildId ?? "n/a"}, channel ${interaction.channelId ?? "n/a"}, user ${interaction.user.id}) from uncached guild.`);
    if (interaction.isModalSubmit()) return modalHandler(interaction);
    if (interaction.isMessageComponent()) return componentHandler(interaction);
    if (interaction.isChatInputCommand()) return chatInputCommandHandler(interaction);
    if (interaction.isContextMenuCommand()) return menuCommandHandler(interaction);
    if (interaction.isAutocomplete()) return autocompleteHandler(interaction);
  });

  mainLogger.info("Interaction command listener registered.");

  void client.guilds.cache.get(config.guildId)!.commands.set(getAllApplicationCommands()).then(() => mainLogger.info("Application commands registered."));
}
