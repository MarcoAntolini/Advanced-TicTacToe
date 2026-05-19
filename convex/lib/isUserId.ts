import type { Id } from "../_generated/dataModel";

export function isUserId(ref: Id<"users"> | string | null): ref is Id<"users"> {
	return ref !== null && typeof ref === "string" && !ref.startsWith("guest_") && ref.length > 10;
}
