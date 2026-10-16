# Installation (https://www.nativewind.dev/v5/getting-started/installation)

> If you'd like to skip manual setup and use Nativewind, you can use the following command to initialize a new Expo project with Nativewind v5 and Tailwind CSS. Check the generated package versions against the RC target below.
>
> npm
>
> ```bash
> npx rn-new@next --nativewind
> ```
>
> yarn
>
> ```bash
> yarn dlx rn-new@next --nativewind
> ```
>
> pnpm
>
> ```bash
> pnpx rn-new@next --nativewind
> ```
>
> bun
>
> ```bash
> bunx rn-new@next --nativewind
> ```

## Nativewind v5 RC0

These instructions target `nativewind@5.0.0-rc.0` with `react-native-css@3.1.0-rc.0`. V4 remains the stable release. Existing apps should follow [Migrate from v4](https://www.nativewind.dev/v5/guides/migrate-from-v4) or [Upgrade a v5 preview](https://www.nativewind.dev/v5/guides/migrate-from-preview).

## Installation with Expo

### 1. Install Nativewind

Install the exact RC pair together. Nativewind 5.0.0-rc.0 requires react-native-css 3.1.0-rc.0; do not combine the RC with an unpinned engine.

npm

```bash
npm install --save-exact nativewind@5.0.0-rc.0 react-native-css@3.1.0-rc.0
```

yarn

```bash
yarn add --exact nativewind@5.0.0-rc.0 react-native-css@3.1.0-rc.0
```

pnpm

```bash
pnpm add --save-exact nativewind@5.0.0-rc.0 react-native-css@3.1.0-rc.0
```

bun

```bash
bun add --exact nativewind@5.0.0-rc.0 react-native-css@3.1.0-rc.0
```

In an Expo project, let Expo select compatible native dependencies:

```bash
npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context expo-system-ui
```

The tested target is Expo 57.0.22, React Native 0.86.3, React 19.2.3, Reanimated 4.5.1 and Worklets 0.10.1. The engine declares React Native >=0.81 and @expo/metro-config >=54 minimums; those minimums do not establish RC verification on every older SDK. Handle an Expo SDK upgrade separately from the styling migration.

### 2. Setup Tailwind CSS

**Install Tailwind CSS**

npm

```bash
npm install --save-dev --save-exact tailwindcss@4.1.12 @tailwindcss/postcss@4.1.12 postcss lightningcss@1.30.1
```

yarn

```bash
yarn add --dev --exact tailwindcss@4.1.12 @tailwindcss/postcss@4.1.12 postcss lightningcss@1.30.1
```

pnpm

```bash
pnpm add --save-dev --save-exact tailwindcss@4.1.12 @tailwindcss/postcss@4.1.12 postcss lightningcss@1.30.1
```

bun

```bash
bun add --dev --exact tailwindcss@4.1.12 @tailwindcss/postcss@4.1.12 postcss lightningcss@1.30.1
```

Optionally, install `prettier-plugin-tailwindcss` as a dev dependency to automatically format your Tailwind CSS code.

**Add Tailwind to your PostCSS configuration**

Create a `postcss.config.mjs` file in the root of your Expo project if you don't already have one, then add `@tailwindcss/postcss` there, or wherever PostCSS is configured in your project.

```js title="postcss.config.mjs"
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Expo 57 discovers `postcss.config.js` and `postcss.config.mjs`; do not name this file `postcss.config.cjs`.

Create a `global.css` file and add the Tailwind directives.

```css title="global.css"
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";
```

> From here onwards, replace `./global.css` with the relative path to the CSS file you just created.

> Keep utilities unlayered as shown above. A single `@import "tailwindcss"` can put utilities below React Native Web defaults in the CSS cascade, even when the build succeeds.

### 3. Create or modify your metro.config.js

Run `npx expo customize metro.config.js` to create a `metro.config.js` file if you don't already have one, then wrap the default config with `withNativewind`.

```js title="metro.config.js"
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
```

### 4. Import your CSS file

```js title="App.js"
import "./global.css";

export default function App() {
  return null; // Replace with your app.
}
```

> You should import your CSS file inside the same file as the top-most component of
> your app. Do **not** import it in the same file that calls
> `AppRegistry.registerComponent` or your app will not Fast Refresh properly.

For Expo Router, import the CSS once in `app/_layout.tsx`. Keep `babel-preset-expo` and any unrelated Babel plugins; remove only the v4 Nativewind preset and JSX import source settings.

For system appearance, install `expo-system-ui` as above and set `"userInterfaceStyle": "automatic"` inside the `expo` object in `app.json`. Rebuild after changing native dependencies or native configuration.

### 5. Override the lightningcss version

Force `lightningcss` to a specific version in your `package.json`:

npm

```json title="package.json"
{
  "overrides": {
    "lightningcss": "1.30.1"
  }
}
```

yarn

```json title="package.json"
{
  "resolutions": {
    "lightningcss": "1.30.1"
  }
}
```

pnpm

```json title="package.json"
{
  "pnpm": {
    "overrides": {
      "lightningcss": "1.30.1"
    }
  }
}
```

bun

```json title="package.json"
{
  "overrides": {
    "lightningcss": "1.30.1"
  }
}
```

> If you don't pin the `lightningcss` version, you may encounter deserialization errors with respect to `global.css` when building your app.

### 6. TypeScript setup (optional)

> You can bypass manually creating this file by running `npx expo start --clear` in your Expo project's root directory.

If you're using TypeScript in your project, you'll need to set up the type definitions. Nativewind extends the React Native types via declaration merging. The simplest method to include the types is to create a new `nativewind-env.d.ts` file and add a [triple-slash directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) referencing the types.

```tsx
/// <reference types="react-native-css/types" />

// NOTE: This file should not be edited and should be committed with your source code. It is generated by react-native-css. If you need to move or disable this file, please see the documentation.
```

> CAUTION
>
> Do not call this file:
>
> * `nativewind.d.ts`
> * The same name as a file or folder in the same directory e.g `app.d.ts` when an `/app` folder exists
> * The same name as a folder in `node_modules`, e.g `react.d.ts`
>
> By doing so, your types will not be picked up by the TypeScript compiler.

Ensure this declaration file is included by your tsconfig. If TypeScript reports an unresolved side effect CSS import, add `declare module "*.css";` to an application declaration file included by that project. Do not retain obsolete v4 declarations to silence missing RC props.

## Try it out!

Create a simple component to test your Nativewind setup:

```tsx title="App.tsx"
import "./global.css"
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
    </View>
  );
}
```

This example shows:

* Using `className` prop to style components
* Tailwind utility classes like `flex-1`, `items-center`, `justify-center`
* Color utilities like `bg-white`, `text-blue-500`
* Typography utilities like `text-xl`, `font-bold`

If you see the styled text centered on a white background, Nativewind is working correctly!

## Additional Setup Guides

* [Editor Setup](https://www.nativewind.dev/v5/getting-started/editor-setup) - Learn how to set up your editor to use Nativewind
* [Other Bundlers](https://www.nativewind.dev/v5/guides/other-bundlers) - Learn how to use Nativewind with other bundlers