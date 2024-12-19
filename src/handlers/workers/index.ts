import config from "../../config";
import { TestArea } from "../../database/models/TestArea";
import mainLogger from "../../utils/logger/main";
import Worker from "./Worker";

export default function handleWorkers(): void {
  void initWorkers().then(() => mainLogger.info("Workers initialized."));
}

async function initWorkers(): Promise<void> {
  for (const token of config.workerTokens) await new Worker(token).login();
  for (const [, worker] of Worker.workers) {

    // since Worker.ts is importing TestArea.ts and vice versa, we need to do these things in a separate file unfortunately.
    worker.client.on("messageCreate", message => message.guild && void TestArea.findOne({ guildId: message.guild.id }).then(testArea => {
      if (testArea) {
        testArea.lastActivityAt = new Date();
        void testArea.save();
      }
    }));

    worker.client.on("guildMemberAdd", member => void TestArea.findOne({ guildId: member.guild.id }).then(testArea => void testArea?.updateRoles()));
  }
}
