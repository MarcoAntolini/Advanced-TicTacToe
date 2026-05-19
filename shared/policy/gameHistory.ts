export type HistoryStreamCursor = string | null | "done";

export type HistoryCursor = {
	x: HistoryStreamCursor;
	o: HistoryStreamCursor;
};

export type HistorySortableGame = {
	_id: string;
	_creationTime: number;
	finishedAt?: number;
};

export function decodeHistoryCursor(cursor: string | null): HistoryCursor {
	if (!cursor) return { x: null, o: null };
	try {
		const parsed = JSON.parse(cursor) as HistoryCursor;
		return {
			x: parsed.x ?? null,
			o: parsed.o ?? null,
		};
	} catch {
		return { x: null, o: null };
	}
}

export function encodeHistoryCursor(cursor: HistoryCursor): string {
	return JSON.stringify(cursor);
}

export function finishedAtSortKey(game: HistorySortableGame): number {
	return game.finishedAt ?? game._creationTime;
}

export function mergePickNext<T extends HistorySortableGame>(
	xHead: T | undefined,
	oHead: T | undefined,
): "x" | "o" | null {
	if (!xHead) return oHead ? "o" : null;
	if (!oHead) return "x";
	const xTime = finishedAtSortKey(xHead);
	const oTime = finishedAtSortKey(oHead);
	if (xTime !== oTime) return xTime > oTime ? "x" : "o";
	return xHead._id > oHead._id ? "x" : "o";
}
