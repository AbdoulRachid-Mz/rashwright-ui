---
name: rs-ui/upload
description: Guide des utilitaires de gestion d'upload médias (images, vidéos) et gestionnaire d'état dans Rashwright UI Mobile
version: 0.3.0
componentVersion: 0.3.0
category: core
dependencies: []
expoDependencies:
  - expo-image-picker
  - expo-image-manipulator
---

# Upload Manager & Media Utilities (v0.3.0)

Le module **Upload** de Rashwright UI (`@/lib/upload`) fournit une abstraction robuste pour la sélection, la compression, l'optimisation et le téléversement de médias (images et vidéos) avec gestion de progression et d'erreurs typées.

---

## 1. Fonctionnalités Clés

- **Gestionnaire centralisé (`UploadManager`)** : File d'attente d'upload, progression en temps réel (`0-100%`), annulation (`cancelUpload`).
- **Support des Providers Multiples** : Adaptateurs extensibles pour S3, Cloudinary, Firebase Storage ou serveurs REST custom.
- **Gestion des erreurs typées (`UploadError`)** : Typage strict des causes d'échec (taille maximale dépassée, format non supporté, coupure réseau, timeout).
- **Intégration directe avec les composants UI** : Utilisé nativement par `UploadImage` et `UploadVideo`.

---

## 2. Exemple d'Utilisation

```tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { UploadManager, type UploadProgress } from '@/lib/upload';

export function MediaUploader() {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('idle');

  const startUpload = async (fileUri: string) => {
    const manager = new UploadManager();
    try {
      setStatus('uploading');
      await manager.upload({
        fileUri,
        endpoint: 'https://api.monsite.com/upload',
        onProgress: (p: UploadProgress) => {
          setProgress(p.percentage);
        },
      });
      setStatus('completed');
    } catch (error) {
      setStatus('error');
      console.error("Échec de l'upload", error);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Statut : {status} ({progress}%)</Text>
    </View>
  );
}
```

---

## 3. Bonnes Pratiques

1. **Compression préalable** : Utilisez toujours `expo-image-manipulator` pour redimensionner les images avant l'envoi afin d'économiser la bande passante mobile.
2. **Gestion du cycle de vie** : Pensez à appeler `manager.cancel()` si le composant est démonté avant la fin du transfert.
3. **Permissions** : Vérifiez que les permissions caméra / galerie sont accordées (`expo-image-picker`) avant de déclencher l'ouverture du sélecteur.
