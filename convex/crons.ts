import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
	"expire matchmaking queue",
	{ minutes: 5 },
	internal.matchmaking.internal.expireStale,
);

export default crons;
