"use client";

import { useState } from "react";
import {
	DEFAULT_CREATE_SETTINGS,
	MODE_OPTIONS,
	PLAY_FLOW_COPY,
	RULES_OPTIONS,
	VISIBILITY_OPTIONS,
} from "@/lib/play/playFlowConfig";
import type { CreateGameSettings, OnlineGameMode } from "@/lib/play/types";
import { usePlayActions } from "@/hooks/usePlayActions";
import { useBlockingRealtimeGame } from "@/hooks/useBlockingRealtimeGame";
import { ActiveGameBlockedBanner } from "@/components/game/ActiveGamesList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function OptionGroup<T extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: { value: T; label: string; description: string }[];
	value: T;
	onChange: (v: T) => void;
}) {
	return (
		<fieldset>
			<legend className="text-sm font-semibold text-foreground">{label}</legend>
			<div className="mt-2 grid gap-2">
				{options.map((opt) => (
					<label
						key={opt.value}
						className={`flex cursor-pointer gap-3 rounded-md border px-3 py-3 transition-colors ${
							value === opt.value
								? "border-accent bg-accent/5"
								: "border-border hover:border-accent/40"
						}`}
					>
						<input
							type="radio"
							name={label}
							value={opt.value}
							checked={value === opt.value}
							onChange={() => onChange(opt.value)}
							className="mt-1"
						/>
						<span>
							<span className="block font-medium">{opt.label}</span>
							<span className="block text-sm text-muted">{opt.description}</span>
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}

export function PlayStepCreate({
	onBack,
	prefillMode,
}: {
	onBack: () => void;
	prefillMode: OnlineGameMode | null;
}) {
	const { runCreate, loadingAction, error } = usePlayActions();
	const [settings, setSettings] = useState<CreateGameSettings>({
		...DEFAULT_CREATE_SETTINGS,
		mode: prefillMode ?? DEFAULT_CREATE_SETTINGS.mode,
	});
	const { blockingGame, blocked } = useBlockingRealtimeGame();
	const realtimeBlocked = blocked && settings.mode === "realtime";

	const patch = (partial: Partial<CreateGameSettings>) => {
		setSettings((prev) => {
			const next = { ...prev, ...partial };
			if (next.mode === "async") {
				next.rules = "normal";
			}
			return next;
		});
	};

	return (
		<>
			<section className="text-center sm:text-left">
				<Button variant="ghost" onClick={onBack} className="mb-4 -ml-2 h-auto min-h-0 px-2 py-1 text-sm">
					← Back
				</Button>
				<h1 className="text-3xl font-bold tracking-tight">{PLAY_FLOW_COPY.createTitle}</h1>
				<p className="mt-2 text-pretty text-muted">{PLAY_FLOW_COPY.createSubtitle}</p>
			</section>

			{error ? (
				<p className="rounded-md bg-danger/20 px-3 py-2 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}

			{realtimeBlocked && blockingGame ? (
				<ActiveGameBlockedBanner gameId={blockingGame.gameId} />
			) : null}

			<Card className={`space-y-8${realtimeBlocked ? " opacity-60" : ""}`}>
				<OptionGroup
					label="Visibility"
					options={VISIBILITY_OPTIONS.map((o) => ({
						value: o.value,
						label: o.label,
						description: o.description,
					}))}
					value={settings.visibility}
					onChange={(v) => patch({ visibility: v })}
				/>
				<OptionGroup
					label="Pace"
					options={MODE_OPTIONS}
					value={settings.mode}
					onChange={(v) => patch({ mode: v })}
				/>
				{settings.mode === "realtime" ? (
					<OptionGroup
						label="Rules"
						options={RULES_OPTIONS}
						value={settings.rules}
						onChange={(v) => patch({ rules: v })}
					/>
				) : null}
				<Button
					className="w-full"
					loading={loadingAction === "create"}
					disabled={realtimeBlocked}
					onClick={() => {
						if (realtimeBlocked) return;
						void runCreate(settings);
					}}
				>
					Create room
				</Button>
				{realtimeBlocked ? (
					<p className="text-center text-sm text-muted">
						Finish or forfeit your current realtime game, or switch pace to Async.
					</p>
				) : null}
			</Card>
		</>
	);
}
