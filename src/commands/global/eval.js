module.exports = {
  description: "Run JavaScript code",
  options: [
    {
      type: 3,
      name: "code",
      description: "The code you want to run",
      required: true
    }
  ],
  group: "OWNER"
};

module.exports.execute = async (client, interaction, { code }, area) => {
  try {
    let evaled = eval(code);
    if (typeof evaled != "string") evaled = require("util").inspect(evaled);
    return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `🆗 Evaluated successfully.\n\`\`\`js\n${evaled}\`\`\`` } } });
  } catch(e) {
    let error = e;
    if (typeof e == "string") error = e.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `🆘 JavaScript failed.\n\`\`\`fix\n${error}\`\`\`` } } });
  }
};