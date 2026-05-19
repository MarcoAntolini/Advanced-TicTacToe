export const QUEUE_KINDS = ["casual-realtime", "casual-async", "ranked-rated"] as const;

export type QueueKind = (typeof QUEUE_KINDS)[number];

export type CasualMode = "realtime" | "async";

export function casualQueueKindFromMode(mode: CasualMode): QueueKind {
	return mode === "async" ? "casual-async" : "casual-realtime";
}

export function isRankedQueueKind(kind: QueueKind): boolean {
	return kind === "ranked-rated";
}

export function queueKindRequiresAuth(kind: QueueKind): boolean {
	return kind === "ranked-rated";
}

export function queueKindUsesRealtimeBlock(kind: QueueKind): boolean {
	return kind !== "casual-async";
}
