import type { LucideIcon } from "lucide-react";
import { Clock, Globe, KeyRound, List, Plus, Swords, Users, Zap } from "lucide-react";
import type {
	AutoFindActionId,
	CreateGameSettings,
	GameVisibility,
	OnlineGameMode,
	RealtimeRules,
} from "./types";

export type RootChoiceId = "local" | "multiplayer";

export type RootChoiceConfig = {
	id: RootChoiceId;
	title: string;
	description: string;
	icon: LucideIcon;
	iconClass: string;
	href?: string;
	step?: "multiplayer";
};

export type AutoFindActionConfig = {
	id: AutoFindActionId;
	title: string;
	description: string;
	icon: LucideIcon;
	iconClass: string;
	requiresAuth?: boolean;
	queueMode?: "realtime" | "async";
};

export type MultiplayerUtilityConfig = {
	id: "browse" | "create" | "join";
	title: string;
	description: string;
	icon: LucideIcon;
	iconClass: string;
	kind: "modal" | "step" | "inline";
};

export const PLAY_FLOW_COPY = {
	chooseTitle: "Play",
	chooseSubtitle:
		"Pick how you want to play. Local stays on your device; online modes use matchmaking, rooms, or codes.",
	multiplayerTitle: "Multiplayer",
	multiplayerSubtitle:
		"Find a match instantly, browse open public rooms, create a custom game, or join with a code.",
	createTitle: "Create game",
	createSubtitle: "Choose visibility, pace, and rules before opening your room.",
	autoFindHeading: "Auto-find opponent",
	continuePlayingTitle: "Continue playing",
} as const;

export const ROOT_CHOICES: RootChoiceConfig[] = [
	{
		id: "local",
		title: "Local",
		description: "Pass-and-play on one device. Perfect for couch co-op.",
		icon: Users,
		iconClass: "text-accent",
		href: "/play/local",
	},
	{
		id: "multiplayer",
		title: "Multiplayer",
		description: "Quick match, ranked, async, public rooms, or invite friends.",
		icon: Zap,
		iconClass: "text-playerX",
		step: "multiplayer",
	},
];

export const AUTO_FIND_ACTIONS: AutoFindActionConfig[] = [
	{
		id: "quick",
		title: "Quick match",
		description: "Get paired with someone online right now.",
		icon: Zap,
		iconClass: "text-playerX",
		queueMode: "realtime",
	},
	{
		id: "ranked",
		title: "Ranked",
		description: "Rated 5+3 quick match. Sign in required; affects Elo.",
		icon: Swords,
		iconClass: "text-accent",
		requiresAuth: true,
	},
	{
		id: "async",
		title: "Async match",
		description: "Find someone for a turn-based game on your schedule.",
		icon: Clock,
		iconClass: "text-playerO",
		queueMode: "async",
	},
];

export const MULTIPLAYER_UTILITIES: MultiplayerUtilityConfig[] = [
	{
		id: "browse",
		title: "Browse public games",
		description: "Open waiting rooms anyone can join.",
		icon: List,
		iconClass: "text-accent",
		kind: "modal",
	},
	{
		id: "create",
		title: "Create game",
		description: "Set visibility, pace, and rules, then share a link or code.",
		icon: Plus,
		iconClass: "text-playerO",
		kind: "step",
	},
	{
		id: "join",
		title: "Have a room code?",
		description: "Enter a code from a friend — works for public and private rooms.",
		icon: KeyRound,
		iconClass: "text-muted",
		kind: "inline",
	},
];

export const VISIBILITY_OPTIONS: {
	value: GameVisibility;
	label: string;
	description: string;
	icon: LucideIcon;
}[] = [
	{
		value: "public",
		label: "Public",
		description: "Listed in the public lobby until someone joins.",
		icon: Globe,
	},
	{
		value: "private",
		label: "Private",
		description: "Only people with your link or code can join.",
		icon: KeyRound,
	},
];

export const MODE_OPTIONS: {
	value: OnlineGameMode;
	label: string;
	description: string;
}[] = [
	{
		value: "realtime",
		label: "Realtime",
		description: "Play live, move by move.",
	},
	{
		value: "async",
		label: "Async",
		description: "Up to 72 hours per move.",
	},
];

export const RULES_OPTIONS: {
	value: RealtimeRules;
	label: string;
	description: string;
}[] = [
	{
		value: "normal",
		label: "Normal rules",
		description: "Casual realtime — no clock or rating.",
	},
	{
		value: "ranked-practice",
		label: "Ranked practice",
		description: "5+3 Fischer clock for practice — does not change Elo.",
	},
];

export const DEFAULT_CREATE_SETTINGS: CreateGameSettings = {
	visibility: "private",
	mode: "realtime",
	rules: "normal",
};

export function toCreateMutationArgs(settings: CreateGameSettings) {
	return {
		mode: settings.mode,
		visibility: settings.visibility,
		rankedRules:
			settings.mode === "realtime" && settings.rules === "ranked-practice",
	};
}
