#!/usr/bin/env node

/**
 * Version Update Script for ThinkLink App
 * Usage: node scripts/update-version.js [version] [buildNumber]
 * Example: node scripts/update-version.js 1.0.1 2
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const newVersion = process.argv[2] || '1.0.0';
const newBuildNumber = process.argv[3] || '1';

console.log(`🔄 Updating version to ${newVersion} (Build ${newBuildNumber})...`);

// Update version.ts
const versionPath = path.join(__dirname, '../src/config/version.ts');
let versionContent = fs.readFileSync(versionPath, 'utf8');

// Update version constants
versionContent = versionContent.replace(
    /export const APP_VERSION = '[^']*';/,
    `export const APP_VERSION = '${newVersion}';`
);
versionContent = versionContent.replace(
    /export const BUILD_NUMBER = '[^']*';/,
    `export const BUILD_NUMBER = '${newBuildNumber}';`
);

// Update version history
const currentDate = new Date().toISOString().split('T')[0];
const newVersionEntry = `    {
        version: '${newVersion}',
        buildNumber: '${newBuildNumber}',
        date: '${currentDate}',
        changes: [
            'Version ${newVersion} update',
        ],
    },`;

// Insert new version entry at the beginning of VERSION_HISTORY array
versionContent = versionContent.replace(
    /export const VERSION_HISTORY = \[/,
    `export const VERSION_HISTORY = [\n${newVersionEntry}`
);

fs.writeFileSync(versionPath, versionContent);
console.log('✅ Updated src/config/version.ts');

// Update app.json
const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

appJson.expo.version = newVersion;
appJson.expo.versionCode = parseInt(newBuildNumber);

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log('✅ Updated app.json');

// Update package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json');

console.log(`\n🎉 Version update complete!`);
console.log(`📱 App Version: ${newVersion}`);
console.log(`🔢 Build Number: ${newBuildNumber}`);
console.log(`📅 Date: ${currentDate}`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Test the app with new version`);
console.log(`   2. Build new APK: npx expo run:android`);
console.log(`   3. Update version history with actual changes`);
