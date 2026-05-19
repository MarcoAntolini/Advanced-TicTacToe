import type { PlayFlowStep } from "./types";

const VALID_STEPS: PlayFlowStep[] = ["choose", "multiplayer", "create"];

export function parsePlayStep(raw: string | null): PlayFlowStep {
	if (raw && VALID_STEPS.includes(raw as PlayFlowStep)) {
		return raw as PlayFlowStep;
	}
	return "choose";
}

export function playStepLabel(step: PlayFlowStep): string | null {
	switch (step) {
		case "multiplayer":
			return "Multiplayer";
		case "create":
			return "Create game";
		default:
			return null;
	}
}

export function buildPlayHref(
	step: PlayFlowStep,
	params?: Record<string, string | undefined>,
): string {
	const search = new URLSearchParams();
	if (step !== "choose") {
		search.set("step", step);
	}
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== "") {
				search.set(key, value);
			}
		}
	}
	const q = search.toString();
	return q ? `/play?${q}` : "/play";
}
