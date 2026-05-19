import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
	isParticipant as isParticipantPolicy,
	type ParticipantIdentity,
} from "@shared/policy/participant";

type Ctx = QueryCtx | MutationCtx;

export type { ParticipantIdentity };

export async function getOptionalUserId(ctx: Ctx): Promise<Id<"users"> | null> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) return null;

	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
		.unique();

	return user?._id ?? null;
}

export async function requireUserId(ctx: Ctx): Promise<Id<"users">> {
	const userId = await getOptionalUserId(ctx);
	if (!userId) throw new Error("Not authenticated");
	return userId;
}

export function isParticipant(
	game: { playerX: string | Id<"users"> | null; playerO: string | Id<"users"> | null },
	identity: ParticipantIdentity,
): boolean {
	return isParticipantPolicy(game, identity);
}
export function generateInviteCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}
