module.exports = {
  description: "Revoke someone's access from the bot",
  options: [
    {
      type: 6,
      name: "user",
      description: "The user you want to revoke access from",
      required: true
    }
  ],
  group: "OWNER"
};

const { access } = require("../../../database");

module.exports.execute = async (client, interaction, { user }, { success }) => {
  await access.unset(user);

  const dUser = interaction.data.resolved.users[user], tag = `${dUser.username}#${dUser.discriminator}`;
  client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${success} User \`${tag}\` no longer has access to manage testing areas.` } } });
};