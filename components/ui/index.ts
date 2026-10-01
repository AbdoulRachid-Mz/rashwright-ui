// @/components/ui/index.ts
//
// Barrel d'exportation unifié pour la bibliothèque UI Liquid Glass.
// Conserve 100% des exports existants et expose les nouveaux composants et primitives.

// ---------------------------------------------------------------------------
// 1. Primitives Liquid Glass
// ---------------------------------------------------------------------------
export { default as LiquidSurface } from "./liquid/liquid-surface";
export { default as LiquidPressable } from "./liquid/liquid-pressable";
export { default as LiquidHighlight } from "./liquid/liquid-highlight";
export { default as LiquidBorder } from "./liquid/liquid-border";
export { default as LiquidGlow } from "./liquid/liquid-glow";
export { default as LiquidBlob } from "./liquid/liquid-blob";
export { getLiquidShadow, mergeShadows } from "./liquid/liquid-shadow";
export * from "./liquid/liquid-types";

// ---------------------------------------------------------------------------
// 2. Composants de Base & Layout
// ---------------------------------------------------------------------------
export { default as View, default as ThemedView } from "./view";
export { default as Text, default as ThemedText } from "./text";
export { default as Image } from "./image";
export { default as Spacer } from "./spacer";
export { default as Dot } from "./dot";
export { default as SafeAreaView } from "./safe-area-view";
export { default as KeyboardAvoidingView } from "./keyboard-avoiding-view";
export { default as ScrollView } from "./scroll-view";
export { default as FlatList } from "./flat-list";
export { default as SectionList } from "./section-list";

// ---------------------------------------------------------------------------
// 3. Boutons & Contrôles
// ---------------------------------------------------------------------------
export { default as Button } from "./button";
export { default as IconButton } from "./icon-button";
export { default as FloatingActionButton } from "./floating-action-button";
export { default as FabMenu } from "./fab-menu";
export { default as Switch } from "./switch";
export { default as Checkbox } from "./checkbox";
export { Radio, RadioGroup } from "./radio";
export { default as Slider } from "./slider";

// ---------------------------------------------------------------------------
// 4. Champs de Saisie & Sélection
// ---------------------------------------------------------------------------
export { default as TextInput } from "./text-input";
export { default as SearchInput } from "./search-input";
export { default as Select } from "./select";
export { TimePicker } from "./time-picker";

// ---------------------------------------------------------------------------
// 5. Cartes, Badges & Présentation
// ---------------------------------------------------------------------------
export { default as Card } from "./card";
export { default as GlassCard } from "./glass-card";
export { default as StatCard } from "./stat-card";
export { default as Badge } from "./badge";
export { default as Chip } from "./chip";
export { default as Avatar } from "./avatar";
export { default as AvatarGroup } from "./avatar-group";
export { default as Divider } from "./divider";
export { default as Icon } from "./icon";

// ---------------------------------------------------------------------------
// 6. Navigation & Menus
// ---------------------------------------------------------------------------
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { default as SegmentedControl } from "./segmented-control";
export { default as DropdownMenu } from "./dropdown-menu";
export { ActionsGrid } from "./actions-grid";
export { Carousel } from "./carousel";

// ---------------------------------------------------------------------------
// 7. Modales, Overlays & Feedback
// ---------------------------------------------------------------------------
export { default as Modal } from "./modal";
export { default as Drawer } from "./drawer";
export { default as BottomSheet } from "./bottom-sheet";
export { ConfirmProvider, useConfirm } from "./confirm";
export { default as Popup } from "./popup";
export { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
export { Alert } from "./alert";

// ---------------------------------------------------------------------------
// 8. Chargement, Squelettes & États
// ---------------------------------------------------------------------------
export { default as ActivityIndicator } from "./activity-indicator";
export {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  SkeletonCard,
} from "./skeleton";
export { default as Shimmer } from "./shimmer";
export { ScreenSkeleton, DashboardSkeleton } from "./screen-skeleton";
export { default as EmptyState } from "./empty-state";
export { default as ErrorState } from "./error-state";
export { default as LoadingState } from "./loading-state";
export { Particles } from "./particles";

// ---------------------------------------------------------------------------
// 9. Adaptateur Thème Glass & Brand
// ---------------------------------------------------------------------------
export { createGlassTheme } from "../../constants/glass-theme";
export { RashwrightLogo } from "./rashwright-logo";
export { RashwrightShowcaseScreen } from "./showcase-screen";
export { UploadImage } from "./upload-image";
export { UploadVideo } from "./upload-video";


