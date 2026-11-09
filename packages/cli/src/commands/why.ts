import { Command } from "commander";
import chalk from "chalk";
import { resolveRegistry } from "../core/remote-registry.js";
import { detectProject } from "../core/project-detector.js";
import { readConfig } from "../core/config-manager.js";
import {
  parseArtefactRef,
  loadArtefact,
  buildArtefactGraph,
  findReverseDependents,
  findExpoDependents,
  getInstalledArtefacts,
  artefactKey,
  type ArtefactManifest,
  type ArtefactNode,
  type ArtefactRef,
  type ArtefactGraph,
} from "../core/artefacts.js";

interface InstalledContext {
  /** Clés `type:id` réellement présentes dans le lockfile. */
  keys: Set<string>;
  /** Clés déclarées dans `rashwright-ui.json` (composants/hooks/libs). */
  configured: Set<string>;
}

function displayRef(ref: ArtefactRef): string {
  return ref.type === "component" ? ref.id : `${ref.type}:${ref.id}`;
}

function label(key: string): string {
  return key.replace(/^component:/, "");
}

/**
 * Résout un nom non préfixé vers son type réel quand le composant n'existe pas.
 * On ne devine jamais : on teste les manifestes et on retient le premier type
 * qui en possède un, dans un ordre stable.
 */
function resolveManifest(
  parsed: ArtefactRef,
  registryRoot: string,
): { ref: ArtefactRef; manifest: ArtefactManifest } | null {
  const direct = loadArtefact(parsed, { registryRoot });
  if (direct) return { ref: parsed, manifest: direct };

  if (parsed.type === "component") {
    for (const candidate of ["foundation", "hook", "lib"] as const) {
      const ref: ArtefactRef = { type: candidate, id: parsed.id };
      const manifest = loadArtefact(ref, { registryRoot });
      if (manifest) return { ref, manifest };
    }
  }

  return null;
}

function installedContext(
  cwd: string,
  registryRoot: string,
  projectHasConfig: boolean,
  configPath: string,
): InstalledContext {
  const keys = new Set<string>();
  if (projectHasConfig) {
    for (const artefact of getInstalledArtefacts(cwd, { registryRoot })) {
      keys.add(artefactKey(artefact));
      // Les hooks/libs partagent la section `components` du lockfile.
      if (artefact.type === "hook" || artefact.type === "lib") {
        keys.add(`component:${artefact.id}`);
      }
    }
  }

  const configured = new Set<string>();
  if (projectHasConfig) {
    const config = readConfig(configPath);
    for (const id of Object.keys(config.components ?? {})) configured.add(id);
  }

  return { keys, configured };
}

function installTag(
  ref: ArtefactRef,
  context: InstalledContext,
): string {
  if (context.keys.has(artefactKey(ref))) {
    return chalk.green(" [installé]");
  }
  // Un hook/lib peut être stocké sous `component:<id>` dans un lock historique.
  if (
    (ref.type === "hook" || ref.type === "lib") &&
    context.keys.has(`component:${ref.id}`)
  ) {
    return chalk.green(" [installé]");
  }
  return chalk.dim(" [registre]");
}

function printNodeList(
  nodes: ArtefactNode[],
  context: InstalledContext,
  options: { indent?: string } = {},
): void {
  const indent = options.indent ?? "    ";
  for (const node of nodes) {
    const ref: ArtefactRef = { type: node.type, id: node.id };
    console.log(
      chalk.dim(`${indent}• `) +
        chalk.cyan(label(artefactKey(node))) +
        installTag(ref, context),
    );
  }
}

function serialiseNode(node: ArtefactNode): {
  type: string;
  id: string;
  ref: string;
  dependsOn: string[];
  dependencies: string[];
  expoDependencies: string[];
} {
  return {
    type: node.type,
    id: node.id,
    ref: artefactKey(node),
    dependsOn: node.dependsOn.map(artefactKey),
    dependencies: node.dependencies,
    expoDependencies: node.expoDependencies,
  };
}

function printDirectDependencies(
  graph: ArtefactGraph,
  ref: ArtefactRef,
  context: InstalledContext,
): void {
  const node = graph.nodes.get(artefactKey(ref));
  if (!node || node.dependsOn.length === 0) return;

  console.log(chalk.bold(`  ${displayRef(ref)} requiert directement :`));
  for (const dep of node.dependsOn) {
    const depNode = graph.nodes.get(artefactKey(dep));
    const labelText = depNode ? label(artefactKey(dep)) : `${artefactKey(dep)} ${chalk.yellow("(manifeste absent)")}`;
    console.log(
      chalk.dim("    • ") + chalk.cyan(labelText) + installTag(dep, context),
    );
  }
  console.log();
}

