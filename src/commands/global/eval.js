module.exports = {
  description: "Run JavaScript code",
  options: [
    {
      type: 3,
      name: "code",
      description: "The code you want to run",
      required: true
    },
    {
      type: 5,
      name: "plaintext",
      description: "Output in plain text"
    }
  ],
  group: "OWNER"
};

module.exports.execute = async (client, interaction, { code, plaintext = false }, { success, error }) => {
  try {
    let evaled = eval(code);
    if (typeof evaled != "string") evaled = require("util").inspect(evaled);
    return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: plaintext ? evaled : `${success} Evaluated successfully.\n\`\`\`js\n${evaled}\`\`\`` } } });
  } catch(e) {
    let err = e;
    if (typeof e == "string") err = e.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { content: `${error} JavaScript failed.\n\`\`\`fix\n${err}\`\`\`` } } });
  }
};