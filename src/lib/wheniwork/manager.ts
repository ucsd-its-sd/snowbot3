import { Guild, Role } from "discord.js";
import { IStateContainer, State } from "../state";

import { setTimeout } from "timers/promises";

type Day = [number, number, number];
type Time = [number, number];

export class WhenIWorkManager {
  readonly openingTime: Time = [6, 45];
  readonly closingTime: Time = [22, 15];

  today: Day = undefined!;
  currTime: Time = [0, 0];

  onShift: Set<number> = new Set();

  private guild: Guild;
  private state: IStateContainer<State>;

  private onShiftRole: Role = undefined!;

  constructor(guild: Guild, state: IStateContainer<State>) {
    this.guild = guild;
    this.state = state;
  }

  async begin(): Promise<void> {
    const currState = await this.state.read();

    let allRoles = await this.guild.roles.fetch();
    this.onShiftRole = allRoles.find((role) => role.name == "On Shift")!;

    // Set up the onShift set to mirror the current state
    for (let [id, user] of currState.whenIWork.userDict) {
      if (user.scheduled || user.punched) this.onShift.add(id);
    }

    // Initialize state and get the time to wait
    let millis = await this.init();

    // Continue forever
    while (true) {
      // Wait until the next check
      await setTimeout(millis);

      // Update on-shift status
      await this.updateStatus();

      // Update current time and get time to wait
      millis = await this.updateTime();
    }
  }

  /// Set up the initial state, return milliseconds until next check
  private async init(): Promise<number> {
    // Get the current date, and calculate the closing time
    const now = new Date();
    this.today = [now.getFullYear(), now.getMonth(), now.getDate()];
    const closing = new Date(...this.today, ...this.closingTime);

    // If we're past closing, use the opening time for tomorrow; otherwise, use today
    let opening: Date;
    if (now > closing) {
      const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      this.today = [tmrw.getFullYear(), tmrw.getMonth(), tmrw.getDate()];
      opening = new Date(...this.today, ...this.openingTime);
    } else {
      opening = new Date(...this.today, ...this.openingTime);
    }

    let millis: number;
    if (now < opening) {
      // If we haven't opened yet, wait until opening time
      this.currTime = this.openingTime;
      millis = opening.getTime() - now.getTime();
    } else {
      // If we're open, find the next quarter-hour (either round up to 15 or add an hour)
      if (now.getMinutes() <= 45) {
        this.currTime = [
          now.getHours(),
          (Math.ceil(now.getMinutes() / 15) % 4) * 15,
        ];
      } else {
        this.currTime = [now.getHours() + 1, 0];
      }

      // Calculate millis until that time
      let nextDate = new Date(...this.today, ...this.currTime);
      millis = nextDate.getTime() - now.getTime();
    }

    return millis;
  }

  private async updateStatus(): Promise<void> {
    let currState = await this.state.read();

    if (this.currTime == this.closingTime) {
      // Remove the On Shift role from each user
      for (let id of this.onShift) {
        let snowflake = currState.whenIWork.userDict.get(id)!.snowflake;

        let member = await this.guild.members.fetch(snowflake);

        await member.roles.remove(this.onShiftRole);
      }

      // Clear the set, as no one is on shift anymore
      this.onShift.clear();
    } else {
      // Query to
      // https://api.wheniwork.com/2/shifts?start=${currTime[0]}:${currTime[1]}&end=${currTime[0]}:${currTime[1]+1}
      // to get the list of users on shift
    }
  }

  private async updateTime(): Promise<number> {
    if (this.currTime == this.closingTime) {
      // If we're at closing time, set the next time to opening time tomorrow
      const tmrw = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.today = [tmrw.getFullYear(), tmrw.getMonth(), tmrw.getDate()];
      this.currTime = this.openingTime;
    } else if (this.currTime[1] == 45) {
      // If we're at X:45, set the next time to X+1:00
      this.currTime[0]++;
      this.currTime[1] = 0;
    } else {
      // Otherwise, set the next time to the next quarter-hour
      this.currTime[1] += 15;
    }

    // Calculate millis until the next time, then return
    let nextDate = new Date(...this.today, ...this.currTime);
    return nextDate.getTime() - Date.now();
  }
}
