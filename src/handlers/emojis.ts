import { readFileSync, readdir } from "fs";
import { Guild } from "discord.js";
import { Handler } from "../@types/handler";
import config from "../config";
import { emojis } from "../utils/database";
import { join } from "path";
import { testAreaLogger } from "../utils/logger";

const emojiFolder = join(__dirname, "..", "..", "assets", "emojis");

export default (async client => {
  let current = await emojis.get();

  const guild = client.guilds.resolve(current.guildId);
  let currentGuild: Guild;

  // if guild doesn't exist then let's make one
  if (config.EMOJI_REFRESH || !guild) {
    if (guild) await guild.delete().then(() => testAreaLogger.info("Recreating emoji server (environment variable was set)."));
    else testAreaLogger.info("Could not find an emoji server, making a new one.");

    currentGuild = await client.guilds.create("EMOJI SERVER");

    await emojis.reset();
    // eslint-disable-next-line require-atomic-updates -- we don't need any updates from this later on, so ignore this linting warning
    current = await emojis.set("guildId", currentGuild.id);
  } else currentGuild = guild;

  readdir(emojiFolder, async (err, files) => {
    if (err) throw err;
    for (const fileName of files.filter(file => !current[file.split(".")[0]])) {
      const [name] = fileName.split(".");
      const emoji = await currentGuild.emojis.create(readFileSync(join(emojiFolder, fileName)), name);

      await emojis.set(name, emoji.toString());
      testAreaLogger.info(`Created emoji "${emoji.name}"`);

    }
    testAreaLogger.info("Emoji server is ready.");
  });
}) as Handler;
