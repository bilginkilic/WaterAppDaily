// Which API the app talks to in non-__DEV__ builds. Always 'prod' in git:
// scripts/build-android-dev.js switches it to 'dev' only for the duration of a
// staging build (a guard test fails if 'dev' is committed).
export const API_ENV = 'prod';
