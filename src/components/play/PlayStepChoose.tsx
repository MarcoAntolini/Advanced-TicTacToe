"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PLAY_FLOW_COPY, ROOT_CHOICES } from "@/lib/play/playFlowConfig";
import { ButtonLook } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function PlayStepChoose({ onMultiplayer }: { onMultiplayer: () => void }) {
	return (
		<>
			<section className="text-center sm:text-left">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					{PLAY_FLOW_COPY.chooseTitle}
				</h1>
				<p className="mt-2 text-pretty text-muted">{PLAY_FLOW_COPY.chooseSubtitle}</p>
			</section>

			<section className="grid gap-4" aria-label="Play mode">
				{ROOT_CHOICES.map((choice) => {
					const Icon = choice.icon;
					const inner = (
						<Card className="group flex flex-col gap-4 transition-colors hover:border-accent/40 sm:flex-row sm:items-center">
							<div className="flex flex-1 gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
									<Icon className={`h-6 w-6 ${choice.iconClass}`} aria-hidden />
								</div>
								<div>
									<h2 className="text-lg font-semibold">{choice.title}</h2>
									<p className="mt-1 text-sm text-muted">{choice.description}</p>
								</div>
							</div>
							<ButtonLook
								variant={choice.id === "multiplayer" ? "primary" : "secondary"}
								className="w-full gap-2 sm:w-auto"
							>
								{choice.id === "local" ? "Play local" : "Multiplayer"}
								<ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
							</ButtonLook>
						</Card>
					);

					if (choice.href) {
						return (
							<Link key={choice.id} href={choice.href} className="block">
								{inner}
							</Link>
						);
					}

					return (
						<button
							key={choice.id}
							type="button"
							onClick={onMultiplayer}
							className="w-full text-left"
						>
							{inner}
						</button>
					);
				})}
			</section>
		</>
	);
}
