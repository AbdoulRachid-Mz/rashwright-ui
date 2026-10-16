# Installation (https://www.nativewind.dev/docs/getting-started/installation)

> Nativewind works with both Expo and framework-less React Native projects but Expo provides a more streamlined experience.
>
> **Web**: If you'd like to use Metro to bundle for a website or App Clip and you are **not** using Expo, you will need either Expo's Metro config `@expo/metro-config` or to manually use Tailwind CLI to generate a CSS file.

[Expo](https://www.nativewind.dev/docs/getting-started/installation/)
\| [Framework-less](https://www.nativewind.dev/docs/getting-started/installation/frameworkless)
\| [Next.js](https://www.nativewind.dev/docs/getting-started/installation/nextjs)

> If you'd like to skip manual setup and use Nativewind with Expo, you can use the following command to initialize a new Expo project with Nativewind and Tailwind CSS.
>
> npm
>
> ```bash
> npx rn-new --nativewind
> ```
>
> yarn
>
> ```bash
> npx rn-new --nativewind --yarn
> ```
>
> pnpm
>
> ```bash
> pnpx rn-new --nativewind
> ```
>
> bun
>
> ```bash
> bunx rn-new --nativewind
> ```

## Nativewind v4.2.7

Nativewind v4.2.7 adds Expo SDK 57 support and includes react-native-css-interop 0.2.7. It keeps the Tailwind CSS 3 configuration, Nativewind Babel preset and `withNativeWind(config, { input })` integration. Upgrading within v4 does not require a v5 migration.

For an existing v4 app, update with your package manager, for example `npm install nativewind@4.2.7`. Keep the native package versions compatible with your Expo SDK. On Expo 57, install `react-native-worklets` alongside Reanimated 4 with `npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context`. Older projects using Reanimated 3 should retain their compatible setup instead of adding Worklets just for this patch.

Restart Metro after upgrading. Rebuild the native app if you change native dependencies. Check animations and system appearance on each supported platform.

Looking for the v5 release candidate? Use the separate [v5 installation guide](https://www.nativewind.dev/v5/getting-started/installation) or [migration guide](https://www.nativewind.dev/v5/guides/migrate-from-v4).

## Installation with Expo

### 1. Install Nativewind

You will need to install `nativewind` and its peer dependencies `tailwindcss`, `react-native-reanimated` and `react-native-safe-area-context`.

npm

```bash
npm install nativewind@4.2.7 react-native-reanimated react-native-safe-area-context
npm install --save-dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo
```

yarn

```bash
yarn add nativewind@4.2.7 react-native-reanimated react-native-safe-area-context
yarn add --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo
```

pnpm

```bash
pnpm add nativewind@4.2.7 react-native-reanimated react-native-safe-area-context
pnpm add --save-dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo
```

bun

```bash
bun add nativewind@4.2.7 react-native-reanimated react-native-safe-area-context
bun add --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo
```

expo

```bash
npx expo install nativewind@4.2.7 react-native-reanimated react-native-safe-area-context
npx expo install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo
```

### 2. Setup Tailwind CSS

Run `npx tailwindcss init` to create a `tailwind.config.js` file

Add the paths to all of your component files in your tailwind.config.js file.

```js title="tailwind.config.js"
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create a CSS file and add the Tailwind directives.

```css title="global.css"
@tailwind base;
@tailwind components;
@tailwind utilities;
```

> From here onwards, replace `./global.css` with the relative path to the CSS file you just created.

### 3. Add the Babel preset

```js title="babel.config.js"
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### 4. Create or modify your metro.config.js

Create a `metro.config.js` file in the root of your project if you don't already have one, then add the following configuration:

```js title="metro.config.js"
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })
```

### 5. Import your CSS file

```js title="App.js"
import "./global.css"

export default App() {
  /* Your App */
}
```

### 6. Modify your `app.json`

Switch the bundler to use the [Metro bundler](https://docs.expo.dev/guides/customizing-metro/#web-support)

```js
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

### 7. TypeScript setup (optional)

If you're using TypeScript in your project, you'll need to set up the type definitions. Nativewind extends the React Native types via declaration merging. The simplest method to include the types is to create a new `nativewind-env.d.ts` file and add a [triple-slash directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) referencing the types.

```tsx
/// <reference types="nativewind/types" />
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

* [Editor Setup](https://www.nativewind.dev/docs/getting-started/editor-setup) - Learn how to set up your editor to use Nativewind
* [Other Bundlers](https://www.nativewind.dev/docs/guides/other-bundlers) - Learn how to use Nativewind with other bundlers