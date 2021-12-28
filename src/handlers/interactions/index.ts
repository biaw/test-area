import { SlashCommand, UserCommand } from "../../@types/interactions";
import { ApplicationCommandData } from "discord.js";
import { Handler } from "../../@types/handler";
import { areas } from "../../utils/database";
import commandHandler from "./command";
import componentHandler from "./component";
import contextMenuHandler from "./contextMenu";
import { inspect } from "util";
import { join } from "path";
import { readdir } from "fs/promises";
import { registerCommands } from "../areas/commands";
import { testAreaLogger } from "../../utils/logger";

export const globalCommands: Array<ApplicationCommandData> = [];
export const areaCommands: Array<ApplicationCommandData> = [];

export const slashCommandsFolder = join(__dirname, "..", "..", "commands", "slash");
export const userCommandsFolder = join(__dirname, "..", "..", "commands", "user");

export default (async client => {
  const slash = await getCommands(slashCommandsFolder, "slash");
  const user = await getCommands(userCommandsFolder, "user");

  globalCommands.push(...slash.globalCommands, ...user.globalCommands);
  areaCommands.push(...slash.areaCommands, ...user.areaCommands);

  client.application.commands.set(globalCommands);

  const areaList = await areas.get();
  client.guilds.cache.filter(g => Boolean(areaList[g.id])).forEach(registerCommands);

  client.on("interactionCreate", async interaction => {
    if (interaction.isButton() || interaction.isSelectMenu()) return componentHandler(interaction);

    const currentAreas = await areas.get();
    const area = interaction.guildId ? currentAreas[interaction.guildId] : undefined;

    if (interaction.isCommand()) return commandHandler(interaction, area);
    if (interaction.isContextMenu()) return contextMenuHandler(interaction, area);

    return void testAreaLogger.warn(`Unknown interaction: ${inspect(interaction.toJSON())}`);
  });
}) as Handler;

function getCommands(path: string, type: "slash" | "user") {
  return new Promise<{
    globalCommands: Array<ApplicationCommandData>;
    areaCommands: Array<ApplicationCommandData>;
  }>((resolve, reject) => {
    readdir(path)
      .then(async files => {
        const globalCommands: Array<ApplicationCommandData> = [];
        const areaCommands: Array<ApplicationCommandData> = [];

        for (const file of files) {
          if (type === "slash") {
            const { description, options, areaPermissionLevel, globalPermissionLevel }: SlashCommand = (await import(join(path, file))).default;
            if (globalPermissionLevel) globalCommands.push({ type: "CHAT_INPUT", name: file.split(".")[0], description, options });
            else if (areaPermissionLevel) areaCommands.push({ type: "CHAT_INPUT", name: file.split(".")[0], description, options, defaultPermission: areaPermissionLevel === "ALL" });
          } else if (type === "user") {
            const { areaPermissionLevel, globalPermissionLevel }: UserCommand = (await import(join(path, file))).default;
            if (globalPermissionLevel) globalCommands.push({ type: "USER", name: file.split(".")[0] });
            else if (areaPermissionLevel) areaCommands.push({ type: "USER", name: file.split(".")[0], defaultPermission: areaPermissionLevel === "ALL" });
          }
        }

        resolve({ globalCommands, areaCommands });
      })
      .catch(reject);
  });
}
