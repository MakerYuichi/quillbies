# Custom Time Premium Feature Update

## Change Summary
Made the "Custom Time" option in the focus session customization modal a premium-only feature.

## Changes Made

### SessionCustomizationModal.tsx

1. **Updated Custom Time Preset**
   - Changed `isPremium: false` to `isPremium: true`
   - Added ⭐ emoji to the name: `'⭐ Custom Time'`
   - This marks it as a premium feature in the preset list

2. **Updated Custom Time Input Visibility**
   - Changed condition from `{isCustomSelected && !isPremiumSelected && (` 
   - To: `{isCustomSelected && isPremium && (`
   - Now custom time inputs only show for premium users

## User Experience

### Free Users
- See "🔒 Custom Time" in the preset list
- Card shows "PREMIUM FEATURE" badge
- Clicking shows upgrade prompt: "🌟 Upgrade to Quillby Premium to unlock custom session names, background music, strict mode, and extended time ranges!"
- Cannot access custom time input controls

### Premium Users
- See "⭐ Custom Time" in the preset list (unlocked)
- Can select and customize focus time (5-180 minutes)
- Can customize break time (1-30 minutes)
- Full access to +/- buttons and direct input

## Available Free Presets

Users without premium still have access to:
1. **Pomodoro Classic** - 25 min focus + 5 min break
2. **Deep Focus** - 50 min focus + 10 min break
3. **Quick Sprint** - 15 min focus + 3 min break
4. **Flow State** - 90 min deep work session

## Premium Features in Focus Session

With this update, premium users get:
- ⭐ Custom Time - Set any focus time (5-180 min) and break time (1-30 min)
- ⭐ Premium Session - Custom name + advanced features
- Custom session names
- Background music option
- Strict mode

## Testing

To test:
1. **As Free User**: Try to select "Custom Time" - should show lock icon and upgrade prompt
2. **As Premium User**: Select "Custom Time" - should show time input controls
3. Verify other presets remain accessible to all users
4. Check that the upgrade prompt appears when free users click locked features
