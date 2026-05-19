export const THEME_STORAGE_KEY = "uttt-theme";

export type ThemeId =
	| "midnight"
	| "forest"
	| "sunset"
	| "ocean"
	| "lavender"
	| "daylight";

export type ThemeDefinition = {
	id: ThemeId;
	label: string;
	description: string;
	swatch: [string, string, string];
};

export const themes: ThemeDefinition[] = [
	{
		id: "midnight",
		label: "Midnight",
		description: "Deep navy with indigo accents",
		swatch: ["#0a0e1a", "#6366f1", "#38bdf8"],
	},
	{
		id: "forest",
		label: "Forest",
		description: "Dark greens with emerald highlights",
		swatch: ["#0a120e", "#10b981", "#5eead4"],
	},
	{
		id: "sunset",
		label: "Sunset",
		description: "Warm dark tones with amber glow",
		swatch: ["#120a0e", "#f59e0b", "#fb7185"],
	},
	{
		id: "ocean",
		label: "Ocean",
		description: "Deep teal with cyan accents",
		swatch: ["#061018", "#0891b2", "#22d3ee"],
	},
	{
		id: "lavender",
		label: "Lavender",
		description: "Dark purple with violet accents",
		swatch: ["#0e0a14", "#a855f7", "#67e8f9"],
	},
	{
		id: "daylight",
		label: "Daylight",
		description: "Clean light palette",
		swatch: ["#f4f6fb", "#6366f1", "#0ea5e9"],
	},
];

export const DEFAULT_THEME: ThemeId = "midnight";

export function isThemeId(value: string | null | undefined): value is ThemeId {
	return themes.some((theme) => theme.id === value);
}

export function getStoredTheme(): ThemeId {
	if (typeof window === "undefined") return DEFAULT_THEME;
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return isThemeId(stored) ? stored : DEFAULT_THEME;
	} catch {
		return DEFAULT_THEME;
	}
}

export function applyTheme(themeId: ThemeId) {
	document.documentElement.dataset.theme = themeId;
}