export function whyCommand(): Command {
  const cmd = new Command("why");
  cmd
    .description(
      "Expliquer pourquoi un artefact ou un paquet Expo est nécessaire dans le projet",
    )
    .argument(
      "<target>",
      "Artefact (button, foundation:theme, template:auth, widget:metric, hook:use-device) ou paquet Expo",
    )
    .option(
      "--registry <url>",
      "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)",
    )
    .option("--json", "Sortie JSON")
    .action(async (target: string, options: { registry?: string; json?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      const resolved = await resolveRegistry({
        registryUrl: options.registry,
      });

      const graph = buildArtefactGraph({ registryRoot: resolved.registryRoot });
      const context = installedContext(
        cwd,
        resolved.registryRoot,
        project.hasRashwrightConfig,
        project.rashwrightConfigPath,
      );

      const parsed = parseArtefactRef(target);
      const resolvedManifest = resolveManifest(parsed, resolved.registryRoot);
      // Une cible peut être référencée sans posséder son propre manifeste
      // (ex: `text`, fourni par la fondation `core-ui`). Le graphe inverse
      // reste la source de vérité : on ne l'ignore pas.
      const targetRef = resolvedManifest?.ref ?? parsed;
      const targetKey = artefactKey(targetRef);
      const isReferenced = graph.nodes.has(targetKey) || graph.reverse.has(targetKey);

      // ── Analyse « paquet Expo » ────────────────────────────────────────
      const expoDependents = findExpoDependents(graph, target);

      // ── Analyse « artefact » ───────────────────────────────────────────
      const directDependents =
        resolvedManifest || isReferenced
          ? findReverseDependents(graph, targetRef, false)
          : [];
      const transitiveDependents =
        resolvedManifest || isReferenced
          ? findReverseDependents(graph, targetRef, true)
          : [];
      const transitiveOnly = transitiveDependents.filter(
        (node) =>
          !directDependents.some(
            (direct) => artefactKey(direct) === artefactKey(node),
          ),
      );

      const isExplicitlyInstalled = context.keys.has(targetKey);
      const isConfigured = context.configured.has(targetRef.id);

      const matched =
        Boolean(resolvedManifest) ||
        isReferenced ||
        expoDependents.length > 0 ||
        isExplicitlyInstalled ||
        isConfigured;

      // ── Mode JSON : structure complète et stable ───────────────────────
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              target,
              artefact: resolvedManifest
                ? {
                    type: resolvedManifest.ref.type,
                    id: resolvedManifest.ref.id,
                    version: resolvedManifest.manifest.version,
                    registryVersion: resolvedManifest.manifest.registryVersion,
                    installed: isExplicitlyInstalled,
                    configured: isConfigured,
                  }
                : isReferenced
                  ? {
                      type: targetRef.type,
                      id: targetRef.id,
                      version: null,
                      registryVersion: null,
                      installed: isExplicitlyInstalled,
                      configured: isConfigured,
                    }
                  : null,
              expoPackage: {
                name: target,
                requiredBy: expoDependents.map(serialiseNode),
              },
              directDependents: directDependents.map(serialiseNode),
              transitiveDependents: transitiveDependents.map(serialiseNode),
              matched,
            },
            null,
            2,
          ),
        );
        return;
      }

      console.log();
      console.log(
        chalk.bold.cyan("  Rashwright UI") +
          chalk.dim(` — Analyse inverse : why "${target}" ?`),
      );
      console.log();

      if (!matched) {
        console.log(
          chalk.yellow(
            `  ⚠ Aucun artefact ni paquet Expo ne semble requérir "${target}".`,
          ),
        );
        console.log();
        return;
      }

      // ── Paquet Expo ────────────────────────────────────────────────────
      if (expoDependents.length > 0) {
        console.log(
          chalk.bold(`  Le paquet Expo ${chalk.yellow(target)} est requis par :`),
        );
        printNodeList(expoDependents, context);
        console.log();
      }

      // ── Artefact : état local ──────────────────────────────────────────
      if (resolvedManifest) {
        const { ref, manifest } = resolvedManifest;
        if (isExplicitlyInstalled) {
          console.log(
            chalk.green(
              `  ✔ ${displayRef(ref)} est installé dans votre projet (lockfile).`,
            ),
          );
        } else if (isConfigured) {
          console.log(
            chalk.yellow(
              `  ⚠ ${displayRef(ref)} est déclaré dans rashwright-ui.json mais absent du lockfile.`,
            ),
          );
        } else {
          console.log(
            chalk.dim(
              `  ○ ${displayRef(ref)} est disponible dans le registre (v${manifest.version}) mais n'est pas installé.`,
            ),
          );
        }
        console.log();
      } else if (isReferenced) {
        console.log(
          chalk.dim(
            `  ○ ${displayRef(targetRef)} est référencé par le registre mais ne possède pas de manifeste autonome (fourni par une fondation).`,
          ),
        );
        console.log();
      }

      // ── Dépendances directes de l'artefact ─────────────────────────────
      if (resolvedManifest) {
        printDirectDependencies(graph, resolvedManifest.ref, context);
      }

      // ── Dépendants directs ─────────────────────────────────────────────
      if (directDependents.length > 0) {
        console.log(
          chalk.bold(
            `  ${resolvedManifest ? displayRef(resolvedManifest.ref) : target} est requis directement par :`,
          ),
        );
        printNodeList(directDependents, context);
        console.log();
      }

      // ── Dépendants transitifs ──────────────────────────────────────────
      if (transitiveOnly.length > 0) {
        console.log(
          chalk.bold("  Requis transitivement par :"),
        );
        printNodeList(transitiveOnly, context);
        console.log();
      }

      if (
        (resolvedManifest || isReferenced) &&
        directDependents.length === 0 &&
        transitiveOnly.length === 0 &&
        expoDependents.length === 0 &&
        !isExplicitlyInstalled &&
        !isConfigured
      ) {
        console.log(
          chalk.yellow(
            `  ⚠ Aucun artefact installé ne dépend de ${displayRef(targetRef)}.`,
          ),
        );
        console.log();
      }
    });

  return cmd;
}
