import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appDir = dirname(fileURLToPath(import.meta.url));

describe("legacy account routes", () => {
	it("profile and history pages redirect to activity", () => {
		for (const route of ["profile", "history"]) {
			const source = readFileSync(join(appDir, route, "page.tsx"), "utf8");
			expect(source).toContain('redirect("/activity")');
		}
	});
});
