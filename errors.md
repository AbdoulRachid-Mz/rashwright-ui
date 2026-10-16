Web  ERROR  [Error: Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')]

Code: color-scheme.js
  44 |     set(value) {
  45 |         if (darkMode === "media") {
> 46 |             throw new Error("Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')");
     |                   ^
  47 |         }
  48 |         if (!globalThis.window) {
  49 |             throw new Error("Cannot manually set color scheme while not in a browser environment.");
Call Stack
  exports.colorScheme.set (node_modules\react-native-css-interop\dist\runtime\web\color-scheme.js:46:19)
  MutationObserver$argument_0 (node_modules\react-native-css-interop\dist\runtime\web\color-scheme.js:36:29)