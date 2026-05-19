export type GameClassification = "casual" | "ranked-practice" | "ranked-rated";

export type ClassificationSource = {
	isRanked?: boolean;
	rated?: boolean;
};

export function classifyGame(source: ClassificationSource): GameClassification {
	if (source.isRanked !== true) return "casual";
	if (source.rated === true) return "ranked-rated";
	return "ranked-practice";
}

export function isRatedClassification(classification: GameClassification): boolean {
	return classification === "ranked-rated";
}

export function createFieldsForPracticeRanked(clockFields: {
	clockXMs: number;
	clockOMs: number;
	clockIncrementMs: number;
}) {
	return {
		isRanked: true as const,
		rated: false as const,
		...clockFields,
	};
}

export function createFieldsForRatedRanked(clockFields: {
	clockXMs: number;
	clockOMs: number;
	clockIncrementMs: number;
}) {
	return {
		isRanked: true as const,
		rated: true as const,
		...clockFields,
	};
}

/** Fields copied when starting a rematch from a finished game. */
export function rematchClassificationFields(source: ClassificationSource): {
	isRanked?: true;
	rated?: true;
} {
	const classification = classifyGame(source);
	if (classification === "casual") return {};
	return {
		isRanked: true,
		...(classification === "ranked-rated" ? { rated: true as const } : {}),
	};
}

/** Whether Elo side effects should run for this game document. */
export function shouldApplyRating(source: ClassificationSource): boolean {
	return isRatedClassification(classifyGame(source));
}

export type GameDisplayMode = "local" | "online" | "async" | "ranked-practice" | "ranked-rated";

export function gameDisplayMode(
	source: ClassificationSource & { mode?: "local" | "realtime" | "async" },
	options: { localMode?: boolean } = {},
): GameDisplayMode {
	if (options.localMode || source.mode === "local") return "local";
	const classification = classifyGame(source);
	if (classification === "ranked-rated") return "ranked-rated";
	if (classification === "ranked-practice") return "ranked-practice";
	if (source.mode === "async") return "async";
	return "online";
}

export function lobbyListingFields(source: ClassificationSource) {
	const classification = classifyGame(source);
	return {
		classification,
		isRanked: classification !== "casual",
		isPractice: classification === "ranked-practice",
		isRated: classification === "ranked-rated",
	};
}
