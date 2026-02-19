# Code Cleanup Plan

## Files to Remove/Reorganize

### 1. Documentation Files (Move to docs/)
All the .md files in root should be moved to docs/ subdirectories:
- Achievement docs → docs/features/achievements/
- Shop docs → docs/features/shop/
- Theme docs → docs/features/themes/
- Database docs → docs/database/
- Mess points docs → docs/systems/
- Fix/update docs → docs/troubleshooting/

### 2. SQL Migration Files (Move to docs/database/migrations/)
- CLEANUP_DUPLICATE_DAILY_DATA.sql
- DATABASE_ACHIEVEMENT_HISTORY.sql
- DATABASE_CALENDAR_NOTES.sql
- DATABASE_CONSOLIDATION_MIGRATION.sql
- DATABASE_GEMS_SYSTEM.sql
- DATABASE_GOAL_FIELDS_UPDATE.sql
- DATABASE_SHOP_ITEMS_MIGRATION.sql
- DEVICE_ONBOARDING_TABLE.sql
- DIAGNOSE_MESS_POINTS_ISSUE.sql
- FIX_MESS_POINTS_MULTIPLE_RECORDS.sql
- FIX_MESS_POINTS_SYNC.sql
- VERIFY_MESS_POINTS.sql

### 3. Test/Debug Scripts (Move to tests/scripts/)
- clear-storage.js
- debug-mess-points.js
- debug-notifications.js
- quick-test.js
- test-accessibility.js
- test-automation.js
- test-fixes.js
- test-focus-button.js
- test-focus-session.js
- test-infinite-loop-fix.js
- test-mess-points.js
- test-modular-store.js
- test-performance.js
- test-premium-access.js
- test-wake-up-animation.js
- test-wallpaper-loading.js

### 4. Build Scripts (Move to scripts/)
- build-apk.sh
- fix-cleaning-sounds-proper.sh
- migrate-to-modular.sh
- publish-free.sh

### 5. Backup Files (DELETE)
- settings-old-backup.tsx
- SETTINGS_REDESIGN_STYLES.txt

### 6. Unused Code Files to Check
Need to analyze:
- app/state/store-legacy.ts (if store-modular.ts is being used)
- lib/auth.ts (if deviceAuth.ts is being used instead)
- lib/dailyProgress.ts (if dailyData.ts is being used instead)
- lib/shop.ts (check if userShopItems.ts replaces it)
- lib/notifications.ts vs enhancedNotifications.ts
- lib/offlineMode.ts (check if actually used)

## Execution Steps

1. Create directory structure
2. Move documentation files
3. Move SQL files
4. Move test scripts
5. Move build scripts
6. Delete backup files
7. Analyze and remove unused code files
8. Update any import paths if needed
