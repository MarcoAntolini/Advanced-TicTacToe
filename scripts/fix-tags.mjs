import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
const wrong = "</" + "motion>";
const right = "</" + "div>";

function walk(dir) {
	for (const name of fs.readdirSync(dir)) {
		const p = path.join(dir, name);
		if (fs.statSync(p).isDirectory()) walk(p);
		else if (p.endsWith(".tsx")) {
			const t = fs.readFileSync(p, "utf8");
			if (t.includes(wrong)) {
				fs.writeFileSync(p, t.split(wrong).join(right));
				console.log("fixed", p);
			}
		}
	}
}

walk(root);
