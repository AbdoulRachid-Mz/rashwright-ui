// Ambient declarations for peer dependencies when developing in isolation
// These peer dependencies are installed by the consumer Expo project via rs-ui CLI.

declare module "react-native-reanimated" {
  import type { ComponentType } from "react";
  import type { ViewStyle, TextStyle, ImageStyle } from "react-native";
  export const useSharedValue: <T>(initial: T) => { value: T };
  export const useAnimatedStyle: <T extends ViewStyle | TextStyle | ImageStyle>(updater: () => T, deps?: any[]) => T;
  export const useAnimatedScrollHandler: (handlers: any) => any;
  export const withTiming: (toValue: any, userConfig?: any, callback?: any) => any;
  export const withSpring: (toValue: any, userConfig?: any, callback?: any) => any;
  export const withRepeat: (animation: any, numberOfReps?: number, reverse?: boolean, callback?: any) => any;
  export const withSequence: (...animations: any[]) => any;
  export const withDelay: (delayMs: number, animation: any) => any;
  export const interpolate: (value: number, inputRange: number[], outputRange: any[], extrapolate?: any) => any;
  export const interpolateColor: (value: number, inputRange: number[], outputRange: string[]) => string;
  export const runOnJS: <T extends (...args: any[]) => any>(fn: T) => T;
  export const Easing: {
    linear: (t: number) => number;
    quad: (t: number) => number;
    cubic: (t: number) => number;
    bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => number;
    in: (easing: (t: number) => number) => (t: number) => number;
    out: (easing: (t: number) => number) => (t: number) => number;
    inOut: (easing: (t: number) => number) => (t: number) => number;
    sin: (t: number) => number;
    ease: (t: number) => number;
    back: (s?: number) => (t: number) => number;
    [key: string]: any;
  };
  export const Extrapolate: any;
  export const Extrapolation: any;
  export const createAnimatedComponent: <P extends object>(component: ComponentType<P>) => ComponentType<P>;
  const Animated: {
    View: ComponentType<any>;
    Text: ComponentType<any>;
    Image: ComponentType<any>;
    ScrollView: ComponentType<any>;
    FlatList: ComponentType<any>;
    createAnimatedComponent: <P extends object>(component: ComponentType<P>) => ComponentType<P>;
  };
  export default Animated;
}

declare module "@expo/vector-icons" {
  import type { ComponentType } from "react";
  import type { TextStyle, StyleProp } from "react-native";
  export interface IconProps {
    name: any;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    [key: string]: any;
  }
  export const Ionicons: ComponentType<IconProps> & { glyphMap: Record<string, any> };
  export const Feather: ComponentType<IconProps> & { glyphMap: Record<string, any> };
  export const MaterialIcons: ComponentType<IconProps> & { glyphMap: Record<string, any> };
  export const MaterialCommunityIcons: ComponentType<IconProps> & { glyphMap: Record<string, any> };
  export const FontAwesome: ComponentType<IconProps> & { glyphMap: Record<string, any> };
  export const AntDesign: ComponentType<IconProps> & { glyphMap: Record<string, any> };
}

declare module "expo-blur" {
  import type { ComponentType } from "react";
  import type { ViewProps } from "react-native";
  export interface BlurViewProps extends ViewProps {
    intensity?: number;
    tint?: "light" | "dark" | "default" | "extraLight" | "regular" | "prominent" | "systemUltraThinMaterial" | "systemThinMaterial" | "systemMaterial" | "systemThickMaterial" | "systemChromeMaterial";
    experimentalBlurMethod?: "none" | "dimezisBlurView";
  }
  export const BlurView: ComponentType<BlurViewProps>;
}

declare module "expo-linear-gradient" {
  import type { ComponentType } from "react";
  import type { ViewProps } from "react-native";
  export interface LinearGradientProps extends ViewProps {
    colors: readonly [string, string, ...string[]];
    start?: { x: number; y: number } | [number, number];
    end?: { x: number; y: number } | [number, number];
    locations?: number[];
  }
  export const LinearGradient: ComponentType<LinearGradientProps>;
}

declare module "expo-image" {
  import type { ComponentType } from "react";
  import type { ImageStyle, StyleProp } from "react-native";
  export interface ImageProps {
    source?: any;
    style?: StyleProp<ImageStyle>;
    contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
    placeholder?: any;
    transition?: number | { duration: number };
    onLoad?: (event: any) => void;
    onError?: (event: any) => void;
    onLoadEnd?: () => void;
    [key: string]: any;
  }
  export type { ImageStyle };
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
    mediaTypes?: MediaTypeOptions | string[] | any;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    selectionLimit?: number;
    [key: string]: any;
  }
  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function requestCameraPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
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
  export interface SaveOptions {
    compress?: number;
    format?: SaveFormat | "jpeg" | "png" | "webp" | string;
    base64?: boolean;
  }
  export enum SaveFormat {
    JPEG = "jpeg",
    PNG = "png",
    WEBP = "webp",
  }
  export function manipulateAsync(
    uri: string,
    actions?: ActionResize[],
    saveOptions?: SaveOptions
  ): Promise<ImageResult>;
}

declare module "expo-video" {
  import type { ComponentType } from "react";
  import type { ViewProps } from "react-native";
  export type VideoSource = string | { uri: string } | number | any;
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
    [key: string]: any;
  }
  export function useVideoPlayer(source: any, setup?: (player: VideoPlayer) => void): VideoPlayer;
  export interface VideoViewProps extends ViewProps {
    player: VideoPlayer;
    allowsFullscreen?: boolean;
    nativeControls?: boolean;
    startsPictureInPictureAutomatically?: boolean;
    contentFit?: "contain" | "cover" | "fill";
    onFirstFrameRender?: () => void;
    ref?: any;
    [key: string]: any;
  }
  export const VideoView: ComponentType<VideoViewProps>;
}

declare module "expo-router" {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    canGoBack: () => boolean;
  };
  export function useSegments(): string[];
  export function usePathname(): string;
  export function useLocalSearchParams<T extends Record<string, string>>(): T;
}

declare module "react-native-safe-area-context" {
  import type { ComponentType, ReactNode } from "react";
  import type { ViewProps } from "react-native";
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
    ref?: any;
  }
  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
  export const SafeAreaProvider: ComponentType<{ children?: ReactNode }>;
  export function useSafeAreaInsets(): EdgeInsets;
  export function useSafeAreaFrame(): { x: number; y: number; width: number; height: number };
}

declare module "react-native-gesture-handler" {
  import type { ComponentType } from "react";
  import type { ViewProps } from "react-native";
  export const GestureHandlerRootView: ComponentType<ViewProps>;
}
