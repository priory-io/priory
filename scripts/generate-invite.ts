#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";
import { inviteCode, user } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

interface InviteOptions {
  createdById: string;
  maxUses?: number;
  expiresInDays?: number;
  description?: string;
}

if (!process.env["DATABASE_URL"]) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(process.env["DATABASE_URL"]);
const db = drizzle(client);

async function generateInviteCode(options: InviteOptions): Promise<string> {
  const code = nanoid(12).toUpperCase();
  const id = nanoid();

  let expiresAt: Date | null = null;
  if (options.expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + options.expiresInDays);
  }

  await db.insert(inviteCode).values({
    id,
    code,
    createdById: options.createdById,
    maxUses: options.maxUses || null,
    expiresAt,
    description: options.description || null,
  });

  return code;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: bun run scripts/generate-invite.ts <admin-user-id> [options]

Options:
  --max-uses <number>     Maximum number of times this code can be used
  --expires-in <days>     Number of days until expiration
  --description <text>    Description for this invite code

Examples:
  bun run scripts/generate-invite.ts admin-uuid-123
  bun run scripts/generate-invite.ts admin-uuid-123 --max-uses 5 --expires-in 30
  bun run scripts/generate-invite.ts admin-uuid-123 --description "Beta testers"
`);
    process.exit(1);
  }

  const createdById = args[0];
  if (!createdById) {
    console.error("Admin user ID is required");
    process.exit(1);
  }

  const options: InviteOptions = { createdById };

  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    if (!value) {
      console.error(`Missing value for ${flag}`);
      process.exit(1);
    }

    switch (flag) {
      case "--max-uses":
        options.maxUses = parseInt(value);
        if (isNaN(options.maxUses)) {
          console.error("Invalid max-uses value");
          process.exit(1);
        }
        break;
      case "--expires-in":
        options.expiresInDays = parseInt(value);
        if (isNaN(options.expiresInDays)) {
          console.error("Invalid expires-in value");
          process.exit(1);
        }
        break;
      case "--description":
        options.description = value;
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        process.exit(1);
    }
  }

  try {
    const adminUser = await db
      .select()
      .from(user)
      .where(eq(user.id, createdById))
      .limit(1);

    if (adminUser.length === 0) {
      console.error(`User with ID ${createdById} not found`);
      process.exit(1);
    }

    const foundUser = adminUser[0];
    if (!foundUser || !foundUser.isAdmin) {
      console.error(`User ${foundUser?.name || "unknown"} is not an admin`);
      process.exit(1);
    }

    const code = await generateInviteCode(options);

    console.log(`✅ Invite code generated: ${code}`);
    console.log(`Created by: ${foundUser.name}`);
    if (options.maxUses) console.log(`Max uses: ${options.maxUses}`);
    if (options.expiresInDays)
      console.log(`Expires in: ${options.expiresInDays} days`);
    if (options.description) console.log(`Description: ${options.description}`);
  } catch (error) {
    console.error("Error generating invite code:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
