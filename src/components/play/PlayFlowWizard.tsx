"use client";

import { Suspense } from "react";
import { ActiveGamesList } from "@/components/game/ActiveGamesList";
import { PlayBreadcrumb } from "@/components/layout/PlayBreadcrumb";
import { PlayStepChoose } from "@/components/play/PlayStepChoose";
import { PlayStepCreate } from "@/components/play/PlayStepCreate";
import { PlayStepMultiplayer } from "@/components/play/PlayStepMultiplayer";
import { contentWidth } from "@/lib/layout";
import { PLAY_FLOW_COPY } from "@/lib/play/playFlowConfig";
import { usePlayFlow } from "@/hooks/usePlayFlow";

function PlayFlowWizardContent() {
	const { step, breadcrumbLabel, goToStep, goBack, prefillMode } = usePlayFlow();

	return (
		<div className={`${contentWidth.standard} space-y-10`}>
			<section aria-label="Continue playing">
				<ActiveGamesList compact title={PLAY_FLOW_COPY.continuePlayingTitle} />
			</section>

			{step !== "choose" && breadcrumbLabel ? (
				<PlayBreadcrumb label={breadcrumbLabel} />
			) : null}

			{step === "choose" ? (
				<PlayStepChoose onMultiplayer={() => goToStep("multiplayer")} />
			) : null}

			{step === "multiplayer" ? (
				<PlayStepMultiplayer
					onCreate={() => goToStep("create")}
					onBack={goBack}
				/>
			) : null}

			{step === "create" ? (
				<PlayStepCreate onBack={goBack} prefillMode={prefillMode} />
			) : null}
		</div>
	);
}

export function PlayFlowWizard() {
	return (
		<Suspense fallback={<p className="text-muted">Loading play…</p>}>
			<PlayFlowWizardContent />
		</Suspense>
	);
}
