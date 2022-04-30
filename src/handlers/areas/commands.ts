import type { Guild } from "discord.js";
import { areaCommands } from "../interactions";

export function registerCommands(guild: Guild): Promise<boolean> {
  return new Promise(resolve => {
    guild.commands.set(areaCommands).then(() => resolve(true)).catch(() => resolve(false));
  });
}
