import { Command } from "commander";
import { updateCommand } from "./update.js";

/**
 * Commande `rs-ui upgrade` :
 * Alias complet et enrichi de `rs-ui update` pour la mise à niveau du cycle de vie des composants.
 * Intègre la détection de versions via rashwright-ui.lock, le 3-Way Merge et les AST Transformers.
 */
export function upgradeCommand(): Command {
  const cmd = updateCommand();
  cmd.name("upgrade");
  cmd.description("Mettre à niveau les composants installés vers la dernière version du registre (3-Way Merge & AST Transformers)");
  return cmd;
}
