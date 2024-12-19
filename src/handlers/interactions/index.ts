import type{ Client } from "discord.js";
import getAllApplicationCommands from "../../commands/applicationCommands";
import mainLogger from "../../utils/logger/main";
import autocompleteHandler from "./autocompletes";
import chatInputCommandHandler from "./chatInputCommands";
import componentHandler from "./components";
import menuCommandHandler from "./menuCommands";
import modalHandler from "./modals";

export default function handleInteractions(client: Client<true>, workerName?: string): void {
  client.on("interactionCreate", interaction => {
    if (interaction.isModalSubmit()) return modalHandler(interaction);
    if (interaction.isMessageComponent()) return componentHandler(interaction);
    if (interaction.isChatInputCommand()) return chatInputCommandHandler(interaction);
    if (interaction.isContextMenuCommand()) return void menuCommandHandler(interaction);
    if (interaction.isAutocomplete()) return void autocompleteHandler(interaction);
  });

  mainLogger.info(`Interaction command listener registered.${workerName ? ` (${workerName})` : ""}`);

  void client.application.commands.set(getAllApplicationCommands(workerName ? "workers" : "main")).then(() => mainLogger.info(`Application commands registered.${workerName ? ` (${workerName})` : ""}`));
}
