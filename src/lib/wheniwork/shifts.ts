// Implements the relevant JSON structures to read results from the WhenIWork API

export interface Shifts {
  shifts: Shift[];
  users: User[];
  positions: Position[];
}

export interface Shift {
  user_id: number;
  position_id: number;
}

export interface User {
  id: number;
}

export interface Position {
  id: number;
  name: string;
}
