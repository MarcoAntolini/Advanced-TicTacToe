/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { createInitialState, serializeGameState } from "./lib/game";
import { endGame } from "./lib/endGame";
import { enqueueInQueue } from "./lib/matchmaking/queue";

const modules = import.meta.glob("./**/*.ts");

describe("convex orchestrators", () => {
	it("endGame finishes an active game and is idempotent", async () => {
		const t = convexTest(schema, modules);

		const gameId = await t.run(async (ctx) => {
			return await ctx.db.insert("games", {
				mode: "realtime",
				status: "active",
				playerX: "user_a",
				playerO: "user_b",
				state: serializeGameState(createInitialState()),
			});
		});

		await t.run(async (ctx) => {
			const game = await ctx.db.get(gameId);
			if (!game) throw new Error("missing game");
			const first = await endGame(ctx, game, "X");
			expect(first.alreadyFinished).toBe(false);

			const finished = await ctx.db.get(gameId);
			expect(finished?.status).toBe("finished");
			expect(finished?.winner).toBe("X");

			const second = await endGame(ctx, finished!, "X");
			expect(second.alreadyFinished).toBe(true);
		});
	});

	it("enqueueInQueue pairs two casual-realtime players", async () => {
		const t = convexTest(schema, modules);

		await t.run(async (ctx) => {
			await ctx.db.insert("matchmakingQueue", {
				playerRef: "guest_waiter",
				queueKind: "casual-realtime",
				joinedAt: Date.now() - 1000,
			});
		});

		const result = await t.run(async (ctx) => {
			return await enqueueInQueue(ctx, {
				queueKind: "casual-realtime",
				playerRef: "guest_joiner",
			});
		});

		expect(result.matched).toBe(true);
		if (!result.matched) throw new Error("expected match");
		expect(result.gameId).toBeTruthy();

		const game = await t.run(async (ctx) => ctx.db.get(result.gameId));
		expect(game?.status).toBe("active");
		expect(game?.playerX).toBe("guest_waiter");
		expect(game?.playerO).toBe("guest_joiner");
	});

	it("matchmaking.enqueue mutation accepts queueKind ranked-rated for signed-in users", async () => {
		const t = convexTest(schema, modules);

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				clerkId: "clerk_test",
				displayName: "Tester",
				stats: { wins: 0, losses: 0, draws: 0, streak: 0 },
				rating: 1200,
			});
		});

		const result = await t
			.withIdentity({ subject: "clerk_test" })
			.mutation(api.matchmaking.mutations.enqueue, { queueKind: "ranked-rated" });

		expect(result.matched).toBe(false);

		const status = await t
			.withIdentity({ subject: "clerk_test" })
			.query(api.matchmaking.queries.getMyStatus, {});

		expect(status.rankedRated.inQueue).toBe(true);

		await t.run(async (ctx) => {
			const entry = await ctx.db
				.query("matchmakingQueue")
				.withIndex("by_kind_player", (q) =>
					q.eq("queueKind", "ranked-rated").eq("playerRef", userId),
				)
				.unique();
			expect(entry?.playerRef).toBe(userId);
		});
	});

	it("listHistory returns merged finished games for the signed-in user", async () => {
		const t = convexTest(schema, modules);

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				clerkId: "clerk_history",
				displayName: "Historian",
				stats: { wins: 0, losses: 0, draws: 0, streak: 0 },
			});
		});

		await t.run(async (ctx) => {
			await ctx.db.insert("games", {
				mode: "realtime",
				status: "finished",
				playerX: userId,
				playerO: "other",
				winner: "X",
				finishedAt: 3000,
				state: serializeGameState(createInitialState()),
			});
			await ctx.db.insert("games", {
				mode: "async",
				status: "finished",
				playerX: "other",
				playerO: userId,
				winner: "O",
				finishedAt: 4000,
				state: serializeGameState(createInitialState()),
			});
			await ctx.db.insert("games", {
				mode: "realtime",
				status: "finished",
				playerX: "stranger",
				playerO: "stranger2",
				winner: "X",
				finishedAt: 9999,
				state: serializeGameState(createInitialState()),
			});
		});

		const history = await t
			.withIdentity({ subject: "clerk_history" })
			.query(api.games.queries.listHistory, {
				paginationOpts: { numItems: 10, cursor: null },
			});

		expect(history.page).toHaveLength(2);
		expect(history.page[0]?.finishedAt).toBe(4000);
		expect(history.page[1]?.finishedAt).toBe(3000);
		expect(history.isDone).toBe(true);
	});
});
