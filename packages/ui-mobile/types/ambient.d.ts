// Ambient declarations for peer dependencies when developing in isolation
// These peer dependencies are installed by the consumer Expo project via rs-ui CLI.
// IMPORTANT : these are only used to compile @rashwright/ui-mobile when the real
// peer deps are not installed locally. The consumer project will always use the
// REAL typings provided by each Expo/RN package at runtime.

type PermissiveComponentProps = {
  children?: unknown;
  style?: unknown;
  ref?: unknown;
  [key: string]: unknown;
};

declare module "react-native-reanimated" {
  import type { ComponentType } from "react";

  interface SharedValue<T> {
    value: T;
  }

  export const useSharedValue: <T>(initial: T) => SharedValue<T>;

  export const useAnimatedStyle: <T>(
    updater: () => T,
    deps?: unknown[]
  ) => T;

  type ScrollHandler = Record<string, unknown>;
  export const useAnimatedScrollHandler: <H extends ScrollHandler>(
    handlers: H,
    deps?: unknown[]
  ) => H;

  export interface TimingConfig {
    [key: string]: unknown;
  }
  export interface SpringConfig {
    [key: string]: unknown;
  }
  export const withTiming: <T>(toValue: T, userConfig?: TimingConfig, callback?: (...args: unknown[]) => void) => T;
  export const withSpring: <T>(toValue: T, userConfig?: SpringConfig, callback?: (...args: unknown[]) => void) => T;

  export const withRepeat: <T>(
    animation: T,
    numberOfReps?: number,
    reverse?: boolean,
    callback?: (finished?: boolean) => void
  ) => T;

  export const withSequence: <T>(...animations: T[]) => T;

  export const withDelay: <T>(delayMs: number, animation: T) => T;

  export type ExtrapolationType = "extend" | "clamp" | "identity";

  export const interpolate: <T extends number | string>(
    value: number,
    inputRange: readonly number[],
    outputRange: readonly T[],
    extrapolate?: ExtrapolationType,
    extrapolateLeft?: ExtrapolationType,
    extrapolateRight?: ExtrapolationType
  ) => T;

  export const interpolateColor: (
    value: number,
    inputRange: readonly number[],
    outputRange: readonly string[],
    extrapolate?: ExtrapolationType
  ) => string;

  enum Extrapolate {
    EXTEND = "extend",
    CLAMP = "clamp",
    IDENTITY = "identity",
  }
  export { Extrapolate, Extrapolation };
  type Extrapolation = Extrapolate;
  export type { Extrapolation as ExtrapolationType };

  export const runOnJS: <A extends unknown[], R>(fn: (...args: A) => R) => (...args: A) => R;

  export const Easing: {
    linear: unknown;
    quad: unknown;
    cubic: unknown;
    bezier: (x1: number, y1: number, x2: number, y2: number) => unknown;
    in: (easing: unknown) => unknown;
    out: (easing: unknown) => unknown;
    inOut: (easing: unknown) => unknown;
    sin: unknown;
    ease: unknown;
    back: (s?: number) => unknown;
    bounce: unknown;
    elastic: (bounciness?: number) => unknown;
    [key: string]: unknown;
  };

  export const createAnimatedComponent: <P extends object>(component: ComponentType<P>) => ComponentType<P>;

  type AnimatedComponent = ComponentType<PermissiveComponentProps>;
  interface AnimatedNamespace {
    View: AnimatedComponent;
    Text: AnimatedComponent;
    Image: AnimatedComponent;
    ScrollView: AnimatedComponent;
    FlatList: AnimatedComponent;
    SectionList: AnimatedComponent;
    createAnimatedComponent: <P extends object>(component: ComponentType<P>) => ComponentType<P>;
  }
  const Animated: AnimatedNamespace;
  export default Animated;
}

declare module "@expo/vector-icons" {
  import type { ComponentType } from "react";
  import type { TextStyle, StyleProp } from "react-native";

  type IconName = string;

