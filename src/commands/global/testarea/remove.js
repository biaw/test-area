module.exports = {
  description: "List all the testing areas currently available",
  options: [
    {
      type: 3,
      name: "guild_id",
      description: "The ID of the guild you want to remove",
      required: true
    }
  ],
  group: "ACCESS"
};

const { areas } = require("../../../database");

module.exports.execute = async (client, interaction, { guild_id }, { success, error }) => {
  const guild = await areas.get(guild_id), dGuild = client.guilds.cache.get(guild_id);
  if (!guild || !dGuild) return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${error} No testing areas with that guild ID was found.` } } });

  dGuild.delete()
    .then(() => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${success} The testing area has been deleted.` } } }))
    .catch(() => client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${error} The testing area could not be deleted.` } } }));
};