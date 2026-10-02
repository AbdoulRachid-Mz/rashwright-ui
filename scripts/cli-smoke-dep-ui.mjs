import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8")
);
const dep = (pkg.dependencies && pkg.dependencies["@rashwright/ui-mobile"]) || "MISSING";
const workspace = String(dep).startsWith("workspace:");
console.log(
  "dep @rashwright/ui-mobile = " +
    dep +
    " — workspace ? " +
    (workspace ? "FAIL (doit être version réelle)" : "OK")
);
if (workspace || dep === "MISSING") {
  console.error(
    "❌ FAIL: CLI doit dépendre d'une version RÉELLE de @rashwright/ui-mobile (ex: ^0.1.1), PAS workspace:*."
  );
  process.exit(1);
}
console.log("✅ Dépendance @rashwright/ui-mobile est une version semver réelle");
