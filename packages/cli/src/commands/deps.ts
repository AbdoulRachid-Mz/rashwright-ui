import { Command } from "commander";
import chalk from "chalk";
import { loadComponentEntry, loadAllComponentEntries } from "../core/dependency-resolver.js";
import { resolveRegistry, ensureComponentDownloaded } from "../core/remote-registry.js";

interface TreeNode {
  name: string;
  version?: string;
  type: "component" | "expo";
  children: TreeNode[];
}

export function buildDependencyTree(
  rootName: string,
  registryRoot: string,
  visited = new Set<string>()
): TreeNode | null {
  const entry = loadComponentEntry(rootName, registryRoot);
  if (!entry) return null;

  const node: TreeNode = {
    name: entry.name,
    version: entry.version,
    type: "component",
    children: [],
  };

  if (visited.has(rootName)) {
    return node;
  }
  visited.add(rootName);

  // Dépendances de composants Rashwright UI
  for (const depName of entry.requiresComponents) {
    const childNode = buildDependencyTree(depName, registryRoot, new Set(visited));
    if (childNode) {
      node.children.push(childNode);
    } else {
      node.children.push({ name: depName, type: "component", children: [] });
    }
  }

  // Dépendances Expo natives
  for (const expoDep of entry.expoDependencies) {
    node.children.push({ name: expoDep, type: "expo", children: [] });
  }

  return node;
}

export function renderAsciiTree(node: TreeNode, prefix = "", isLast = true): string[] {
  const lines: string[] = [];
  const connector = prefix === "" ? "" : isLast ? "└── " : "├── ";
  const label =
    node.type === "component"
      ? chalk.bold.cyan(node.name) + (node.version ? chalk.dim(`@${node.version}`) : "")
      : chalk.yellow(`[expo] ${node.name}`);

  lines.push(`${prefix}${connector}${label}`);

  const childPrefix = prefix === "" ? "" : prefix + (isLast ? "    " : "│   ");
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const isChildLast = i === node.children.length - 1;
    lines.push(...renderAsciiTree(child, childPrefix, isChildLast));
  }

  return lines;
}

export function depsCommand(): Command {
  const cmd = new Command("deps");
  cmd
    .description("Afficher l'arbre des dépendances directes et transitives d'un composant")
    .argument("<component>", "Nom du composant")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .action(async (name: string, options) => {
      const resolved = await resolveRegistry({
        registryUrl: options.registry,
        fresh: options.fresh,
      });

      let entry = loadComponentEntry(name, resolved.registryRoot);
      if (!entry && resolved.isRemote) {
        entry = await ensureComponentDownloaded(name, {
          registryUrl: resolved.registryUrl,
          registryRoot: resolved.registryRoot,
          sourceRoot: resolved.sourceRoot,
        });
      }

      if (!entry) {
        console.log(chalk.red(`  ✖ Composant "${name}" introuvable dans le registre.`));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(` — Graphe de dépendances : ${name}`));
      console.log();

      const tree = buildDependencyTree(name, resolved.registryRoot);
      if (!tree) {
        console.log(chalk.red("  ✖ Impossible de construire l'arbre de dépendances."));
        return;
      }

      const lines = renderAsciiTree(tree);
      lines.forEach((l) => console.log(`  ${l}`));
      console.log();
    });

  return cmd;
}
