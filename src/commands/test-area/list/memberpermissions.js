module.exports = {
  description: "Get a list of member permissions",
  options: [
    {
      type: 5,
      name: "admins",
      description: "Decide if the output should include admins or not. Default is false"
    },
    {
      type: 5,
      name: "bots",
      description: "Decide if the output should include bots or not. Default is true"
    },
    {
      type: 3,
      name: "highlight",
      description: "Highlight a permission or a list of permissions."
    },
    {
      type: 6,
      name: "user",
      description: "The member you want to list all permissions for. Ignores admins and bots-options."
    }
  ]
};

const config = require("../../../../config.json");

module.exports.execute = async (client, interaction, { admins = false, bots = true, highlight = "", user }, { success, error }) => {
  highlight = highlight.toUpperCase().split(", ").map(p => p.replace(/ /g, "_"));
  const guild = client.guilds.cache.get(interaction.guild_id);
  if (user) {
    const member = guild.members.cache.get(user);
    client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${success} User \`${member.user.tag}\` has the following permissions:\n\`\`\`diff\n${member.permissions.toArray().sort().map(p => `${highlight.includes(p) ? "+ " : "• "} ${p}`).join("\n")}\`\`\`` }}});
  } else {
    const
      members = guild.members.cache.filter(m => (bots ? m : !m.user.bot) && (admins ? m : !m.permissions.has("ADMINISTRATOR"))),
      embedFields = members.map(m => ({
        name: m.user.tag,
        value: m.permissions.has("ADMINISTRATOR") ? "***__`ADMINISTRATOR`__***" : m.permissions.toArray().map(p => highlight.includes(p) ? `***__\`${p}\`__***` : `\`${p}\``).join(", "),
        inline: true
      })),
      fieldsSeparated = separate(embedFields, 24),
      embeds = fieldsSeparated.map(fields => ({
        fields,
        color: config.color
      }));
    if (embeds.length) client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { embeds }}});
    else client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${error} No members could be shown. Maybe everyone in the server is an administrator?` }}});
  }
};

function separate(arr, size) {
  const output = [];
  for (let i = 0; i < arr.length; i += size) output.push(arr.slice(i, i + size));
  return output;
}