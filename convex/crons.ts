import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
	"expire matchmaking queue",
	{ minutes: 5 },
	internal.matchmaking.internal.expireStale,
);

crons.interval(
	"expire ranked matchmaking queue",
	{ minutes: 5 },
	internal.rankedMatchmaking.internal.expireStale,
);

crons.interval(
	"expire ranked game clocks",
	{ seconds: 30 },
	internal.clock.internal.expireRankedClocks,
);

export default crons;
