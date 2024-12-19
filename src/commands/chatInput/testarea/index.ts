import type{ FirstLevelChatInputCommand } from "..";
import list from "./list";
import _new from "./new";
import remove from "./remove";

export default {
  name: "testarea",
  description: "Sub-command for administrating test areas",
  applicableTo: ["main"],
  subcommands: [list, _new, remove],
} satisfies FirstLevelChatInputCommand;
