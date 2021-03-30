module.exports = {
  description: "Get an invite to add the bot for easy management of your test areas.",
  group: "OWNER"
};

module.exports.execute = async (client, interaction, _, { link }) => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${link} Authorize me in your server: <https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands>` } } });