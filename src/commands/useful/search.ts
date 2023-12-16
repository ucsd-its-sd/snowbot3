import { Message, EmbedBuilder } from "discord.js";
import { Command, CommandMatch } from "../../lib/command";

export class SnowCommand extends Command {
  regex = /!(snow (?<arg>\w+)|(?<ticket>[a-zA-Z]{2,6}\d{7}))/;
  name = "!snow <ticket>, or !cs<number>, !inc<number>, etc.";
  description =
    "Posts a link to the referenced SNOW ticket. \
        The !<ticket type><number> syntax will trigger \
        for any 2-6 character ticket type, followed by exactly 7 numbers. \
        !snow does not care what its argument looks like, \
        so use it if you have a strange looking ticket.";

  async execute(msg: Message, match: CommandMatch): Promise<void> {
    const ticket = match.groups.ticket ?? match.groups.arg;
    const ticketUrl = `https://support.ucsd.edu/nav_to.do?uri=task.do?sysparm_query=number=${ticket}`;
    const ticketEmbed = new EmbedBuilder().setDescription(
      `[Ticket ${ticket.toUpperCase()}](${ticketUrl})`,
    );

    await msg.channel.send({ embeds: [ticketEmbed] });
  }
}

export class KnowledgeBaseCommand extends Command {
  regex = /!kb (?<search>.+)$/;
  name = "!kb <search terms>";
  description =
    "Searches the Knowledge Base for any text that appears \
        after the command (on the same line), \
        then sends a link to the results.";

  async execute(msg: Message, match: CommandMatch): Promise<void> {
    const args = encodeURI(match.groups.search);
    const kbUrl = `https://support.ucsd.edu/its?id=search&spa=1&q=${args}`;
    const kbEmbed = new EmbedBuilder().setDescription(
      `[Knowledge Base Search Results](${kbUrl})`,
    );

    msg.channel.send({ embeds: [kbEmbed] });
  }
}

export class CollabCommand extends Command {
  regex = /!collab (?<search>.+)$/;
  name = "!collab <search terms>";
  description =
    "Searches Confluence (Collab) for any text that appears \
        after the command (on the same line), \
        then sends a link to the results.";

  async execute(msg: Message, match: CommandMatch): Promise<void> {
    const args = encodeURI(match.groups.search);
    const collabUrl = `https://ucsdcollab.atlassian.net/wiki/search?spaces=CKB&text=${args}`;
    const collabEmbed = new EmbedBuilder().setDescription(
      `[Collab Search Results](${collabUrl})`,
    );

    await msg.channel.send({ embeds: [collabEmbed] });
  }
}

export class MailUpdCommand extends Command {
  regex = /!p (?<user>\w+)/;
  name = "!p <username>";
  description = "Posts a link to a user's MailUPD page";

  async execute(msg: Message, match: CommandMatch): Promise<void> {
    const user = match.groups.user.toLowerCase();
    const mailUpdUrl = `https://mailupd.ucsd.edu/view?id=${user}`;
    const mailUpdEmbed = new EmbedBuilder().setDescription(
      `[MailUPD page for ${user}](${mailUpdUrl})`,
    );

    await msg.channel.send({ embeds: [mailUpdEmbed] });
  }
}

export class SalCommand extends Command {
  regex = /!sal (?<pid>\w+)/;
  name = "!sal <PID>";
  description = "Posts a link to a user's SAL page";

  async execute(msg: Message, match: CommandMatch): Promise<void> {
    const pid = match.groups.pid.toLowerCase();
    const salUrl = `https://sal.ucsd.edu/students/${pid}`;
    const salEmbed = new EmbedBuilder().setDescription(
      `[SAL page for ${pid}](${salUrl})`,
    );

    await msg.channel.send({ embeds: [salEmbed] });
  }
}
