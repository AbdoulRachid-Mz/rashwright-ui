/**
 * sdk-versions.ts — Source unique des versions Expo SDK supportées.
 *
 * Cette liste est la seule autorité du dépôt. Elle doit rester alignée sur :
 *   - les matrices `registry/versions/expo-<sdk>.json` ;
 *   - `registry/index.json#sdkVersions` (régénéré par `sync-registry`) ;
 *   - les tests `tests/sdk-versions.test.ts` et `scripts/validate-registry.ts`.
 *
 * Seules les versions réellement publiées par Expo sont déclarées. Un SDK
 * inconnu ne retombe jamais silencieusement sur la dernière version : il lève
 * une erreur explicite que la commande appelante doit afficher.
 */

export const SUPPORTED_SDK_VERSIONS = [54, 55, 56, 57, 58] as const;

export type SupportedSdk = (typeof SUPPORTED_SDK_VERSIONS)[number];

export const MINIMUM_SDK_VERSION: SupportedSdk = SUPPORTED_SDK_VERSIONS[0];

export const LATEST_SUPPORTED_SDK: SupportedSdk =
  SUPPORTED_SDK_VERSIONS[SUPPORTED_SDK_VERSIONS.length - 1];

export function isSupportedSdk(value: number): value is SupportedSdk {
  return (SUPPORTED_SDK_VERSIONS as readonly number[]).includes(value);
}

export class UnsupportedSdkVersionError extends Error {
  constructor(readonly raw: string) {
    super(
      `SDK Expo "${raw}" non supporté. Versions supportées : ${SUPPORTED_SDK_VERSIONS.join(
        ", "
      )} (dernière : ${LATEST_SUPPORTED_SDK}).`,
    );
    this.name = "UnsupportedSdkVersionError";
  }
}

/**
 * Résout "latest", une valeur absente ou un numéro de SDK.
 *
 * - `"latest"`, `undefined` ou `""` → dernière version supportée (choix
 *   explicite, jamais une version npm `latest` non contrôlée) ;
 * - numéro supporté → ce numéro ;
 * - toute autre valeur → `UnsupportedSdkVersionError`.
 */
export function resolveSdkVersion(
  raw: string | number | undefined,
): SupportedSdk {
  if (raw === undefined || raw === "") {
    return LATEST_SUPPORTED_SDK;
  }
  if (typeof raw === "string" && raw.trim().toLowerCase() === "latest") {
    return LATEST_SUPPORTED_SDK;
  }

  const num = Number(raw);
  if (Number.isInteger(num) && isSupportedSdk(num)) {
    return num;
  }

  throw new UnsupportedSdkVersionError(String(raw));
}
