import { APIEmbedField, EmbedBuilder, Message } from "discord.js";
import { ICommandModule } from "./commandModule";
import { Command, CommandMatch } from "./command";
import { IStateContainer } from "./stateContainer";
import { State } from "./state";

export class CommandHandler {
    modules: ICommandModule[];

    helpCommands: (Command | null)[];

    state: IStateContainer<State>;

    private combinedRegex: RegExp;

    constructor(state: IStateContainer<State>, modules: ICommandModule[]) {
        this.state = state;
        this.modules = modules;

        // Initialize help commands.
        this.helpCommands = modules.map(m => this.generateHelpCommand(m))

        // Initialize the regex.
        this.combinedRegex = this.buildRegex();

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
            let groups = Object.entries(match.groups!)
                .filter(([k, v]) => v != undefined)

            // The first of these matches will be the whole group, and it will have a key that is the prefix
            let prefix = groups[0][0];

            let commandMatch: CommandMatch = {
                // The 0th group is the entire match
                content: match[0],
                // Remove the prefix from the remaining group names
                groups: Object.fromEntries(groups.slice(1).map(([k, v]) => [k.slice(prefix.length + 1), v])),
                // The range of the 0th group
                range: match.indices![0],
            };

            // Get the index of the module and the command from the prefix name
            let [mi, ci] = prefix.split('_').slice(1).map(x => parseInt(x));
            let command = ci == 0 ? this.helpCommands[mi]! : this.modules[mi].commands[ci - 1];

            // Run the matched command
            command.execute(msg, commandMatch, this.state);
        }
    }

    /**
     * Runs whenever a module dispatches the rebuild event.
     * Recreates the regex and help command for that module.
     */
    private onRebuild(event: Event): void {
        // Find the module in our list, then assign the relevant help command.
        const index = this.modules.indexOf(event.target as ICommandModule)
        this.helpCommands[index] = this.generateHelpCommand(this.modules[index]);

        // Rebuild the regex.
        this.combinedRegex = this.buildRegex();
    }

    /** Generates a help command for the given module. */
    private generateHelpCommand(module: ICommandModule): Command | null {
        if (module.helpCommand == undefined || module.helpTitle == undefined) return null;

        // Technically we have to narrow this now, because at execution
        // we don't know that its not undefined (even though it wont be)
        const titleNarrowed: string = module.helpTitle;

        return {
            name: module.helpCommand,
            regex: new RegExp(module.helpCommand),
            execute: msg => {
                const helpFields: APIEmbedField[] = module.commands
                    .map(c => ({ name: c.name, value: c.description ?? "" }));

                const helpEmbed = new EmbedBuilder()
                    .setColor(0x442691)
                    .setTitle(titleNarrowed)
                    .addFields(...helpFields);

                msg.channel.send({ embeds: [helpEmbed] });
            },
        };
    }

    /** Builds the regex from the modules and help commands. */
    private buildRegex(): RegExp {
        const namedGroupRegex = /\(\?<(\w+)>/g;

        // Combine all the regexes with alternation.
        let regex = new RegExp(
            this.modules
                .flatMap((m, i) => {
                    const help = this.helpCommands[i];
                    // If there is a help command, add it to the list of commands
                    const commands = help ? [help].concat(m.commands) : m.commands;
                    // If there isn't, we need an offset so index 0 is always help
                    const offset = help ? 0 : 1;

                    return commands.map((c, j) => {
                        let cmdI = j + offset;
                        let regText = c.regex.source;

                        // Adds a prefix to each named group to avoid collisions
                        let result = regText.replace(namedGroupRegex, `(?<_${i}_${cmdI}_$1>`);

                        // Wraps the regex in a named group
                        return `(?<_${i}_${cmdI}>${result})`;
                    });
                })
                .join('|'),
            'digm');

        return regex;
    }
}