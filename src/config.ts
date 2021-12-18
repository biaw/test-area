import { config } from "dotenv";
config();

const {
  DISCORD_TOKEN,
  DISCORD_OWNER_ID,
  EMOJI_REFRESH,
} = process.env;

if (!DISCORD_TOKEN) throw new Error("Environment variable DISCORD_TOKEN is required");
if (!DISCORD_OWNER_ID) throw new Error("Environment variable DISCORD_OWNER_ID is required");

export default {
  DISCORD_TOKEN,
  DISCORD_OWNER_ID,
  EMOJI_REFRESH: EMOJI_REFRESH === "true",
};
