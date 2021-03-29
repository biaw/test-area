const fs = require("fs"), { join } = require("path"), { areas } = require("../database"), config = require("../../config.json");

module.exports = async client => {
  // register commands
  registerCommands(client, globalCommands).then(() => console.log("Global slash commands have been registered."));
  const guilds = Object.keys(await areas.get());
  Promise.all(client.guilds.cache.filter(guild => guilds.includes(guild.id)).map(guild => registerCommands(client, testCommands, guild.id))).then(() => console.log("Test area slash commands have been registered."));

  client.ws.on("INTERACTION_CREATE", async interaction => {
    let command = globalCommands.find(c => c.name == interaction.data.name), globalCommand = true;
    if (!command) {
      command = testCommands.find(c => c.name == interaction.data.name);
      globalCommand = false;
    }

    console.log(command);

    const args = getSlashArgs(interaction.data.options || []);
    console.log(args);

    const subcommand = Object.keys(args).find(a => command.options.find(b => b.name == a).type == 1);
    if (subcommand) {
      const commandFile = require(`../commands/${globalCommand ? "global" : "test-area"}/${interaction.data.name}/${subcommand}.js`);
      commandFile.execute(client, interaction, args[subcommand]);
    } else {
      const commandFile = require(`../commands/${globalCommand ? "global" : "test-area"}/${interaction.data.name}.js`);
      commandFile.execute(client, interaction, args);
    }
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
            const { description = "No description", options = [] } = require(`${relPath}/${file}/${fileName}`);
            return { type: 1, name: fileName.split(".")[0], description, options };
          })});
        });
      }
    }
  });
}