// src/types/Auth.ts
import type { User } from "./User";

export interface AuthState {
  token?: string | null;
  user?: User | null;
}
