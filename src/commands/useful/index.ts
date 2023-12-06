import { CommandModule } from "../../lib/command";
import * as utility from "./utility";
import * as search from "./search";
import { CallResponseCommand } from "../callResponse";

export class UsefulCommandModule extends CommandModule {
  commands = [
    new search.SnowCommand(),
    new search.KnowledgeBaseCommand(),
    new search.CollabCommand(),
    new search.MailUpdCommand(),
    new search.SalCommand(),
    new utility.ListCommand(),
    new CallResponseCommand(
      "!fs",
      "https://cdn.discordapp.com/attachments/765777043639762948/784567793047699496/fs-map.png",
      "Posts the Field Support map",
    ),
    new CallResponseCommand(
      "!nato",
      "https://media.discordapp.net/attachments/765777043639762948/886307401106604123/GettyImages-1060490970-dcac66d9cda841638d49bc10f5dc1a8b.webp",
      "Posts the NATO alphabet",
    ),
  ];

  helpCommand = "!help";
  helpTitle = "Help";
}
