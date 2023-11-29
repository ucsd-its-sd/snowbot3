import { ICommandModule } from '../../commandModule';
import { CallResponseCommand } from '../callResponse';
import { FiredHiredCommand } from './fired';
import { LeadCommand } from './leads';

export class LessUsefulCommandModule extends EventTarget implements ICommandModule {
    commands = [
        new FiredHiredCommand(),
        new LeadCommand(),
        new CallResponseCommand("!ping", "pong"),
        new CallResponseCommand("!sleep", "go to bed"),
        new CallResponseCommand("!aloha", "World class customer service!"),
    ];
}