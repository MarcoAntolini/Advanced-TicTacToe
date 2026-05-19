import { normalizeInviteCode } from "@shared/invite/normalize";

export { normalizeInviteCode };

export function buildJoinPath(code: string): string {
	return `/join/${normalizeInviteCode(code)}`;
}

export function buildJoinUrl(code: string): string {
	const path = buildJoinPath(code);
	if (typeof window !== "undefined") {
		return `${window.location.origin}${path}`;
	}
	return path;
}

export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}
