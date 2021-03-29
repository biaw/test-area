const fs = require("fs"), { emojis } = require("../database");

module.exports = async client => {
  let db = await emojis.get(), guild = client.guilds.resolve(db.guild);

  // if guild doesn't exist, let's make one
  if (!guild) {
    console.log("Could not find emoji server, creating a new server for emojis.");
    guild = await client.guilds.create("EMOJI SERVER");
    await emojis.set("guild", guild.id);
  }

  const current = await emojis.get();
  for (const fileName of emojiFiles.filter(f => !current[f.split(".")[0]])) {
    const 
      name = fileName.split(".")[0],
      newEmoji = await guild.emojis.create(`./src/assets/emojis/${fileName}`, name);
    await emojis.set(name, `<:${newEmoji.name}:${newEmoji.id}>`);
    console.log(`Created emoji ${fileName}`);
  }
  console.log("Emojis have been refreshed.");
};

const emojiFiles = [];
fs.readdir("./src/assets/emojis", (err, files) => {
  if (err) return console.log(err);
  emojiFiles.push(...files.filter(f => f.includes(".")));
});