  export interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    [key: string]: unknown;
  }

  type IconSet = ComponentType<IconProps> & {
    glyphMap: Record<string, IconName>;
  };

  export const Ionicons: IconSet;
  export const Feather: IconSet;
  export const MaterialIcons: IconSet;
  export const MaterialCommunityIcons: IconSet;
  export const FontAwesome: IconSet;
  export const AntDesign: IconSet;
}

declare module "expo-blur" {
  import type { ComponentType } from "react";
  export const BlurView: ComponentType<PermissiveComponentProps>;
}

declare module "expo-linear-gradient" {
  import type { ComponentType } from "react";

  type Point = { x: number; y: number } | readonly [number, number];
  interface LinearGradientProps extends PermissiveComponentProps {
    colors: readonly [string, string, ...string[]];
    start?: Point;
    end?: Point;
    locations?: readonly number[];
  }
  export const LinearGradient: ComponentType<LinearGradientProps>;
}

declare module "expo-image" {
  import type { ComponentType } from "react";
  import type { ImageStyle, StyleProp } from "react-native";

  type ImageSource = string | { uri?: string; headers?: Record<string, string> } | number | null;
  type ImageTransition = number | { duration?: number; effect?: unknown };

  interface ImageProps extends PermissiveComponentProps {
    source?: ImageSource;
    style?: StyleProp<ImageStyle>;
    contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
    placeholder?: ImageSource;
    transition?: ImageTransition;
    onLoad?: (event: unknown) => void;
    onError?: (event: unknown) => void;
    onLoadEnd?: () => void;
  }
  export type { ImageStyle, ImageProps };
  export const Image: ComponentType<ImageProps>;
}

declare module "expo-haptics" {
  export enum ImpactFeedbackStyle {
    Light = "light",
    Medium = "medium",
    Heavy = "heavy",
    Rigid = "rigid",
    Soft = "soft",
  }
  export enum NotificationFeedbackType {
    Success = "success",
    Warning = "warning",
    Error = "error",
  }
  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
  export function selectionAsync(): Promise<void>;
}

declare module "expo-device" {
  export const brand: string | null;
  export const manufacturer: string | null;
  export const modelName: string | null;
  export const deviceName: string | null;
  export const osName: string | null;
  export const osVersion: string | null;
  export const isDevice: boolean;
  export enum DeviceType {
    UNKNOWN = 0,
    PHONE = 1,
    TABLET = 2,
    DESKTOP = 3,
    TV = 4,
  }
  export const deviceType: DeviceType | null;
  export function getDeviceTypeAsync(): Promise<DeviceType>;
}

declare module "expo-application" {
  export const nativeApplicationVersion: string | null;
  export const nativeBuildVersion: string | null;
  export const applicationId: string | null;
  export function getAndroidId(): Promise<string | null>;
  export function getIosIdForVendorAsync(): Promise<string | null>;
}

declare module "expo-image-picker" {
  export enum MediaTypeOptions {
    All = "All",
    Videos = "Videos",
    Images = "Images",
  }
  export interface ImagePickerAsset {
    uri: string;
    width: number;
    height: number;
    type?: "image" | "video";
    fileName?: string | null;
    fileSize?: number;
    mimeType?: string;
    duration?: number | null;
  }
  export interface ImagePickerResult {
    canceled: boolean;
    assets: ImagePickerAsset[] | null;
  }
  export interface ImagePickerOptions {
    mediaTypes?: MediaTypeOptions | readonly string[];
    allowsEditing?: boolean;
    aspect?: readonly [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    selectionLimit?: number;
    videoMaxDuration?: number;
    cameraType?: "front" | "back";
    presentationStyle?: number;
    [key: string]: unknown;
  }
  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;

  type PermissionResult = Promise<{
    status: string;
    granted: boolean;
    canAskAgain?: boolean;
    expires?: "never" | number;
    scope?: "onlyWhenInUse" | "always" | "none";
  }>;

