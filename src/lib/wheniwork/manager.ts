import { Guild, Snowflake } from "discord.js";
import { setTimeout } from "timers/promises";

import jwt from "jsonwebtoken";

import { IStateContainer, State } from "../state";
import { Shifts } from "./shifts";

type Day = [number, number, number];
type Time = [number, number];

type Role = "On Shift" | "Leads" | "Front Desk" | "Classroom";

export class WhenIWorkManager {
  readonly openingTime: Time = [6, 45];
  readonly closingTime: Time = [22, 15];

  today: Day = undefined!;
  currTime: Time = [0, 0];

  // Map from user id to shift list
  roles: Record<string, Role[]> = {};

  // Map from shift name to role id
  private readonly roleToId: Record<Role, Snowflake> = {
    "On Shift": "1263611460630614036",
    Leads: "1263611472513208401",
    "Front Desk": "1263611467257610241",
    Classroom: "1263611469803552957",
  };

  private guild: Guild;
  private state: IStateContainer<State>;

  constructor(guild: Guild, state: IStateContainer<State>) {
    this.guild = guild;
    this.state = state;
  }

  async begin(): Promise<void> {
    const currState = await this.state.read();

    // Mark those who were saved as on shift so we can remove their lingering roles
    for (let id in currState.whenIWork.userDict) {
      let user = currState.whenIWork.userDict[id];

      if (user && (user.scheduled || user.punched)) {
        this.roles[id] = [];
      }
    }

    // Initialize state and get the time to wait
    let millis = await this.init();

    // Continue forever
    while (true) {
      console.info(
        `[INFO] [When I Work] Next status check in ${(millis / 1000 / 60).toPrecision(4)} minutes`,
      );
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

    // Check if we're closed, if we are clear everything
    if (
      this.currTime[0] == this.closingTime[0] &&
      this.currTime[1] == this.closingTime[1]
    ) {
      // Remove all roles from each user
      for (let id in this.roles) {
        let ping = currState.whenIWork.userDict[id]?.ping;

        if (!ping) continue;

        let member = await this.guild.members.fetch(ping.slice(2, -1));
        for (let role of this.roles[id]) {
          await member.roles.remove(this.roleToId[role]);
        }
      }

      // Clear the set, as no one is on shift anymore
      this.roles = {};
    } else {
      // Request shifts for the current time
      // (one minute added to end to prevent it from complaining)
      let req: RequestInit = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currState.whenIWork.token}`,
        },
      };
      let endpoint = `https://api.wheniwork.com/2/shifts?\
start=${this.currTime[0]}:${this.currTime[1]}&\
end=${this.currTime[0]}:${this.currTime[1] + 1}`;
      console.info(
        `[INFO] [When I Work] Sent request to ${endpoint}. Request information was `,
        req,
      );
      let res = await fetch(endpoint, req);

      // Check if request failed
      if (!res.ok) {
        console.error(
          `[ERROR] [When I Work] Failed to get shifts. Received ${res.status}: ${res.statusText}`,
        );
        return;
      }

      // Find which position corresponds to Front Desk and Classroom
      let data: Shifts = await res.json();
      let positionToRole: Record<number, Role> = {};
      if (data.positions) {
        for (let role of ["Front Desk", "Classroom"] as Role[]) {
          let pos = data.positions.find((pos) => pos.name.includes(role));
          if (pos) {
            positionToRole[pos.id] = role;
          }
        }
      }

      // Keep track of who is currently on shift
      let currOnShift = new Set<string>();
      for (let shift of data.shifts ?? []) {
        currOnShift.add(shift.user_id.toString());

        let user = currState.whenIWork.userDict[shift.user_id];

        // If we found the user, add all the relevant roles
        if (user) {
          user.scheduled = true;

          // Get the member object from the user's snowflake
          let member = await this.guild.members.fetch(user.ping.slice(2, -1));

          // Remove any previous roles they may have had
          // This is a little inefficient, because I'm removing On Shift
          // just to add it again, but it's not inefficient enough to matter
          // Since all we need is that this finishes within 15 minutes,
          // and this will probably finish in a couple seconds.
          // If this was blocking it might matter, but it's not so it can
          // do other things in the meantime.
          for (let role of this.roles[shift.user_id] ?? []) {
            await member.roles.remove(this.roleToId[role]);
          }

          // Initialize the new roles array
          this.roles[shift.user_id] = ["On Shift"];

          // If they have a known position, include that role
          let pos = positionToRole[shift.position_id];
          if (pos) {
            this.roles[shift.user_id].push(pos);
          }

          // If they're a lead, include that role
          if (currState.leads.some((lead) => lead.ping == user.ping)) {
            this.roles[shift.user_id].push("Leads");
          }

          // Add all the relevant roles
          await member.roles.add(
            this.roles[shift.user_id].map((role) => this.roleToId[role]),
          );
        }
      }

      // Go through those who are already on shift and remove those who shouldn't be there
      for (let id in this.roles) {
        // Skip those we already dealt with
        if (currOnShift.has(id)) continue;

        // Check to make sure we have a user for this id
        let user = currState.whenIWork.userDict[id];
        if (user) {
          // Set them to no longer scheduled, since they were not on shift this cycle
          user.scheduled = false;

          // If they're still punched in, we shouldn't remove their roles just yet
          if (user.punched) continue;

          // Remove all of the roles they were assigned
          let member = await this.guild.members.fetch(user.ping.slice(2, -1));
          await member.roles.remove(
            this.roles[id].map((role) => this.roleToId[role]),
          );
        }
      }

      // Write the updated state
      await this.state.write(currState);
    }
  }

  private async updateTime(): Promise<number> {
    if (
      this.currTime[0] == this.closingTime[0] &&
      this.currTime[1] == this.closingTime[1]
    ) {
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
        console.error(
          `[ERROR] [When I Work] Failed to refresh token. Received ${res.status}: ${res.statusText}`,
        );
        return;
      }

      // If we successfully refreshed, replace the token and issue time
      let data = await res.json();
      currState.whenIWork.token = data.token;
      let decoded = jwt.decode(data.token) as jwt.JwtPayload;
      currState.whenIWork.iat = decoded.iat!;
      await this.state.write(currState);
    }
  }
}
