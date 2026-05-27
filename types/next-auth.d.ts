import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    id_token?: string;
    user: {
      address?: string;
    } & DefaultSession["user"];
  }
}
