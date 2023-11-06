import { Message, EmbedBuilder } from "discord.js";
import { Command, CommandMatch } from "../../command";

export class SnowCommand implements Command {
    regex = /!(snow (?<arg>\w+)|(?<ticket>[a-zA-Z]{2,6}\d{7}))/;
    name = "!snow <ticket>, or !cs<number>, !inc<number>, etc.";
    description =
        "Posts a link to the referenced SNOW ticket. \
        The !<ticket type><number> syntax will trigger \
        for any 2-6 character ticket type, followed by exactly 7 numbers. \
        !snow does not care what its argument looks like, \
        so use it if you have a strange looking ticket.";

    execute(msg: Message, match: CommandMatch): void {
        const ticket = match.groups.ticket ?? match.groups.arg;
        const ticketUrl = `https://support.ucsd.edu/nav_to.do?uri=task.do?sysparm_query=number=${ticket}`;
        const ticketEmbed = new EmbedBuilder().setDescription(
            `[Ticket ${ticket.toUpperCase()}](${ticketUrl})`
        );

        msg.channel.send({ embeds: [ticketEmbed] });
    }
}
