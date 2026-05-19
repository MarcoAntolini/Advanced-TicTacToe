export function normalizeInviteCode(code: string): string {
	return code.trim().toUpperCase().replace(/\s/g, "");
}
