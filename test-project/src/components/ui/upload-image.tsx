/**
 * @rashwright/ui-mobile — upload-image.tsx
 *
 * Composant de sélection, compression et téléversement d'images pour React Native & Expo.
 * Intégré nativement avec @rashwright/upload et supporte tous les fournisseurs :
 * Cloudinary, Firebase Storage, Vercel Blob, Local/API et Mock.
 */

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import type { IUploadProvider, UploadSource, UploadResult } from "@/lib/upload";
import { UploadManager } from "@/lib/upload";
import { useTheme } from "@/contexts/theme-context";

export interface UploadImageFile {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  fileName?: string;
}

export interface UploadImageRef {
  /** Upload toutes les images locales non encore téléversées */
  uploadAll: () => Promise<string[]>;
  /** Retourne la liste des URLs / URIs actuelles */
  getImages: () => string[];
}

export interface UploadImageLabels {
  title?: string;
  subtitle?: string;
  permissionTitle?: string;
  permissionMessage?: string;
  camera?: string;
  gallery?: string;
  cancel?: string;
  chooseSource?: string;
  maxReached?: string;
}

export interface UploadImageProps {
  /** Liste des URLs ou URIs locales */
  value: string[];
  /** Callback lors du changement de valeur */
  onChange: (urls: string[]) => void;
  /** Fournisseur d"upload ou instance UploadManager de @rashwright/upload */
  uploader?: IUploadProvider | UploadManager;
  /** Dossier de destination sur le serveur/cloud */
  folder?: string;
  /** Nombre maximum d'images autorisées (défaut : 5) */
  maxImages?: number;
  /** Sélection multiple dans la galerie */
  multiple?: boolean;
  /** Autoriser la caméra */
  enableCamera?: boolean;
  /** Autoriser la galerie */
  enableGallery?: boolean;
  /** Activer la compression avant upload */
  compress?: boolean;
  /** Qualité de compression JPEG (0.1 à 1.0, défaut : 0.8) */
  compressionQuality?: number;
  /** Téléversement automatique dès la sélection (défaut : true) */
  autoUpload?: boolean;
  /** Libellés personnalisés pour l'interface */
  labels?: UploadImageLabels;
  /** Styles du conteneur */
  style?: ViewStyle;
}

const DEFAULT_LABELS: Required<UploadImageLabels> = {
  title: "Ajouter des photos",
  subtitle: "PNG, JPG jusqu'à 10 Mo",
  permissionTitle: "Permission requise",
  permissionMessage: "Veuillez autoriser l'accès à vos photos pour continuer.",
  camera: "Prendre une photo",
  gallery: "Choisir depuis la galerie",
  cancel: "Annuler",
  chooseSource: "Sélectionner une source",
  maxReached: "Limite maximale de photos atteinte",
};

