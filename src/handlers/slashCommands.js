const fs = require("fs"), { join } = require("path"), { areas, access, emojis } = require("../database"), config = require("../../config.json");

module.exports = async client => {
  // register commands
  registerCommands(client, globalCommands).then(() => console.log("Global slash commands have been registered."));
  const guilds = Object.keys(await areas.get());
  Promise.all(client.guilds.cache.filter(guild => guilds.includes(guild.id)).map(guild => registerCommands(client, testCommands, guild.id).catch(() => console.log(`Guild "${guild.name}" has not authorized me to set up slash commands.`)))).then(() => console.log("Test area slash commands have been registered."));

  client.ws.on("INTERACTION_CREATE", async interaction => {
    let command = globalCommands.find(c => c.name == interaction.data.name), globalCommand = true;
    if (!command) {
      command = testCommands.find(c => c.name == interaction.data.name);
      globalCommand = false;
    }

    let
      args = getSlashArgs(interaction.data.options || []),
      commandFile;
    const
      listAreas = await areas.get(),
      area = listAreas[interaction.guild_id],
      subcommand = Object.keys(args).find(a => command.options.find(b => b.name == a).type == 1);
    
    if (subcommand) {
      commandFile = require(`../commands/${globalCommand ? "global" : "test-area"}/${interaction.data.name}/${subcommand}.js`);
      args = args[subcommand];
    } else commandFile = require(`../commands/${globalCommand ? "global" : "test-area"}/${interaction.data.name}.js`);

    let
      requiredPermission = ["ALL", "MEMBER", "ACCESS", "CREATOR", "OWNER", "GOD"].indexOf(commandFile.group || "ALL"),
      currentPermission = 0,
      listAccess = await access.get();
    
    if (area) currentPermission = 1; // executed within a test area, therefore a member of the test area
    if (listAccess[interaction.member.user.id]) currentPermission = 2;
    if (area && area.creator == interaction.member.user.id) currentPermission = 3;
    if (config.owner == interaction.member.user.id) currentPermission = 4;

    if (currentPermission < requiredPermission) return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `⛔ You don't have permission to do this, required permission group is \`${commandFile.group}\`.`, flags: 64 }}});

    commandFile.execute(client, interaction, args, await emojis.get(), area);
  });
};

function getSlashArgs(options) {
  const args = {};
  for (const o of options) {
    if (o.type == 1) args[o.name] = getSlashArgs(o.options || []);
    else args[o.name] = o.value;
  }
  return args;
}

async function registerCommands(client, commands, guild) {
  const slashCommands =
    guild ?
      client.api.applications(client.user.id).guilds(guild).commands :
      client.api.applications(client.user.id).commands;
  
  // remove old commands
  const registered = await slashCommands.get();
  await Promise.all(registered
    .filter(c => !commands.find(co => co.name == c.name))
    .map(({ id }) => slashCommands[id].delete())
  );

  // register new or update existing commands
  await Promise.all(commands
    .filter(c => {
      const r = registered.find(s => s.name == c.name);
      if (
        !r ||
        c.description !== r.description ||
        JSON.stringify(c.options || []) !== JSON.stringify(r.options || [])
      ) return true; else return false;
    })
    .map(data => slashCommands.post({ data }))
  );
}

module.exports.registerTestCommandsForGuild = (guildid, client) => registerCommands(client, testCommands, guildid);

// loading commands
const globalCommands = [], testCommands = [];

nestCommands("../commands/global", globalCommands);
nestCommands("../commands/test-area", testCommands);

function nestCommands(relPath, arr) {
  fs.readdir(join(__dirname, relPath), (err, files) => {
    if (err) return console.log(err);
    for (const file of files) {
      if (file.endsWith(".js")) {
        const { description = "No description", options = [] } = require(`${relPath}/${file}`);
        arr.push({ name: file.split(".")[0], description, options });
      } else if (!file.includes(".")) {
        fs.readdir(join(__dirname, relPath, file), (err, files) => {
          if (err) return console.log(err);
          arr.push({ name: file, description: "Sub-command.", options: files.map(fileName => {
            const { description = "No description", options } = require(`${relPath}/${file}/${fileName}`);
            return { type: 1, name: fileName.split(".")[0], description, options };
          })});
        });
      }
    }
  });
}