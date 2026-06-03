export const ROLES = {
  MANGAKA: "MANGAKA",
  TANTOU: "TANTOU",
  ADMIN: "ADMIN",
  ASSISTANT: "ASSISTANT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
