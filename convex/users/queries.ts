import { query } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";

export const getProfile = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return null;
		return await ctx.db.get(userId);
	},
});
