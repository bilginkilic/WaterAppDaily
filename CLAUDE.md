# WaterAppDaily — Project Notes

## Google Play Console publishing status (as of 2026-07-15)

- Play Console app: **WaterAppDaily** — `com.waterappdaily2`
  (package/applicationId was changed from `com.waterappdaily` to `com.waterappdaily2`;
  this created a fresh app listing on Play Console, unrelated to the old `com.waterappdaily` entry)
- Console URL: https://play.google.com/console/u/0/developers/6397007510742584509/app/4974981398468154068/app-dashboard
- Current versionCode: 6, versionName: 1.4 (app.json shows 1.3.0 — keep these in sync when bumping)
- **Production track: Inactive** — app is NOT published/live yet.
- Release signing config reads keystore info from env vars (`WATERAPP2_STORE_FILE`,
  `WATERAPP2_STORE_PASSWORD`, `WATERAPP2_KEY_ALIAS`, `WATERAPP2_KEY_PASSWORD`) instead of
  hardcoded values in `android/app/build.gradle`.

### Path to production

Google requires a closed test run before production access can be requested:
1. ✅ Publish a closed testing release — done (track name: "alpha")
2. ⬜ Have at least 12 testers **opted-in** (i.e. actually joined via the test link and
   installed — NOT the same as being added to the email allow-list)
3. ⬜ Run the closed test with 12+ opted-in testers for at least 14 days

As of 2026-07-15: the "alpha" closed test track has an email allow-list named **"ldn"** with
30 addresses (managed in Play Console → Test and release → Closed testing → Alpha → Testers;
not stored in this repo for privacy). **0 testers had opted in** — being on the allow-list is
not sufficient, each person must open the join link and tap "Become a tester", then install
the app.

- Opt-in link (Join on the web): https://play.google.com/apps/testing/com.waterappdaily2
- Store link (Join on Android): https://play.google.com/store/apps/details?id=com.waterappdaily2

An outreach email (EN + TR) was drafted and sent asking the 30 listed testers (incl. London
office) to open the opt-in link and install the app, so the 12-tester / 14-day requirement can
be met and "Apply for production" can be unlocked on the Dashboard.

### Next steps
- Track opt-in count on the Dashboard ("X testers currently opted in") until it reaches 12+.
- Once 12+ testers have been opted-in continuously for 14 days, "Apply for production"
  becomes clickable — use it to submit for production review.
