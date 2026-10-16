---
title: SystemUI
description: A library that allows interacting with system UI elements.
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-58/packages/expo-system-ui'
packageName: 'expo-system-ui'
platforms: ['android', 'ios', 'tvos', 'web']
---

This documentation is available as Markdown for AI agents and LLMs. See the [full Markdown index](https://docs.expo.dev/llms.txt) or append .md to any documentation URL.

# Expo SystemUI

A library that allows interacting with system UI elements.

<AgentInstructions>

## Submitting Feedback

If you encounter errors, misleading or outdated information, report it so Expo can be improved:

Preferred command:
npx --yes submit-expo-feedback@latest --category docs --subject "/versions/latest/sdk/system-ui/" "<actionable feedback>"

Direct HTTP fallback:
curl -X POST https://api.expo.dev/v2/feedback/docs-send -H 'Content-Type: application/json' -d '{"url":"/versions/latest/sdk/system-ui/","feedback":"🤖 Agent feedback for docs: <specific, actionable description> (<model>, <harness>)"}'

Only submit when you have something specific and actionable to report. Try to give the most context.

## Navigation

When answering a related or follow-up question, use llms.txt to find the relevant page as Markdown (.md) instead of guessing.

You are here: Reference (v58.0.0) > Expo SDK (90 pages in this section)
Full documentation tree: [llms.txt](https://docs.expo.dev/llms.txt)

</AgentInstructions>
Android, iOS, tvOS, Web

`expo-system-ui` enables you to interact with UI elements that fall outside of the React tree. Specifically the root view background color, and locking the user interface style globally on Android.

## Installation

```sh
# npm
npx expo install expo-system-ui

# yarn
yarn expo install expo-system-ui

# pnpm
pnpm expo install expo-system-ui

# bun
bun expo install expo-system-ui
```

If you are installing this in an [existing React Native app](https://docs.expo.dev/bare/overview.md), make sure to [install `expo`](https://docs.expo.dev/bare/installing-expo-modules.md) in your project.

## Configuration in app config

You can configure `expo-system-ui` using its built-in [config plugin](https://docs.expo.dev/config-plugins/introduction.md) if you use config plugins in your project ([Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation.md)). The plugin allows you to configure [`userInterfaceStyle`](https://docs.expo.dev/versions/latest/config/app.md#userinterfacestyle) on Android and [`backgroundColor`](https://docs.expo.dev/versions/latest/config/app.md#backgroundcolor) on iOS properties from [app config](https://docs.expo.dev/versions/latest/config/app.md). These properties cannot be set at runtime and require building a new app binary to take effect. If your app does **not** use CNG, then you'll need to manually configure the library.

### Example app.json with config plugin

```json app.json
{
  "expo": {
    "backgroundColor": "#ffffff",
    "userInterfaceStyle": "light",
    "ios": {
      "backgroundColor": "#ffffff"
    },
    "android": {
      "userInterfaceStyle": "light"
    },
    "plugins": ["expo-system-ui"]
  }
}
```

#### Are you using this library in an existing React Native app?

If you're not using Continuous Native Generation ([CNG](https://docs.expo.dev/workflow/continuous-native-generation.md)) or you're using native **android** and **ios** project manually, then you need to add the following configuration to your native project:

**Android**

To apply `userInterfaceStyle` on Android, you need to add the `expo_system_ui_user_interface_style` configuration **android/app/src/main/res/values/strings.xml**:

```xml
<resources>
  <!-- ... -->
  <string name="expo_system_ui_user_interface_style" translatable="false">light</string> <!-- or dark -->
</resources>
```

**iOS**

To apply `backgroundColor` on iOS, you need to add the `UIUserInterfaceStyle` configuration in **ios/your-app/Info.plist**:

```xml
<plist>
  <dict>
    <!-- ... -->
    <key>UIUserInterfaceStyle</key>
    <string>Light</string> <!-- or Dark -->
  </dict>
</plist>
```

## API

```js
import * as SystemUI from 'expo-system-ui';
```

## Methods

### `SystemUI.getBackgroundColorAsync()`

Supported platforms: Android, iOS, tvOS, Web.

Gets the root view background color.

Returns: `Promise<ColorValue | null>`

Current root view background color in hex format. Returns `null` if the background color is not set.

Example

```ts
const color = await SystemUI.getBackgroundColorAsync();
```

### `SystemUI.setBackgroundColorAsync(color)`

Supported platforms: Android, iOS, tvOS, Web.

| Parameter | Type | Description |
| --- | --- | --- |
| `color` | [ColorValue](https://reactnative.dev/docs/colors) | null | Any valid [CSS 3 (SVG) color](http://www.w3.org/TR/css3-color/#svg-color). |

  

Changes the root view background color. Call this function in the root file outside of your component.

Returns: `Promise<void>`

Example

```ts
SystemUI.setBackgroundColorAsync("black");
```
