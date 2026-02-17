# Notification Icon Setup

## Current Configuration

The notification icon is configured in `app.json`:

```json
"expo-notifications": {
  "icon": "./assets/icon.png",
  "color": "#FFD93D",
  "sounds": [],
  "mode": "production",
  "androidMode": "default",
  "androidCollapsedTitle": "Quillby"
}
```

## Icon Details

- **Icon Path**: `./assets/icon.png`
- **Color**: `#FFD93D` (Quillby yellow/gold color)
- **Collapsed Title**: "Quillby"

## How It Works

### iOS
- Uses the app icon (`icon.png`) for notifications
- Shows in notification center with app name
- Color is automatically handled by iOS

### Android
- Uses the icon specified in the plugin configuration
- The `color` field tints the icon in the notification tray
- Shows as a small icon in the status bar
- Shows as a large icon in the notification drawer

## Icon Requirements

### For Best Results (Android)

Android notification icons should ideally be:
1. **Monochrome**: White icon on transparent background
2. **Size**: 96x96 dp (288x288 px at xxxhdpi)
3. **Format**: PNG with transparency
4. **Style**: Simple, recognizable silhouette

### Current Setup

We're using `icon.png` which is the full-color app icon. This works but:
- Android will convert it to monochrome automatically
- The `color` field (#FFD93D) will tint it in the status bar
- May not look as clean as a purpose-built notification icon

## Creating a Custom Notification Icon (Optional)

If you want a custom notification icon:

1. **Create the icon**:
   - Design a simple, monochrome version of Quillby
   - White icon on transparent background
   - 288x288 px (or larger, will be scaled down)
   - Save as `quillby-notification-icon.png`

2. **Add to assets**:
   ```
   quillby-app/assets/quillby-notification-icon.png
   ```

3. **Update app.json**:
   ```json
   "expo-notifications": {
     "icon": "./assets/quillby-notification-icon.png",
     "color": "#FFD93D"
   }
   ```

4. **Rebuild the app**:
   ```bash
   npx expo prebuild --clean
   ```

## Testing Notifications

To see how the icon looks:

1. **Send a test notification**:
   - Open the app
   - Trigger any notification
   - Check the status bar (small icon)
   - Pull down notification drawer (large icon)

2. **Check different states**:
   - Collapsed notification (status bar)
   - Expanded notification (drawer)
   - Lock screen notification

## Current Status

✅ **Working**: Notifications use `icon.png` with yellow tint
✅ **Color**: Set to Quillby brand color (#FFD93D)
✅ **Title**: Shows "Quillby" in collapsed state

## Recommendations

### Option 1: Keep Current Setup (Easiest)
- Uses existing app icon
- Works out of the box
- No additional design needed
- ✅ **Recommended for now**

### Option 2: Create Custom Icon (Better UX)
- Design a simple Quillby silhouette
- Better visibility in status bar
- More professional appearance
- Requires design work

## Example Notification Appearance

### Status Bar (Collapsed)
```
[🐹] Quillby
```
Small yellow-tinted icon with "Quillby" text

### Notification Drawer (Expanded)
```
┌─────────────────────────────┐
│ [Icon] Quillby              │
│ ⚠️ Deadline tomorrow!       │
│ Math Assignment is due...   │
│ 5.5h of work remaining.     │
└─────────────────────────────┘
```
Full notification with icon, title, and message

## Notes

- The icon configuration requires a rebuild to take effect
- Changes to `app.json` notification settings need `expo prebuild`
- The icon is embedded in the native build
- Cannot be changed dynamically at runtime
