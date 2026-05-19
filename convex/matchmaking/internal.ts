import { internalMutation } from "../_generated/server";
import { expireAllStaleQueueEntries } from "../lib/matchmaking/queue";

export const expireStale = internalMutation({
	args: {},
	handler: async (ctx) => {
		await expireAllStaleQueueEntries(ctx);
	},
});
