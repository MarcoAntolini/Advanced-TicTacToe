"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	DEFAULT_THEME,
	THEME_STORAGE_KEY,
	applyTheme,
	getStoredTheme,
	type ThemeId,
} from "@/lib/themes";

type ThemeContextValue = {
	theme: ThemeId;
	setTheme: (themeId: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

	useEffect(() => {
		const stored = getStoredTheme();
		setThemeState(stored);
		applyTheme(stored);
	}, []);

	const setTheme = useCallback((themeId: ThemeId) => {
		setThemeState(themeId);
		applyTheme(themeId);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, themeId);
		} catch {
			// Ignore storage failures (private browsing, etc.)
		}
	}, []);

	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
