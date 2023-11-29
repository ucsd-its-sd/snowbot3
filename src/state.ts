export interface State {
    token: string;

    leads: Lead[];
}

export interface Lead {
    name: string;

    /** Of the format <@number>. */
    ping: string;

    /** Of the format <:name:number>, unless it is a default emoji. */
    emote: string;

    /** Of the format :name: */
    emoteName: string;

    /** Whether the lead is opted-out from firing */
    dontFire?: boolean;
}