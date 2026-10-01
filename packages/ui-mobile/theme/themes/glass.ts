import { createGlassTheme } from "../../constants/glass-theme";
import { lightTheme, darkTheme } from "../../constants/theme";

export { createGlassTheme };
export const defaultLightGlass = createGlassTheme(lightTheme, false);
export const defaultDarkGlass = createGlassTheme(darkTheme, true);
export type { GlassTokens, LiquidMaterial, LiquidIntensity } from "../../constants/glass-theme";