export const UploadImage = forwardRef<UploadImageRef, UploadImageProps>(
  (
    {
      value = [],
      onChange,
      uploader,
      folder = "uploads",
      maxImages = 5,
      multiple = true,
      enableCamera = true,
      enableGallery = true,
      compress = true,
      compressionQuality = 0.8,
      autoUpload = true,
      labels: customLabels,
      style,
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...customLabels }), [customLabels]);

    const [uploadingIndices, setUploadingIndices] = useState<number[]>([]);
    const [localQueue, setLocalQueue] = useState<UploadImageFile[]>([]);

    // Exposer l'impératif via ref (uploadAll, getImages)
    useImperativeHandle(ref, () => ({
      uploadAll: async () => {
        if (!uploader) return value;
        const uploadManager = uploader instanceof UploadManager ? uploader : new UploadManager({ provider: uploader });
        const pending = localQueue.filter((item) => !item.uri.startsWith("http"));
        const uploadedUrls: string[] = [];

        for (const item of pending) {
          const source: UploadSource = {
            name: item.fileName || `image_${Date.now()}.jpg`,
            type: item.type || "image/jpeg",
            uri: item.uri,
          };
          const res = await uploadManager.upload(source, { folder });
          if (res.success && res.url) {
            uploadedUrls.push(res.url);
          }
        }

        const finalUrls = [...value.filter((v) => v.startsWith("http")), ...uploadedUrls];
        onChange(finalUrls);
        setLocalQueue([]);
        return finalUrls;
      },
      getImages: () => value,
    }));

    // Compression d'image locale avec ImageManipulator
    const compressImage = useCallback(
      async (uri: string): Promise<string> => {
        if (!compress) return uri;
        try {
          const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1400 } }],
            { compress: compressionQuality, format: ImageManipulator.SaveFormat.JPEG }
          );
          return manipulated.uri;
        } catch {
          return uri;
        }
      },
      [compress, compressionQuality]
    );

    // Téléversement d'un élément via @rashwright/upload
    const uploadSingle = useCallback(
      async (file: UploadImageFile): Promise<string> => {
        if (!uploader) {
          // Sans provider fourni, on conserve l'URI locale
          return file.uri;
        }
        const uploadManager = uploader instanceof UploadManager ? uploader : new UploadManager({ provider: uploader });
        const source: UploadSource = {
          name: file.fileName || `image_${Date.now()}.jpg`,
          type: file.type || "image/jpeg",
          uri: file.uri,
        };
        const res = await uploadManager.upload(source, { folder });
        if (!res.success || !res.url) {
          throw new Error("Échec du téléversement de l'image.");
        }
        return res.url;
      },
      [uploader, folder]
    );

    // Gestion de la sélection par caméra ou galerie
    const handlePick = useCallback(
      async (sourceType: "camera" | "gallery") => {
        if (value.length >= maxImages) {
          Alert.alert(labels.permissionTitle, labels.maxReached);
          return;
        }

        try {
          let result: ImagePicker.ImagePickerResult;

          if (sourceType === "camera") {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert(labels.permissionTitle, labels.permissionMessage);
              return;
            }
            result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 1,
            });
          } else {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert(labels.permissionTitle, labels.permissionMessage);
              return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsMultipleSelection: multiple,
              selectionLimit: maxImages - value.length,
              quality: 1,
            });
          }

          if (result.canceled || !result.assets?.length) return;

          const remainingSlots = maxImages - value.length;
          const selectedAssets = result.assets.slice(0, remainingSlots);

          if (autoUpload && uploader) {
            // Téléversement direct
            const newStartIndex = value.length;
            const newIndices = selectedAssets.map((_: ImagePicker.ImagePickerAsset, i: number) => newStartIndex + i);
            setUploadingIndices((prev) => [...prev, ...newIndices]);

            const uploadPromises = selectedAssets.map(async (asset: ImagePicker.ImagePickerAsset) => {
              const compressedUri = await compressImage(asset.uri);
              return await uploadSingle({
                uri: compressedUri,
                fileName: asset.fileName || undefined,
                type: asset.mimeType || "image/jpeg",
              });
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            onChange([...value, ...uploadedUrls]);
            setUploadingIndices((prev) => prev.filter((i) => !newIndices.includes(i)));
          } else {
            // Mode différé (URI locale conservée)
            const compressedAssets = await Promise.all(
              selectedAssets.map(async (a: ImagePicker.ImagePickerAsset) => ({
                uri: await compressImage(a.uri),
                fileName: a.fileName || undefined,
                type: a.mimeType || "image/jpeg",
              }))
            );
            setLocalQueue((prev) => [...prev, ...compressedAssets]);
            onChange([...value, ...compressedAssets.map((c: { uri: string }) => c.uri)]);
          }
        } catch (err: unknown) {
          console.error("UploadImage error:", err);
          const message = err instanceof Error ? err.message : "Impossible de charger l'image.";
          Alert.alert("Erreur", message);
        }
      },
      [value, maxImages, labels, multiple, autoUpload, uploader, compressImage, uploadSingle, onChange]
    );

    // Dialogue de choix de source
    const openSourceSelector = useCallback(() => {
      if (enableCamera && enableGallery) {
        Alert.alert(labels.chooseSource, undefined, [
          { text: labels.camera, onPress: () => handlePick("camera") },
          { text: labels.gallery, onPress: () => handlePick("gallery") },
          { text: labels.cancel, style: "cancel" },
        ]);
      } else if (enableCamera) {
        handlePick("camera");
      } else if (enableGallery) {
        handlePick("gallery");
      }
    }, [enableCamera, enableGallery, labels, handlePick]);

    // Suppression d'une image
    const handleRemove = useCallback(
      (index: number) => {
        const next = value.filter((_, i) => i !== index);
        onChange(next);
        setLocalQueue((prev) => prev.filter((_, i) => i !== index));
      },
      [value, onChange]
    );

    const canAddMore = value.length < maxImages;

    return (
      <View style={[styles.container, style]}>
        <View style={styles.grid}>
          {value.map((uri, index) => {
            const isUploading = uploadingIndices.includes(index);
            return (
              <View key={`${uri}_${index}`} style={[styles.thumbnailWrap, { borderColor: theme.colors.border }]}>
                <Image source={{ uri }} style={styles.thumbnail} resizeMode="cover" />
                {isUploading && (
                  <View style={styles.overlayLoading}>
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                )}
                {!isUploading && (
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => handleRemove(index)}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={22} color={theme.colors.destructive} />
                  </Pressable>
                )}
              </View>
            );
          })}

          {canAddMore && (
            <Pressable
              onPress={openSourceSelector}
              style={[
                styles.addCard,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons name="cloud-upload-outline" size={28} color={theme.colors.primary} />
              <Text style={[styles.addText, { color: theme.colors.foreground }]}>{labels.title}</Text>
              <Text style={[styles.subText, { color: theme.colors.mutedForeground }]}>
                {value.length}/{maxImages}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }
);

UploadImage.displayName = "UploadImage";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  thumbnailWrap: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  overlayLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  addCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  addText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  subText: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default UploadImage;
