import type{ FirstLevelChatInputCommand } from "..";
import subcommandList from "./list";
import subcommandNew from "./new";
import subcommandRemove from "./remove";

export default {
  name: "testarea",
  description: "Sub-command for administrating test areas",
  worksIn: ["test-areas", "non-test-areas"],
  subcommands: [
    subcommandList,
    subcommandNew,
    subcommandRemove,
  ],
} as FirstLevelChatInputCommand;
