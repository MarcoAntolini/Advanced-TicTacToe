"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildPlayHref, parsePlayStep, playStepLabel } from "@/lib/play/steps";
import type { OnlineGameMode, PlayFlowStep } from "@/lib/play/types";

export function usePlayFlow() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const step = parsePlayStep(searchParams.get("step"));
	const prefillMode = searchParams.get("mode") as OnlineGameMode | null;

	const breadcrumbLabel = useMemo(() => playStepLabel(step), [step]);

	const goToStep = useCallback(
		(next: PlayFlowStep, params?: Record<string, string | undefined>) => {
			router.push(buildPlayHref(next, params));
		},
		[router],
	);

	const goBack = useCallback(() => {
		if (step === "create") {
			goToStep("multiplayer");
			return;
		}
		if (step === "multiplayer") {
			goToStep("choose");
		}
	}, [goToStep, step]);

	return {
		step,
		prefillMode:
			prefillMode === "async" || prefillMode === "realtime" ? prefillMode : null,
		breadcrumbLabel,
		goToStep,
		goBack,
	};
}
