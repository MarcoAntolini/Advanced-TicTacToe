import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getOptionalUserId } from "./auth";
import { resolvePlayerRef } from "./room";

type Ctx = QueryCtx | MutationCtx;

export type ResolvedParticipant = {
	userId: Id<"users"> | null;
	guestId: string | undefined;
	playerRef: Id<"users"> | string;
};

export async function resolveParticipant(
	ctx: Ctx,
	guestId?: string,
): Promise<ResolvedParticipant> {
	const userId = await getOptionalUserId(ctx);
	return {
		userId,
		guestId,
		playerRef: resolvePlayerRef(userId, guestId),
	};
}

export function participantIdentity(participant: ResolvedParticipant) {
	return { userId: participant.userId, guestId: participant.guestId };
}
