import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
	decodeHistoryCursor,
	encodeHistoryCursor,
	mergePickNext,
	type HistoryCursor,
} from "@shared/policy/gameHistory";

type FinishedGame = Doc<"games">;

/** Paginate finished games for a signed-in user via indexed playerX/playerO streams. */
export async function listHistoryForUser(
	ctx: QueryCtx,
	userId: Id<"users">,
	args: { numItems: number; cursor: string | null },
) {
	const numItems = args.numItems;
	let streams: HistoryCursor = decodeHistoryCursor(args.cursor);

	let xBuffer: FinishedGame[] = [];
	let oBuffer: FinishedGame[] = [];
	const page: FinishedGame[] = [];
	const seen = new Set<string>();

	while (page.length < numItems) {
		if (xBuffer.length === 0 && streams.x !== "done") {
			const batch = await ctx.db
				.query("games")
				.withIndex("by_playerX_finishedAt", (q) => q.eq("playerX", userId))
				.order("desc")
				.paginate({
					numItems,
					cursor: streams.x === null ? null : streams.x,
				});
			xBuffer = batch.page;
			streams = {
				...streams,
				x: batch.isDone ? "done" : batch.continueCursor,
			};
		}

		if (oBuffer.length === 0 && streams.o !== "done") {
			const batch = await ctx.db
				.query("games")
				.withIndex("by_playerO_finishedAt", (q) => q.eq("playerO", userId))
				.order("desc")
				.paginate({
					numItems,
					cursor: streams.o === null ? null : streams.o,
				});
			oBuffer = batch.page;
			streams = {
				...streams,
				o: batch.isDone ? "done" : batch.continueCursor,
			};
		}

		if (xBuffer.length === 0 && oBuffer.length === 0) break;

		const pick = mergePickNext(xBuffer[0], oBuffer[0]);
		if (!pick) break;

		const next = pick === "x" ? xBuffer.shift()! : oBuffer.shift()!;
		if (seen.has(next._id)) continue;
		seen.add(next._id);
		page.push(next);
	}

	const isDone =
		page.length < numItems &&
		streams.x === "done" &&
		streams.o === "done" &&
		xBuffer.length === 0 &&
		oBuffer.length === 0;

	return {
		page,
		isDone,
		continueCursor: isDone ? "" : encodeHistoryCursor(streams),
	};
}