  export function requestMediaLibraryPermissionsAsync(): PermissionResult;
  export function requestCameraPermissionsAsync(): PermissionResult;
  export function getPendingResultAsync(): Promise<ImagePickerResult[]>;
  export function getCameraPermissionsAsync(): PermissionResult;
  export function getMediaLibraryPermissionsAsync(): PermissionResult;
}

declare module "expo-image-manipulator" {
  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }
  export interface ActionResize {
    resize: { width?: number; height?: number };
  }
  export interface ActionRotate {
    rotate: number;
  }
  export interface ActionFlip {
    flip: FlipType;
  }
  export interface ActionCrop {
    crop: { originX: number; originY: number; width: number; height: number };
  }
  export type Action = ActionResize | ActionRotate | ActionFlip | ActionCrop;

  export enum SaveFormat {
    JPEG = "jpeg",
    PNG = "png",
    WEBP = "webp",
  }
  export enum FlipType {
    Vertical = "vertical",
    Horizontal = "horizontal",
  }
  export interface SaveOptions {
    compress?: number;
    format?: SaveFormat | "jpeg" | "png" | "webp" | string;
    base64?: boolean;
  }
  export function manipulateAsync(
    uri: string,
    actions?: readonly Action[],
    saveOptions?: SaveOptions
  ): Promise<ImageResult>;
}

declare module "expo-video" {
  import type { ComponentType } from "react";

  export type VideoSource = string | { uri: string } | number | null;

  export interface VideoPlayer {
    loop: boolean;
    playing: boolean;
    play: () => void;
    pause: () => void;
    currentTime: number;
    duration: number;
    muted: boolean;
    volume: number;
    status: string;
    playbackRate?: number;
    seek: (seconds: number, tolerance?: number) => void;
    replace: (source: VideoSource) => void;
  }

  export function useVideoPlayer<S>(
    source: S,
    setup?: (player: VideoPlayer) => void
  ): VideoPlayer;

  export interface VideoViewProps extends PermissiveComponentProps {
    player: VideoPlayer;
    allowsFullscreen?: boolean;
    nativeControls?: boolean;
    startsPictureInPictureAutomatically?: boolean;
    contentFit?: "contain" | "cover" | "fill";
    onFirstFrameRender?: () => void;
  }
  export type { VideoViewProps };
  export const VideoView: ComponentType<VideoViewProps>;
}

declare module "expo-router" {
  type Router = {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    canGoBack: () => boolean;
    dismiss: () => void;
    dismissAll: () => void;
    navigate: (url: string) => void;
    reload: () => void;
    setParams: <T extends Record<string, unknown>>(params?: T) => void;
  };
  export function useRouter(): Router;
  export function useSegments(): string[];
  export function usePathname(): string;
  export function useLocalSearchParams<T extends Record<string, string | string[]> = Record<string, string>>(): T;
  export function useGlobalSearchParams<T extends Record<string, string | string[]> = Record<string, string>>(): T;
  export const Stack: unknown;
  export const Tabs: unknown;
  export const Drawer: unknown;
  export const Slot: unknown;
  export const Redirect: unknown;
  export function Link(props: PermissiveComponentProps): unknown;
}

declare module "react-native-safe-area-context" {
  import type { ComponentType, ReactNode } from "react";
  import type { ViewProps, StyleProp, ViewStyle } from "react-native";

  export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
  export interface SafeAreaViewProps extends ViewProps {
    children?: ReactNode;
    edges?: readonly ("top" | "right" | "bottom" | "left")[];
    mode?: "padding" | "margin";
  }
  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
  export const SafeAreaProvider: ComponentType<{
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    initialMetrics?: typeof initialWindowMetrics;
  }>;
  export function useSafeAreaInsets(): EdgeInsets;
  export function useSafeAreaFrame(): { x: number; y: number; width: number; height: number };
  export const initialWindowMetrics:
    | {
        frame: { x: number; y: number; width: number; height: number };
        insets: EdgeInsets;
      }
    | null
    | undefined;
}

declare module "react-native-gesture-handler" {
  import type { ComponentType } from "react";
  export const GestureHandlerRootView: ComponentType<PermissiveComponentProps>;
  export const GestureDetector: ComponentType<PermissiveComponentProps>;
  export const Gesture: unknown;
  export const Directions: Record<string, number>;
}
