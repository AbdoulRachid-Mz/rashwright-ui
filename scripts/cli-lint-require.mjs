import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Masque commentaires et littéraux de chaîne afin que seuls les `require()`
 * réellement exécutés soient détectés.
 *
 * - Les commentaires `//` et `/* ... *\/` deviennent des espaces.
 * - Les chaînes '...' et "..." deviennent des espaces (retours à la ligne
 *   préservés pour conserver la numérotation).
 * - Les template literals `` `...` `` sont masqués, MAIS leurs expressions
 *   `${ ... }` sont analysées comme du code : un `require()` dans une
 *   interpolation reste détecté.
 */
function maskNonCode(source) {
  const blank = (ch) => (ch === "\n" ? "\n" : ch === "\r" ? "\r" : " ");

  function maskCode(start, endChar) {
    let out = "";
    let i = start;
    let braceDepth = 0;

    while (i < source.length) {
      const ch = source[i];
      const next = source[i + 1];

      // Fin d'une expression `${ ... }`.
      if (endChar === "}" && ch === "}" && braceDepth === 0) {
        out += "}";
        return [out, i + 1];
      }

      // Commentaire de ligne.
      if (ch === "/" && next === "/") {
        while (i < source.length && source[i] !== "\n") {
          out += " ";
          i++;
        }
        continue;
      }

      // Commentaire de bloc.
      if (ch === "/" && next === "*") {
        out += "  ";
        i += 2;
        while (
          i < source.length &&
          !(source[i] === "*" && source[i + 1] === "/")
        ) {
          out += blank(source[i]);
          i++;
        }
        if (i < source.length) {
          out += "  ";
          i += 2;
        }
        continue;
      }

      // Chaîne simple ou double.
      if (ch === "'" || ch === '"') {
        const quote = ch;
        out += " ";
        i++;
        while (i < source.length) {
          const c = source[i];
          if (c === "\\") {
            out += " ";
            if (i + 1 < source.length) out += blank(source[i + 1]);
            i += 2;
            continue;
          }
          out += blank(c);
          i++;
          if (c === quote || c === "\n") break;
        }
        continue;
      }

      // Template literal.
      if (ch === "`") {
        out += " ";
        i++;
        while (i < source.length) {
          const c = source[i];
          if (c === "\\") {
            out += " ";
            if (i + 1 < source.length) out += blank(source[i + 1]);
            i += 2;
            continue;
          }
          if (c === "`") {
            out += " ";
            i++;
            break;
          }
          if (c === "$" && source[i + 1] === "{") {
            out += "${";
            i += 2;
            const [inner, nextIndex] = maskCode(i, "}");
            out += inner;
            i = nextIndex;
            continue;
          }
          out += blank(c);
          i++;
        }
        continue;
      }

      // Accolades : suivies pour délimiter correctement `${ ... }`.
      if (ch === "{") {
        braceDepth++;
        out += ch;
        i++;
        continue;
      }
      if (ch === "}") {
        if (braceDepth > 0) braceDepth--;
        out += ch;
        i++;
        continue;
      }

      out += ch;
      i++;
    }

    return [out, i];
  }

  return maskCode(0, undefined)[0];
}

function walk(dir, hits) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walk(full, hits);
    } else if (/\.ts$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      const masked = maskNonCode(content);
      // `createRequire` est le mécanisme ESM autorisé (ex: package.json).
      if (/createRequire\s*\(/.test(masked)) continue;
      const maskedLines = masked.split(/\n/);
      const originalLines = content.split(/\n/);
      maskedLines.forEach((line, i) => {
        if (/\brequire\s*\(/.test(line)) {
          hits.push(
            relative(process.cwd(), full) +
              ":" +
              (i + 1) +
              ": " +
              (originalLines[i] ?? line).trim().slice(0, 140)
          );
        }
      });
    }
  }
}

const hits = [];
walk(join(process.cwd(), "src"), hits);
console.log(
  "ESM strict — occurrences require() anti-pattern (fichiers SANS createRequire) dans src/: " + hits.length
);
hits.forEach((h) => console.log("  -", h));
if (hits.length > 0) {
  console.error(
    "❌ FAIL: src/ doit contenir 0 require() (ESM strict). Utilise import/export."
  );
  process.exit(1);
}
console.log("✅ Aucun require() dans src/ — ESM strict respecté");
