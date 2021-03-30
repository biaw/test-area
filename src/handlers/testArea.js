const { areas } = require("../database"), { registerTestCommandsForGuild } = require("./slashCommands");

module.exports = client => {
  client.on("guildMemberAdd", async member => {
    const area = await areas.get(member.guild.id);
    if (area) {
      if (member.user.bot) member.roles.add(area.roles.bot);
      if (member.user.id == area.creator) member.roles.add(area.roles.admin);
    }
  });

  // admin vc toggle
  client.on("voiceStateUpdate", async (_, voice) => {
    const area = await areas.get(voice.guild.id);
    if (area) {
      if (voice.channel && voice.channel.id == area.settings.admin_vc) {
        if (voice.member.roles.cache.has(area.roles.admin)) voice.member.roles.remove(area.roles.admin, "VC Toggle");
        else voice.member.roles.add(area.roles.admin, "VC Toggle");
        voice.member.voice.kick();
      }
    }
  });
  
  // server setup slash commands
  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;
    const area = await areas.get(reaction.message.guild.id);
    if (area && area.setupMessage == reaction.message.id) {
      try {
        await registerTestCommandsForGuild(reaction.message.guild.id, reaction.client);
        reaction.message.channel.delete("Slash commands have been set up.");
      } catch(e) {
        console.log(e);
        reaction.users.remove(user);
      }
    }
  });
};

// auto admin
// admin vc