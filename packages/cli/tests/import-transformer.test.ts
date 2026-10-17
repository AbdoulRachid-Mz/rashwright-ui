import { describe, it, expect } from "vitest";
import {
  resolveTransformedImportPath,
  transformImports,
} from "../src/core/transformers/import-transformer.js";

describe("import-transformer (AST Transformers)", () => {
  describe("resolveTransformedImportPath", () => {
    it("rewrites standard prefix @/ to custom prefix ~/", () => {
      const result = resolveTransformedImportPath("@/components/ui/button", {
        toPrefix: "~/",
      });
      expect(result).toBe("~/components/ui/button");
    });

    it("leaves third-party imports intact", () => {
      const result = resolveTransformedImportPath("react-native", {
        toPrefix: "~/",
      });
      expect(result).toBe("react-native");
    });

    it("respects targeted alias mapping for components", () => {
      const result = resolveTransformedImportPath("@/components/ui/card", {
        aliases: {
          components: "@/shared/ui",
        },
      });
      expect(result).toBe("@/shared/ui/card");
    });

    it("respects targeted alias mapping for contexts and hooks", () => {
      const resContext = resolveTransformedImportPath("@/contexts/theme-context", {
        aliases: {
          contexts: "~/features/theme",
        },
      });
      expect(resContext).toBe("~/features/theme/theme-context");

      const resHook = resolveTransformedImportPath("@/hooks/use-media-query", {
        aliases: {
          hooks: "@hooks",
        },
      });
      expect(resHook).toBe("@hooks/use-media-query");
    });
  });

  describe("transformImports", () => {
    it("rewrites import declarations in TSX source code", () => {
      const source = `import React from "react";
import Button from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
export * from "@/components/ui/card";
`;

      const transformed = transformImports(source, {
        toPrefix: "~/",
      });

      expect(transformed).toContain('import Button from "~/components/ui/button";');
      expect(transformed).toContain('import { useTheme } from "~/contexts/theme-context";');
      expect(transformed).toContain('export * from "~/components/ui/card";');
      expect(transformed).toContain('import React from "react";');
    });

    it("handles single-quoted imports and dynamic imports", () => {
      const source = `import Button from '@/components/ui/button';
const Mod = await import('@/lib/utils');
`;

      const transformed = transformImports(source, {
        toPrefix: "@app/",
      });

      expect(transformed).toContain("import Button from '@app/components/ui/button';");
      expect(transformed).toContain("const Mod = await import('@app/lib/utils');");
    });

    it("returns unchanged source if no prefix or aliases are supplied", () => {
      const source = `import Button from "@/components/ui/button";`;
      expect(transformImports(source, {})).toBe(source);
    });
  });
});
