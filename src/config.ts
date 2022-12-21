import "dotenv/config";

export default {
  client: {
    id: String(process.env["CLIENT_ID"]),
    token: String(process.env["CLIENT_TOKEN"]),
  },

  databaseUri: String(process.env["DATABASE_URI"]),

  ownerId: String(process.env["OWNER_ID"]),
  guildId: String(process.env["GUILD_ID"]),

  themeColor: parseInt(process.env["THEME_COLOR"] ?? "0", 16) || 0x5865F2,

  github: {
    token: String(process.env["GITHUB_TOKEN"]),
    tokenreset: {
      repo: String(process.env["TOKENRESET_GITHUB_REPOSITORY"]),
      committer: {
        name: String(process.env["TOKENRESET_GITHUB_COMMITTER_NAME"]),
        email: String(process.env["TOKENRESET_GITHUB_COMMITTER_EMAIL"]),
      },
    },
  },
} as const;
