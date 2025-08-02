#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { user } from "../src/lib/db/schema";

const userUuid = process.argv[2];

if (!userUuid) {
  console.error("Usage: bun run scripts/set-admin.ts <user-uuid>");
  process.exit(1);
}

if (!process.env["DATABASE_URL"]) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(process.env["DATABASE_URL"]);
const db = drizzle(client);

async function setUserAsAdmin(userId: string) {
  try {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      console.error(`User with UUID ${userId} not found`);
      process.exit(1);
    }

    const foundUser = existingUser[0];
    if (!foundUser) {
      console.error(`User with UUID ${userId} not found`);
      process.exit(1);
    }

    if (foundUser.isAdmin) {
      console.log(`User ${foundUser.name} (${userId}) is already an admin`);
      return;
    }

    await db.update(user).set({ isAdmin: true }).where(eq(user.id, userId));

    console.log(`Successfully set user ${foundUser.name} (${userId}) as admin`);
  } catch (error) {
    console.error("Error setting user as admin:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setUserAsAdmin(userUuid);
