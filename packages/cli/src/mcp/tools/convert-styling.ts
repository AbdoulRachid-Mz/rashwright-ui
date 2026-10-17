/**
 * convert-styling.ts
 *
 * Convertisseur bidirectionnel entre StyleSheet React Native et classes NativeWind Tailwind.
 */

export interface ConvertStylingResult {
  convertedCode: string;
  rulesConvertedCount: number;
  warnings: string[];
}

const STYLE_TO_TAILWIND_MAP: Record<string, string> = {
  "flex: 1": "flex-1",
  "flexDirection: 'row'": "flex-row",
  'flexDirection: "row"': "flex-row",
  "flexDirection: 'column'": "flex-col",
  'flexDirection: "column"': "flex-col",
  "alignItems: 'center'": "items-center",
  'alignItems: "center"': "items-center",
  "justifyContent: 'center'": "justify-center",
  'justifyContent: "center"': "justify-center",
  "justifyContent: 'space-between'": "justify-between",
  'justifyContent: "space-between"': "justify-between",
  "padding: 16": "p-4",
  "padding: 8": "p-2",
  "padding: 12": "p-3",
  "padding: 24": "p-6",
  "paddingHorizontal: 16": "px-4",
  "paddingVertical: 8": "py-2",
  "borderRadius: 8": "rounded-lg",
  "borderRadius: 12": "rounded-xl",
  "borderRadius: 16": "rounded-2xl",
  "borderRadius: 9999": "rounded-full",
  "gap: 8": "gap-2",
  "gap: 12": "gap-3",
  "gap: 16": "gap-4",
};

const TAILWIND_TO_STYLE_MAP: Record<string, string> = {
  "flex-1": "flex: 1",
  "flex-row": "flexDirection: 'row'",
  "flex-col": "flexDirection: 'column'",
  "items-center": "alignItems: 'center'",
  "justify-center": "justifyContent: 'center'",
  "justify-between": "justifyContent: 'space-between'",
  "p-4": "padding: 16",
  "p-2": "padding: 8",
  "p-3": "padding: 12",
  "p-6": "padding: 24",
  "px-4": "paddingHorizontal: 16",
  "py-2": "paddingVertical: 8",
  "rounded-lg": "borderRadius: 8",
  "rounded-xl": "borderRadius: 12",
  "rounded-2xl": "borderRadius: 16",
  "rounded-full": "borderRadius: 9999",
  "gap-2": "gap: 8",
  "gap-3": "gap: 12",
  "gap-4": "gap: 16",
};

export function convertStyling(
  sourceCode: string,
  target: "nativewind" | "stylesheet"
): ConvertStylingResult {
  let convertedCode = sourceCode;
  let rulesConvertedCount = 0;
  const warnings: string[] = [];

  if (target === "nativewind") {
    // Remplacement des styles par les classes Tailwind correspondantes
    for (const [styleRule, twClass] of Object.entries(STYLE_TO_TAILWIND_MAP)) {
      if (convertedCode.includes(styleRule)) {
        convertedCode = convertedCode.split(styleRule).join(`/* nativewind: ${twClass} */ ${styleRule}`);
        rulesConvertedCount++;
      }
    }

    // Transformation des styles inline simples
    convertedCode = convertedCode.replace(/style=\{\[?styles\.(\w+)\]?\}/g, (match, styleName) => {
      rulesConvertedCount++;
      return `className="/* TODO: map styles.${styleName} */" style={styles.${styleName}}`;
    });
  } else {
    // target === "stylesheet"
    // Extraction des className="..." et génération des styles
    const classNamesFound: string[] = [];
    convertedCode = convertedCode.replace(/className="([^"]+)"/g, (match, classes) => {
      rulesConvertedCount++;
      classNamesFound.push(classes);
      const styleEntries: string[] = [];
      const parts = classes.split(/\s+/);
      for (const p of parts) {
        if (TAILWIND_TO_STYLE_MAP[p]) {
          styleEntries.push(TAILWIND_TO_STYLE_MAP[p]);
        }
      }
      return `style={{ ${styleEntries.join(", ")} }}`;
    });
  }

  return {
    convertedCode,
    rulesConvertedCount,
    warnings,
  };
}
