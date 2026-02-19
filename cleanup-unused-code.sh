#!/bin/bash

# Quillby App - Cleanup Unused Code Script
# This script organizes documentation, SQL files, and test scripts into proper directories

echo "🧹 Starting Quillby cleanup..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p docs/features/achievements
mkdir -p docs/features/shop
mkdir -p docs/features/themes
mkdir -p docs/database/migrations
mkdir -p docs/systems
mkdir -p docs/troubleshooting
mkdir -p tests/scripts
mkdir -p scripts

# Move Achievement documentation
echo "📄 Moving achievement docs..."
mv ACHIEVEMENTS_*.md docs/features/achievements/ 2>/dev/null
mv ACHIEVEMENT_HISTORY_SYSTEM.md docs/features/achievements/ 2>/dev/null
mv COMPLETE_ACHIEVEMENTS_SYSTEM.md docs/features/achievements/ 2>/dev/null

# Move Shop documentation
echo "📄 Moving shop docs..."
mv SHOP_*.md docs/features/shop/ 2>/dev/null
mv PLANT_*.md docs/features/shop/ 2>/dev/null
mv REDECOR_FURNITURE_COMPLETE.md docs/features/shop/ 2>/dev/null

# Move Theme documentation
echo "📄 Moving theme docs..."
mv THEME_*.md docs/features/themes/ 2>/dev/null
mv DARK_THEME_TEXT_COLORS_FIX.md docs/features/themes/ 2>/dev/null
mv FOCUS_DARK_THEME_IMPROVEMENTS.md docs/features/themes/ 2>/dev/null
mv LEGENDARY_THEMES_PREMIUM_LOCK.md docs/features/themes/ 2>/dev/null

# Move System documentation
echo "📄 Moving system docs..."
mv MESS_*.md docs/systems/ 2>/dev/null
mv GEMS_*.md docs/systems/ 2>/dev/null
mv CURRENCY_*.md docs/systems/ 2>/dev/null
mv QBIES_GEMS_UI_UPDATE.md docs/systems/ 2>/dev/null
mv HABIT_DATA_PERSISTENCE_FIX.md docs/systems/ 2>/dev/null

# Move Database documentation
echo "📄 Moving database docs..."
mv DATABASE_AUDIT_REPORT.md docs/database/ 2>/dev/null
mv DATABASE_FOREIGN_KEY_ANALYSIS.md docs/database/ 2>/dev/null
mv CODE_MIGRATION_PROFILES.md docs/database/ 2>/dev/null

# Move Floor/UI documentation
echo "📄 Moving UI docs..."
mv FLOOR_*.md docs/troubleshooting/ 2>/dev/null

# Move SQL migration files
echo "📄 Moving SQL migrations..."
mv *.sql docs/database/migrations/ 2>/dev/null

# Move test scripts
echo "📄 Moving test scripts..."
mv test-*.js tests/scripts/ 2>/dev/null
mv debug-*.js tests/scripts/ 2>/dev/null
mv clear-storage.js tests/scripts/ 2>/dev/null
mv quick-test.js tests/scripts/ 2>/dev/null

# Move build scripts
echo "📄 Moving build scripts..."
mv build-apk.sh scripts/ 2>/dev/null
mv fix-cleaning-sounds-proper.sh scripts/ 2>/dev/null
mv migrate-to-modular.sh scripts/ 2>/dev/null
mv publish-free.sh scripts/ 2>/dev/null

# Delete backup files
echo "🗑️  Removing backup files..."
rm -f settings-old-backup.tsx 2>/dev/null
rm -f SETTINGS_REDESIGN_STYLES.txt 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "  - Documentation organized in docs/"
echo "  - SQL migrations in docs/database/migrations/"
echo "  - Test scripts in tests/scripts/"
echo "  - Build scripts in scripts/"
echo "  - Backup files removed"
echo ""
echo "⚠️  Next steps:"
echo "  1. Review docs/ structure"
echo "  2. Check for unused code files (see CLEANUP_PLAN.md)"
echo "  3. Update any import paths if needed"
echo "  4. Commit changes"
