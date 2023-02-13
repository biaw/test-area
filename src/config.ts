import { config } from "dotenv";

config();

export default {
  client: {
    id: String(process.env["CLIENT_ID"]),
    token: String(process.env["CLIENT_TOKEN"]),
  },
  workerTokens: String(process.env["WORKER_TOKENS"]).split(","),

  databaseUri: String(process.env["DATABASE_URI"]),

  ownerId: String(process.env["OWNER_ID"]),

  themeColor: parseInt(process.env["THEME_COLOR"] ?? "0", 16) || 0x5865F2,
} as const;
