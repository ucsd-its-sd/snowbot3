import { Message } from "discord.js";
import { Command, CommandMatch } from "../../command";
import { IStateContainer } from "../../stateContainer";
import { State } from "../../state";

export class LeadCommand implements Command {
    regex = /^!lead (add (?<add_ping><@\d+>) (?<add_name>\w+) (?<add_emote><(?<add_emote_name>:\w+:)\d+>)|remove (?<remove_ping><@\d+>)|fireable (?<fired_ping><@\d+>) (?<fired_bool>true|false))$/;
    name = "!lead";

    execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
        if (match.groups.add_ping) {
            const ping = match.groups.add_ping;
            const name = match.groups.add_name;
            const emote = match.groups.add_emote;
            const emoteName = match.groups.add_emote_name;

            let currState = state.read();

            if (currState.leads.find(lead => lead.ping == ping)) {
                msg.channel.send(`${name} is already a lead.`);
                return;
            }

            if (currState.leads.find(lead => lead.emote == emote)) {
                msg.channel.send(`${emote} is already in use.`);
                return;
            }

            currState.leads.push({ name, ping, emote, emoteName });
            state.write(currState);

            msg.channel.send(`Added ${name} as a lead.`);
        } else if (match.groups.remove_ping) {
            const ping = match.groups.remove_ping;

            let currState = state.read();

            const lead = currState.leads.findIndex(lead => lead.ping == ping);

            if (lead == -1) {
                msg.channel.send(`${ping} is not a lead.`);
                return;
            }

            const name = currState.leads[lead].name;

            currState.leads.splice(lead, 1);
            state.write(currState);

            msg.channel.send(`Removed ${name} as a lead.`);
        } else {
            const ping = match.groups.fired_ping;

            // If they are not fireable, dontFire is true.
            const dontFire = match.groups.fired_bool == "false";

            let currState = state.read();

            const lead = currState.leads.findIndex(lead => lead.ping == ping);

            if (lead == -1) {
                msg.channel.send(`${ping} is not a lead.`);
                return;
            }

            currState.leads[lead].dontFire = dontFire;
            state.write(currState);

            msg.channel.send(`${currState.leads[lead].name} will ${dontFire ? "not " : ""}be pinged by !fired.`);
        }
    }
}