import { Guild, Role } from "discord.js";
import { IStateContainer, State } from "../state";

import { setTimeout } from "timers/promises";
import { Shifts } from "./shifts";

type Day = [number, number, number];
type Time = [number, number];

export class WhenIWorkManager {
  readonly openingTime: Time = [6, 45];
  readonly closingTime: Time = [22, 15];

  today: Day = undefined!;
  currTime: Time = [0, 0];

  // TODO: Temporary until es2024 support
  onShift: Set<number> & { difference(other: Set<number>): Set<number> } =
    new Set() as Set<number> & { difference(other: Set<number>): Set<number> };

  private guild: Guild;
  private state: IStateContainer<State>;

  private roles: Record<string, Role> = {}!;

  constructor(guild: Guild, state: IStateContainer<State>) {
    this.guild = guild;
    this.state = state;
  }

  async begin(): Promise<void> {
    const currState = await this.state.read();

    let allRoles = await this.guild.roles.fetch();
    this.roles.onShift = allRoles.find((role) => role.name == "On Shift")!;
    this.roles.frontDesk = allRoles.find(
      (role) => role.name == "Front Desk On Shift",
    )!;
    this.roles.classroom = allRoles.find(
      (role) => role.name == "Classroom On Shift",
    )!;
    this.roles.leads = allRoles.find((role) => role.name == "Leads On Shift")!;

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
        let snowflake = currState.whenIWork.userDict.get(id)?.snowflake;

        if (!snowflake) continue;

        let member = await this.guild.members.fetch(snowflake);

        await member.roles.remove(this.onShiftRole);
      }

      // Clear the set, as no one is on shift anymore
      this.onShift.clear();
    } else {
      // Request shifts at current time
      // (one minute added to end to prevent it from complaining)
      let req: RequestInit = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currState.whenIWork.token}`,
        },
      };
      let res = await fetch(
        `https://api.wheniwork.com/2/shifts?\
        start=${this.currTime[0]}:${this.currTime[1]}&\
        end=${this.currTime[0]}:${this.currTime[1] + 1}`,
        req,
      );

      // Check if request succeeded
      if (!res.ok) {
        console.error("Failed to get shifts");
        return;
      }

      // If we successfully got shifts, update the on-shift set
      let data: Shifts = await res.json();

      let currOnShift = new Set<number>();

      for (let shift of data.shifts) {
        currOnShift.add(shift.user_id);

        if (this.onShift.has(shift.user_id)) continue;

        let user = currState.whenIWork.userDict.get(shift.user_id);

        if (user) {
          user.scheduled = true;

          let member = await this.guild.members.fetch(user.snowflake);

          await member.roles.add(this.onShiftRole);
        }
      }

      let offShift = this.onShift.difference(currOnShift);

      for (let id of offShift) {
        let user = currState.whenIWork.userDict.get(id);

        if (user) {
          user.scheduled = false;

          if (!user.punched) {
            let member = await this.guild.members.fetch(user.snowflake);

            await member.roles.remove(this.onShiftRole);
          }
        }
      }

      // TODO: Temporary until es2024 support
      this.onShift = currOnShift as Set<number> & {
        difference(other: Set<number>): Set<number>;
      };

      // Write the updated state
      await this.state.write(currState);
    }
  }

  private async updateTime(): Promise<number> {
    if (this.currTime == this.closingTime) {
      // If we're at closing time, set the next time to opening time tomorrow
      const tmrw = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.today = [tmrw.getFullYear(), tmrw.getMonth(), tmrw.getDate()];
      this.currTime = this.openingTime;

      // Check if we have to update the token (we want to do this at least once a day)
      this.updateToken();
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

  private async updateToken(): Promise<void> {
    const currState = await this.state.read();
    let timeSinceIssue = Date.now() - currState.whenIWork.iat;

    // 2 days before expiration, according to When I Work
    if (timeSinceIssue > 5 * 24 * 60 * 60 * 1000) {
      let req: RequestInit = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currState.whenIWork.token}`,
        },
      };
      let res = await fetch("https://api.wheniwork.com/2/refresh", req);

      // Check if request succeeded
      if (!res.ok) {
        console.error("Failed to refresh token");
        return;
      }

      // If we successfully refreshed, replace the token and issue time
      let data = await res.json();
      currState.whenIWork.token = data.token;
      currState.whenIWork.iat = Date.now();
      await this.state.write(currState);
    }
  }
}
