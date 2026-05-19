import { internalMutation } from "../_generated/server";
import { ensureSeasonsSeeded } from "./lib/seasons";

/** Idempotent seed for Season 1 — run via cron until admin rollover exists. */
export const ensureSeasons = internalMutation({
	args: {},
	handler: async (ctx) => {
		await ensureSeasonsSeeded(ctx);
	},
});
