# GDevelop editor APK — packaging prototype

This is an **Android test wrapper for the unmodified open-source GDevelop web editor**. It is **not** the official GDevelop Android application. No source files under `Core/`, `GDJS/` or `newIDE/` are edited by this wrapper.

## Status
- Source-only prototype. **No APK has been compiled, installed, or verified yet.**
- No GitHub Actions required. This prototype is kept on its own branch, not `master`.
- The Android app runs the browser editor, **not** the desktop/Electron editor.
- In the browser build, storage, preview, authentication and exports may use online services. Offline capability is **not yet proven**.
- Some menus, pointer interactions, file selectors and saving may need mobile-specific adaptations. Test first.

## Requirements
- Node.js/npm compatible with the checked-out GDevelop revision.
- JDK 17 and Android SDK platform 34, build tools and Android SDK command-line tools installed (Android Studio can supply these).
- Network for initial npm/Android dependencies and upstream GDevelop libGD.js/libGD.wasm download.
- Several gigabytes of disk space.
- Local tools only: no GDevelop subscription and no GitHub Actions.

## Build
In `android-editor-prototype` run:

```sh
npm install
npm run build:apk
```

This compiles `newIDE/app`, checks that `index.html`, `libGD.js` and `libGD.wasm` exist, copies the output into a disposable Cordova wrapper and creates a debug Android APK.

Expected output: `android-editor-prototype/gdevelop-editor-test-debug.apk`.

When a matching web build already exists, use `GD_REUSE_WEB_BUILD=1` to skip the GDevelop web rebuild. Never reuse stale files after modifying the source.

## Android acceptance tests
1. APK installs and opens without a blank screen.
2. Scene editor renders in portrait and landscape.
3. Create/save/reopen project via Android files.
4. Edit JavaScript and events with touch/keyboard.
5. Preview works with local resources.
6. Determine which features work without internet.
7. HTML5 export works without paid cloud compilation.

**Internal test build only.** The MIT source license does not grant rights to the GDevelop name or logo for a redistributed product.
