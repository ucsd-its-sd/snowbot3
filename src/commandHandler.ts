import { Message } from "discord.js";
import { ICommandModule } from "./commandModule";
import { Command, CommandMatch } from "./command";
import { IStateContainer } from "./stateContainer";
import { State } from "./state";

export class CommandHandler {
    modules: ICommandModule[];

    helpCommands: Command[];

    state: IStateContainer<State>;

    private combinedRegex: RegExp;

    constructor(state: IStateContainer<State>, modules: ICommandModule[]) {
        this.state = state;
        this.modules = modules;

        // Initialize the regex.
        this.combinedRegex = this.buildRegex();

        this.helpCommands = modules.map(m => this.generateHelpCommand(m))

        // Subscribe to each module's rebuild event.
        for (const module of modules) {
            module.addEventListener('rebuild', this.onRebuild);
        }
    }

    execute(msg: Message): void {
        let matches = msg.content.matchAll(this.combinedRegex);
        // For every matched command:
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

            // Run the matched command
            command.execute(msg, commandMatch, this.state);
        }
    }

    private onRebuild(event: Event): void {
        const index = this.modules.indexOf(event.target as ICommandModule)
        this.helpCommands[index] = this.generateHelpCommand(this.modules[index]);

        this.combinedRegex = this.buildRegex();
    }

    private generateHelpCommand(module: ICommandModule): Command {

    }

    private buildRegex(): RegExp {
        const namedGroupRegex = /\(\?<(\w+)>/g;

        // Combine all the regexes with alternation.
        return new RegExp(
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
}