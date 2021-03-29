const
  Discord = require("discord.js"),
  slashCommandHandler = require("./handlers/slashCommands"),
  testAreaHandler = require("./handlers/testArea"),
  emojiServerHandler = require("./handlers/emojiServer"),
  client = new Discord.Client({
    messsageCacheLifetime: 10,
    messageSweepInterval: 10,
    messageEditHistoryMaxSize: 0,
    fetchAllMembers: true,
    partials: [ "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER" ],
    presence: {
      status: "idle"
    }
  }),
  config = require("../config.json"),
  { areas, access } = require("./database");

client.on("shardReady", async () => {
  // set up emojis if it's the first time
  await emojiServerHandler(client);

  // set up slash commands
  slashCommandHandler(client);

  // set up test area listeners
  testAreaHandler(client);

  // update presence
  setInterval(() => areas.get().then(async list => {
    // remove testing areas deleted in other ways
    for (const guild of Object.keys(list).filter(guildid => !client.guilds.cache.has(guildid))) await areas.unset(guild);

    const
      current = Object.keys(list).filter(guildid => client.guilds.cache.has(guildid)).length,
      maximum = 10 - (client.guilds.cache.size - current);

    client.user.setPresence({
      status: "online",
      activity: {
        type: "WATCHING",
        name: `${current}/${maximum} testing areas`
      }
    });
  }), config.presenceInterval);
});

client
  .on("error", console.log)
  .on("rateLimit", ({ timeout, limit, method, path }) => console.log(`Rate-limited. [${timeout}ms, ${method} ${path}, limit: ${limit}]`))
  .on("shardDisconnect", event => console.log("Disconnected:", event.reason))
  .on("shardReconnecting", () => console.log("Reconnecting..."))
  .on("shardResume", (_, replayed) => console.log(`Resumed. [${replayed} events replayed]`))
  .on("warn", info => console.log("Info:", info))
  .login(config.token);

access.set(config.owner, true);