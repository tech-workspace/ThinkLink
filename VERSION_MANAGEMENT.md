# Version Management Guide

This document explains how to manage app versions in the ThinkLink project.

## 📁 Version Configuration

The app version is centrally managed in `src/config/version.ts`:

```typescript
export const APP_VERSION = '1.0.0';
export const BUILD_NUMBER = '1';
export const VERSION_INFO = {
    version: APP_VERSION,
    buildNumber: BUILD_NUMBER,
    displayVersion: `v${APP_VERSION} (${BUILD_NUMBER})`,
    fullVersion: `ThinkLink v${APP_VERSION} Build ${BUILD_NUMBER}`,
};
```

## 🔄 Updating Version

### Method 1: Using the Update Script (Recommended)

```bash
# Update to version 1.0.1 with build number 2
node scripts/update-version.js 1.0.1 2

# Update to version 1.1.0 with build number 3
node scripts/update-version.js 1.1.0 3
```

The script automatically updates:
- `src/config/version.ts`
- `app.json`
- `package.json`
- Version history

### Method 2: Manual Update

1. **Update `src/config/version.ts`**:
   ```typescript
   export const APP_VERSION = '1.0.1';
   export const BUILD_NUMBER = '2';
   ```

2. **Update `app.json`**:
   ```json
   {
     "expo": {
       "version": "1.0.1",
       "versionCode": 2
     }
   }
   ```

3. **Update `package.json`**:
   ```json
   {
     "version": "1.0.1"
   }
   ```

4. **Add to version history** in `src/config/version.ts`:
   ```typescript
   {
     version: '1.0.1',
     buildNumber: '2',
     date: '2025-01-14',
     changes: [
       'Fixed login issue',
       'Added new feature',
     ],
   }
   ```

## 📱 Version Display

The version is displayed in:

### Login Screen
- **Location**: Footer
- **Format**: `v1.0.0 (1)`
- **Style**: Small, semi-transparent text

### Profile Screen
- **Location**: App Information card
- **Format**: 
  - App Version: `v1.0.0 (1)`
  - Build Number: `1`
  - Full Version: `ThinkLink v1.0.0 Build 1`

## 🏗️ Building with New Version

After updating the version:

```bash
# Clean and rebuild
npx expo run:android

# Or build release APK
cd android && ./gradlew assembleRelease
```

## 📋 Version History Template

When adding a new version entry, use this template:

```typescript
{
    version: 'X.Y.Z',
    buildNumber: 'N',
    date: 'YYYY-MM-DD',
    changes: [
        'Description of change 1',
        'Description of change 2',
        'Bug fix description',
        'New feature description',
    ],
}
```

## 🎯 Version Numbering Convention

- **Major Version (X)**: Breaking changes, major new features
- **Minor Version (Y)**: New features, improvements (backward compatible)
- **Patch Version (Z)**: Bug fixes, small improvements
- **Build Number**: Incremental number for each build

## 📝 Best Practices

1. **Always update version** before building APK
2. **Document changes** in version history
3. **Test thoroughly** after version update
4. **Keep version history** up to date
5. **Use semantic versioning** (X.Y.Z format)

## 🔍 Checking Current Version

The current version is displayed in:
- Login screen footer
- Profile screen app information
- Console logs during build
- APK properties

## 🚀 Release Checklist

- [ ] Update version in `src/config/version.ts`
- [ ] Update `app.json` version and versionCode
- [ ] Update `package.json` version
- [ ] Add entry to version history
- [ ] Test the app
- [ ] Build new APK
- [ ] Test APK installation
- [ ] Document release notes
