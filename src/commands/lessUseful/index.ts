import { ICommandModule } from '../../commandModule';
import { CallResponseCommand } from '../callResponse';

export class LessUsefulCommandModule implements ICommandModule {
    commands = [
        new CallResponseCommand("!ping", "pong"),
        new CallResponseCommand("!sleep", "go to bed"),
        new CallResponseCommand("!aloha", "World class customer service!"),
    ];
    helpCommand = null;
}