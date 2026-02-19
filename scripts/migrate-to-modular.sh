#!/bin/bash

# Migration script for Quillby modular store

echo "🚀 Starting Quillby Store Modularization Migration..."

# Step 1: Backup original store
echo "📦 Creating backup of original store..."
if [ -f "app/state/store.ts" ]; then
    cp app/state/store.ts app/state/store-legacy.ts
    echo "✅ Backup created: store-legacy.ts"
else
    echo "⚠️  Original store.ts not found"
fi

# Step 2: Remove unused file
echo "🗑️  Removing unused essentialSync.ts..."
if [ -f "lib/essentialSync.ts" ]; then
    rm lib/essentialSync.ts
    echo "✅ Removed lib/essentialSync.ts"
else
    echo "ℹ️  lib/essentialSync.ts not found (already removed?)"
fi

# Step 3: Update store import in key files
echo "🔄 Updating store imports..."

# Function to update imports in a file
update_imports() {
    local file="$1"
    if [ -f "$file" ]; then
        # Check if file contains store import
        if grep -q "from.*state/store" "$file"; then
            # Create backup
            cp "$file" "$file.bak"
            
            # Update imports
            sed "s|from './state/store'|from './state/store-modular'|g" "$file.bak" > "$file.tmp" && mv "$file.tmp" "$file"
            sed "s|from '../state/store'|from '../state/store-modular'|g" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            sed "s|from '../../state/store'|from '../../state/store-modular'|g" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            
            # Remove backup
            rm "$file.bak"
            echo "✅ Updated imports in $file"
        else
            echo "ℹ️  No store import found in $file"
        fi
    else
        echo "⚠️  File not found: $file"
    fi
}

# List of files that likely import the store
files_to_update=(
    "app/(tabs)/index.tsx"
    "app/(tabs)/focus.tsx"
    "app/(tabs)/settings.tsx"
    "app/(tabs)/stats.tsx"
    "app/(tabs)/shop.tsx"
    "app/study-session.tsx"
    "app/onboarding/welcome.tsx"
    "app/onboarding/profile.tsx"
    "app/onboarding/goal-setup.tsx"
    "app/onboarding/habit-setup.tsx"
    "app/_layout.tsx"
    "app/index.tsx"
)

for file in "${files_to_update[@]}"; do
    update_imports "$file"
done

# Step 4: Update component imports
echo "🔧 Updating component imports..."
find app/components -name "*.tsx" -type f 2>/dev/null | while read file; do
    update_imports "$file"
done

echo ""
echo "🎉 Migration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test the app to ensure everything works"
echo "2. Run: npm test (if you have tests)"
echo "3. If issues occur, restore from store-legacy.ts"
echo "4. Consider adding tests for the new modular structure"
echo ""
echo "📁 New structure created:"
echo "   app/state/slices/ - Individual domain slices"
echo "   app/state/utils/  - Utility functions"
echo "   app/state/store-modular.ts - Main store"
echo ""
echo "🔍 Review cleanup-unused.md for detailed analysis"
echo ""
echo "🧪 To test the new store:"
echo "   1. Start your development server"
echo "   2. Check console for any import errors"
echo "   3. Test key functionality (focus sessions, habits, etc.)"