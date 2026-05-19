export type PlayFlowStep = "choose" | "multiplayer" | "create";

export type AutoFindActionId = "quick" | "ranked" | "async";

export type GameVisibility = "public" | "private";

export type OnlineGameMode = "realtime" | "async";

export type RealtimeRules = "normal" | "ranked-practice";

export type CreateGameSettings = {
	visibility: GameVisibility;
	mode: OnlineGameMode;
	rules: RealtimeRules;
};
