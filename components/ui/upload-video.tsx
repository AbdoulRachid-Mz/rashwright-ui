/**
 * @rashwright/ui-mobile — upload-video.tsx
 *
 * Composant de sélection et téléversement de vidéos pour React Native & Expo.
 * Intégré nativement avec @rashwright/upload et supporte Cloudinary, Firebase Storage,
 * Vercel Blob, Local/API et Mock.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import type { IUploadProvider, UploadSource, UploadResult } from "@rashwright/upload";
import { UploadManager } from "@rashwright/upload";
import { useTheme } from "../../contexts/theme-context";
import LiquidSurface from "./liquid/liquid-surface";

export interface UploadVideoLabels {
  title?: string;
  subtitle?: string;
  changeVideo?: string;
  removeVideo?: string;
  uploading?: string;
  success?: string;
  errorTitle?: string;
  errorMessage?: string;
  permissionTitle?: string;
  permissionMessage?: string;
}

export interface UploadVideoProps {
  /** URL ou URI de la vidéo actuelle */
  value?: string;
  /** Callback lors du changement de vidéo */
  onChange: (url: string) => void;
  /** Callback lors de la suppression */
  onRemove?: () => void;
  /** Fournisseur d'upload ou instance UploadManager de @rashwright/upload */
  uploader?: IUploadProvider | UploadManager;
  /** Dossier de destination sur le serveur/cloud */
  folder?: string;
  /** Durée maximale autorisée en secondes (défaut : 120s / 2 min) */
  maxDurationSeconds?: number;
  /** Téléversement automatique dès sélection */
  autoUpload?: boolean;
  /** Libellés personnalisés */
  labels?: UploadVideoLabels;
  /** Styles du conteneur */
  style?: ViewStyle;
}

const DEFAULT_LABELS: Required<UploadVideoLabels> = {
  title: "Ajouter une vidéo",
  subtitle: "MP4, MOV jusqu'à 2 min",
  changeVideo: "Changer la vidéo",
  removeVideo: "Supprimer la vidéo",
  uploading: "Téléversement de la vidéo en cours...",
  success: "Vidéo téléversée avec succès.",
  errorTitle: "Erreur de téléversement",
  errorMessage: "Impossible de téléverser la vidéo.",
  permissionTitle: "Permission requise",
  permissionMessage: "Veuillez autoriser l'accès à vos vidéos pour continuer.",
};

export function UploadVideo({
  value,
  onChange,
  onRemove,
  uploader,
  folder = "videos",
  maxDurationSeconds = 120,
  autoUpload = true,
  labels: customLabels,
  style,
}: UploadVideoProps) {
  const { theme, isDark } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const labels = { ...DEFAULT_LABELS, ...customLabels };

  const handlePickVideo = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(labels.permissionTitle, labels.permissionMessage);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: maxDurationSeconds,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset) return;

      if (!autoUpload || !uploader) {
        onChange(asset.uri);
        return;
      }

      setUploading(true);
      setProgress(0);

      const uploadManager = uploader instanceof UploadManager ? uploader : new UploadManager({ provider: uploader });
      const source: UploadSource = {
        name: asset.fileName || `video_${Date.now()}.mp4`,
        type: asset.mimeType || "video/mp4",
        uri: asset.uri,
      };

      const res = await uploadManager.upload(source, {
        folder,
        onProgress: (p) => setProgress(p),
      });

      if (res.success && res.url) {
        onChange(res.url);
      } else {
        throw new Error(labels.errorMessage);
      }
    } catch (err: any) {
      console.error("UploadVideo error:", err);
      Alert.alert(labels.errorTitle, err?.message || labels.errorMessage);
    } finally {
      setUploading(false);
    }
  }, [labels, maxDurationSeconds, autoUpload, uploader, folder, onChange]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
  }, [onRemove, onChange]);

  const hasVideo = !!value;

  return (
    <View style={[styles.container, style]}>
      {hasVideo ? (
        <LiquidSurface style={[styles.previewCard, { borderColor: theme.colors.border }]}>
          <View style={styles.previewInfo}>
            <Ionicons name="videocam" size={28} color={theme.colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.videoTitle, { color: theme.colors.foreground }]} numberOfLines={1}>
                {value.split("/").pop() || "Vidéo sélectionnée"}
              </Text>
              <Text style={[styles.videoSub, { color: theme.colors.mutedForeground }]}>
                {value.startsWith("http") ? "Téléversée sur le cloud" : "Fichier local"}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handlePickVideo} style={styles.actionBtn}>
              <Ionicons name="refresh" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>{labels.changeVideo}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRemove} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={theme.colors.destructive} />
              <Text style={[styles.actionText, { color: theme.colors.destructive }]}>{labels.removeVideo}</Text>
            </TouchableOpacity>
          </View>
        </LiquidSurface>
      ) : (
        <TouchableOpacity
          onPress={handlePickVideo}
          disabled={uploading}
          style={[
            styles.uploadCard,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
              borderColor: theme.colors.border,
            },
          ]}
        >
          {uploading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.uploadingText, { color: theme.colors.mutedForeground }]}>
                {labels.uploading} {progress > 0 ? `(${progress}%)` : ""}
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(30,58,138,0.08)" }]}>
                <Ionicons name="videocam-outline" size={26} color={theme.colors.primary} />
              </View>
              <Text style={[styles.title, { color: theme.colors.foreground }]}>{labels.title}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>{labels.subtitle}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  uploadCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  loadingWrap: {
    alignItems: "center",
    gap: 8,
  },
  uploadingText: {
    fontSize: 13,
  },
  previewCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  previewInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  videoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150,150,150,0.2)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default UploadVideo;
