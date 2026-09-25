#!/usr/bin/env node
/**
 * Builds the Android "staging" APK: installs next to the store app as
 * "WaterApp DEV" (com.waterappdaily2.dev) and talks to the dev API, so the live
 * challenge data is never touched. src/config/apiEnv.js is restored afterwards.
 *
 *   npm run android:dev   →  android/app/build/outputs/apk/staging/app-staging.apk
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', 'src', 'config', 'apiEnv.js');
const original = fs.readFileSync(envFile, 'utf8');
const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

try {
  fs.writeFileSync(envFile, original.replace(/API_ENV = '[a-z]+'/, "API_ENV = 'dev'"));
  execSync(`${gradlew} assembleStaging`, { cwd: path.join(__dirname, '..', 'android'), stdio: 'inherit' });
  console.log('\nAPK: android/app/build/outputs/apk/staging/app-staging.apk');
} finally {
  fs.writeFileSync(envFile, original);
}
