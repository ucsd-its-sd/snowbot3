import { Message } from "discord.js";
import { CommandModule } from "./commandModule";
import { CommandMatch } from "./command";

export class CommandHandler {
    modules: CommandModule[];

    private combinedRegex: RegExp;

    constructor(modules: CommandModule[]) {
        this.modules = modules;

        const namedGroupRegex = /\(\?<(\w+)>/g;

        // Combine all the regexes with alternation.
        this.combinedRegex = new RegExp(
            this.modules
                .flatMap((m, i) => m.commands.map((c, j) => {
                    let regText = c.regex.source;
                    // Adds a prefix to each named group to avoid collisions
                    let result = regText.replace(namedGroupRegex, `(?<_${i}_${j}_$1>`);
                    // Wraps the regex in a named group
                    return `(?<_${i}_${j}>${result})`;
                }))
                .join('|'),
            'digm');
    }

    execute(msg: Message): void {
        let matches = msg.content.matchAll(this.combinedRegex);
        for (let match of matches) {
            // Get all groups that are not undefined (i.e. only the alternation that matched)
            let matches = Object.entries(match.groups!)
                .filter(([k, v]) => v != undefined)

            // The first of these matches will be the whole group, and it will have a name that is the prefix
            let prefix = matches[0][0];

            let commandMatch: CommandMatch = {
                // The 0th group is the entire match
                content: match[0],
                // Remove the prefix from the remaining group names
                groups: Object.fromEntries(matches.slice(1).map(([k, v]) => [k.slice(prefix.length + 1), v])),
                // The range of the 0th group
                range: match.indices![0],
            };

            // Get the index of the module and the command from the prefix name
            let [mi, ci] = prefix.split('_').slice(1).map(x => parseInt(x));
            let command = this.modules[mi].commands[ci];

            command.execute(msg, commandMatch);
        }
    }
}