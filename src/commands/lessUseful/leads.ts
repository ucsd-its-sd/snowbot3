import { Message } from "discord.js";
import { Command, CommandMatch } from "../../command";
import { IStateContainer } from "../../stateContainer";
import { State } from "../../state";

export class LeadCommand implements Command {
    regex = /^!lead (?<ping><@\d+>) (add (?<add_name>\w+) (?<add_emote><(?<add_emote_name>:\w+:)\d+>)|fireable (?<fired_bool>true|false)|remove)$/;
    name = "!lead";

    execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
        const ping = match.groups.ping;

        if (match.groups.add_name) {
            const name = match.groups.add_name;
            const emote = match.groups.add_emote;
            const emoteName = match.groups.add_emote_name;

            let currState = state.read();

            // Don't add if they already exist.
            if (currState.leads.find(lead => lead.ping == ping)) {
                msg.channel.send(`${name} is already a lead.`);
                return;
            }

            // Don't use emotes twice.
            if (currState.leads.find(lead => lead.emote == emote)) {
                msg.channel.send(`${emote} is already in use.`);
                return;
            }

            // Push new lead (using name punning)
            currState.leads.push({ name, ping, emote, emoteName });
            state.write(currState);

            msg.channel.send(`Added ${name} as a lead.`);
        } else if (match.groups.fired_bool) {
            // If they are not fireable, dontFire is true.
            const dontFire = match.groups.fired_bool == "false";

            let currState = state.read();

            // Save some time by saving the index.
            const lead = currState.leads.findIndex(lead => lead.ping == ping);

            // If the index doesn't exist, can't edit.
            if (lead == -1) {
                msg.channel.send(`${ping} is not a lead.`);
                return;
            }

            // Set their fireability explicitly.
            currState.leads[lead].dontFire = dontFire;
            state.write(currState);

            msg.channel.send(`${currState.leads[lead].name} will ${dontFire ? "not " : ""}be pinged by !fired.`);
        } else {
            let currState = state.read();

            // Save some time by saving the index.
            const lead = currState.leads.findIndex(lead => lead.ping == ping);

            // If the index doesn't exist, can't edit.
            if (lead == -1) {
                msg.channel.send(`${ping} is not a lead.`);
                return;
            }

            // Save the name, since we're deleting them.
            const name = currState.leads[lead].name;

            // Remove the lead at this index.
            currState.leads.splice(lead, 1);
            state.write(currState);

            msg.channel.send(`Removed ${name} as a lead.`);
        }
    }
}