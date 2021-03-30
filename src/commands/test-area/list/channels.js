module.exports = {
  description: "Get a list of the channels of this server",
  options: [
    {
      type: 3,
      name: "form",
      description: "The form of the list. Default is embed form",
      choices: [
        {
          name: "Embed form",
          value: "embed"
        },
        {
          name: "Compact text with emojis",
          value: "compact"
        },
        {
          name: "IDs only",
          value: "ids"
        }
      ]
    }
  ]
};

module.exports.execute = async (client, interaction, { form = "embed" }, emojis) => {
  const
    guild = client.guilds.cache.get(interaction.guild_id),
    baseChannels = guild.channels.cache
      .filter(ch => !ch.parentID)
      .sort((a, b) => a.position - b.position)
      .sort((a, b) => {
        let na = a.type == "voice" ? 1 : 0, nb = b.type == "voice" ? 1 : 0;
        return na - nb;
      })
      .sort((a, b) => {
        let na = a.type == "category" ? 1 : 0, nb = b.type == "category" ? 1 : 0;
        return na - nb;
      })
      .array(),
    channels = [];
  
  for (const channel of baseChannels) {
    channels.push(channel);
    if (channel.type == "category") channels.push(...channel.children
      .sort((a, b) => a.position - b.position)
      .sort((a, b) => {
        let na = a.type == "voice" ? 1 : 0, nb = b.type == "voice" ? 1 : 0;
        return na - nb;
      })
      .array()
    );
  }

  switch (form) {
  case "embed":
    client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: {
      embeds: [{
        fields: [
          {
            name: "Name",
            value: channels.map(ch => `${ch.parentID ? "> " : ""}${getChannelEmoji(ch, emojis)} \`${ch.name}\``).join("\n"),
            inline: true
          },
          {
            name: "IDs",
            value: channels.map(ch => `\`${ch.id}\` ${emojis.blank}`).join("\n"),
            inline: true
          }
        ],
        color: config.embedColors.success
      }]
    }}});
    break;
  case "compact":
    client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: {
      content: channels.map(ch => `${ch.parentID ? "> " : ""}${getChannelEmoji(ch, emojis)} \`${ch.name}\` (${ch.id})`).join("\n")
    }}});
    break;
  case "ids":
    client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: {
      content: channels.map(ch => `"${ch.id}"`).join(", ")
    }}});
    break;
  }
};

function getChannelEmoji(ch, emojis) {
  if (ch.id == ch.guild.rulesChannelID) return emojis.rules;
  if (ch.type == "text" && ch.nsfw) return emojis.channelnsfw;
  if (ch.type == "text" && !ch.permissionsFor(ch.guild.roles.everyone).has("VIEW_CHANNEL")) return emojis.channellocked;
  if (ch.type == "text") return emojis.channel;
  if (ch.type == "news") return emojis.announcements;
  if (ch.type == "category") return emojis.category;
  if (ch.type == "voice" && !ch.permissionsFor(ch.guild.roles.everyone).has("CONNECT")) return emojis.voicelocked;
  if (ch.type == "voice") return emojis.voice;
  return emojis.blank;
}