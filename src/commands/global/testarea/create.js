module.exports = {
  description: "Create a testing area and return an invite to it",
  options: [
    {
      type: 3,
      name: "name",
      description: "The name of the testing area",
      required: true
    },
    {
      type: 4,
      name: "channels",
      description: "The amount of testing channels you want to be created. Default is 3"
    },
    {
      type: 5,
      name: "auto_admin",
      description: "Give users admin when they join the server. Default is false"
    },
    {
      type: 3,
      name: "admin_vc",
      description: "If you want a channel created to easily toggle the admin role. Default is true"
    },
    {
      type: 3,
      name: "admin_public",
      description: "Make the /admin command public. Default is true"
    }
  ],
  group: "ACCESS"
};

const { areas, emojis } = require("../../../database");

module.exports.execute = async (client, interaction, { name, channels = 3, auto_admin = false, admin_vc = true, admin_public = true }) => {
  if (client.guilds.cache.size >= 10) return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: "❌ I can't create more testing areas, I have reached Discord's limit of 10 guilds per bot." } } });

  await client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 5 } });

  const newGuild = await client.guilds.create(name, {
    channels: [
      {
        id: 1001,
        name: "entry-log",
        permissionOverwrites: [
          {
            id: 2001,
            deny: [ "SEND_MESSAGES", "ADD_REACTIONS" ]
          },
          {
            id: 2002,
            deny: [ "VIEW_CHANNEL" ]
          }
        ]
      },
      {
        id: 1002,
        name: "general",
        permissionOverwrites: [
          {
            id: 2002,
            deny: [ "VIEW_CHANNEL" ]
          }
        ]
      },
      admin_vc ? {
        id: 1003,
        name: "Toggle Administrator",
        type: "voice",
      } : null,
      ...(channels ? [
        {
          id: 1004,
          type: "category",
          name: "Testing Channels"
        },
        ...Array(channels).fill(true).map((_, i) => ({
          name: `test-channel-${i + 1}`,
          parentID: 1004
        }))
      ] : []),
    ].filter(ch => ch),
    defaultMessageNotifications: "MENTIONS",
    explicitContentFilter: "DISABLED",
    roles: [
      {
        id: 2001,
        name: "everyone",
        permissions: [
          "ADD_REACTIONS",
          "VIEW_AUDIT_LOG",
          "VIEW_CHANNEL",
          "SEND_MESSAGES",
          "EMBED_LINKS",
          "ATTACH_FILES",
          "READ_MESSAGE_HISTORY",
          "USE_EXTERNAL_EMOJIS",
          "CONNECT",
          "SPEAK",
          "USE_VAD",
          "CHANGE_NICKNAME"
        ]
      },
      {
        id: 2002,
        name: "Bot",
        color: "GREY",
        hoist: true,
        permissions: [] // inherits @everyone permissions
      },
      {
        id: 2003,
        name: "Administrator",
        color: "RED",
        permissions: "ADMINISTRATOR"
      }
    ],
    systemChannelID: 1001,
    verificationLevel: "NONE"
  });
  
  const entryChannel = newGuild.channels.cache.find(ch => ch.name == "entry-log"), newInvite = await entryChannel.createInvite({ maxAge: 0 });
  entryChannel.send(`${await emojis.get("slash")} To set up test area slash commands in this server, please authorize me: <https://discord.com/oauth2/authorize?client_id=${client.user.id}&guild_id=${newGuild.id}&scope=applications.commands> and then write \`/setup\`.`).then(m => m.pin())

  const toggleadmin = newGuild.channels.cache.find(ch => ch.name == "Toggle Administrator");

  areas.set(newGuild.id, {
    code: newInvite.code,
    creator: interaction.member.user.id,
    roles: {
      admin: newGuild.roles.cache.find(r => r.name == "Administrator").id,
      bot: newGuild.roles.cache.find(r => r.name == "Bot").id
    },
    settings: {
      auto_admin,
      admin_vc: toggleadmin ? toggleadmin.id : null,
      admin_public
    }
  });

  return client.api.webhooks(client.user.id, interaction.token).messages["@original"].patch({ data: { content: `✅ Successfully created a test area for you. Here's an invite: https://discord.gg/${newInvite.code}` }});
};