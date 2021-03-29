module.exports = {
  description: "List all the testing areas currently available",
  group: "ACCESS"
};

const { areas } = require("../../../database"), config = require("../../../../config.json");

module.exports.execute = async (client, interaction) => {
  const list = await areas.get();

  const guilds = client.guilds.cache.filter(g => Object.keys(list).includes(g.id));
  if (!guilds.size) return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: "❌ No testing areas have been created." } } });

  return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { embeds: [{
    description: `You have ${guilds.size}/${10 - (client.guilds.cache.size - guilds.size)} testing areas created.`,
    fields: guilds.map(g => ({
      name: g.name,
      value: [
        `**ID:** ${g.id}`,
        `**Invite:** [discord.gg/${list[g.id].code}](https://discord.gg/${list[g.id].code})`,
        `**Creator:** <@${list[g.id].creator}>`,
        "",
        `**Bots:** ${g.members.cache.filter(m => m.user.bot && m.user.id !== client.user.id).map(m => `\`${m.user.tag}\``).join(", ") || "None"}`,
        "",
        `**Humans: ${g.members.cache.filter(m => !m.user.bot).map(m => `\`${m.user.tag}\``).join(", ") || "None"}**`
      ].join("\n")
    })),
    color: config.embedColors.success
  }]}}});
};