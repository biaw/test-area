module.exports = {
  description: "Grant someone access to use this bot and create test areas themselves",
  options: [
    {
      type: 6,
      name: "user",
      description: "The user you want to grant access to",
      required: true
    }
  ],
  group: "OWNER"
};

const { access } = require("../../../database");

module.exports.execute = async (client, interaction, { user }, { success }) => {
  await access.set(user, true);

  const dUser = interaction.data.resolved.users[user], tag = `${dUser.username}#${dUser.discriminator}`;
  client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${success} User \`${tag}\` now has access to manage testing areas.` } } });
};