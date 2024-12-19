import { Colors } from "discord.js";
import "dotenv/config";

// test environment
if (
  !process.env["CLIENT_TOKEN"] ||
  !process.env["WORKER_TOKENS"] ||
  !process.env["DATABASE_URI"] ||
  !process.env["OWNER_ID"]
) throw new Error("Missing environment variables, please check the README for more information on how you can set your environment variables..");

// export config
const config = {
  clientToken: process.env["CLIENT_TOKEN"],
  workerTokens: process.env["WORKER_TOKENS"]
    .split(",")
    .map(token => token.trim())
    .filter(Boolean),
  ownerId: process.env["OWNER_ID"],

  databaseUri: process.env["DATABASE_URI"],

  themeColor: parseInt(process.env["THEME_COLOR"] ?? "0", 16) || Colors.Blurple,
  limitAmountOfAreasPerUser: parseInt(process.env["AREA_LIMIT_PER_USER"] ?? "10", 10),
} as const;

if (config.workerTokens.includes(config.clientToken)) throw new Error("You need to supply a separate bot token to be a worker, they cannot work alongside each other.");
if (!config.workerTokens.length) throw new Error("You need to supply at least one worker token. If you want more than one worker then you can separate the tokens with a comma.");

export default config;
