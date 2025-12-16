# Name Your Friend Screen - Required Assets

## 📍 Place These Images Here

### 1. Hamster Egg Hatch
- **File name**: `hamster-egghatch.png`
- **Size**: 268×249px
- **Purpose**: Hamster hatching from egg
- **Position**: Center of screen (left: 72, top: 281)
- **Location**: `assets/onboarding/hamster-egghatch.png`

### 2. Orange Theme Background
- **File name**: `orange-theme.png`
- **Size**: 396×223px
- **Purpose**: Bottom section background
- **Position**: Bottom of screen (top: 642)
- **Location**: `assets/onboarding/orange-theme.png`
- **Alternative**: Can use solid color #FF9800 if image not available

## 🎨 Design Specifications

### Title
- **Text**: "Name Your New FRIEND"
- **Font**: Ceviche One, 55px
- **Color**: #63582A (brown)
- **Position**: x:-12, y:69

### Input Field
- **Size**: 286×66px
- **Background**: #FFFCF8 (cream)
- **Border**: 1px solid #705400 (dark brown)
- **Border Radius**: 15px
- **Shadow**: 0px 4px 4px rgba(0, 0, 0, 0.25)
- **Position**: Center of orange section

### Typing Line
- **Size**: 44px wide, 3px thick
- **Color**: Black (#000000)
- **Transform**: Rotated 90 degrees
- **Position**: Left side of input

### Placeholder Text
- **Text**: "Hammy"
- **Font**: Caveat Brush, 48px
- **Color**: rgba(92, 93, 70, 0.31) (faded brown)

### Instruction Text
- **Text**: "Your study buddy has just hatched! Give it a name to begin your journey together"
- **Font**: Chakra Petch Bold, 21px
- **Color**: Black (#000000)
- **Width**: 356px
- **Position**: Below input field

### Next Button
- **Background**: #4CAF50 (green) when enabled
- **Background**: #CCCCCC (gray) when disabled
- **Text**: "Next →"
- **Font**: Chakra Petch SemiBold, 18px

## 📐 Layout Positions (From Figma)

```
Screen: 393×852px

Title:          x:-12,  y:69   (408px wide)
Hamster Image:  x:72,   y:281  (268×249px)
Orange Section: x:0,    y:642  (396×223px)
Input Field:    x:63,   y:678  (286×66px)
Instruction:    x:19,   y:767  (356px wide)
```

## 🎯 User Interaction Flow

1. **Screen loads** → Input field auto-focuses
2. **User types name** → Text appears in Caveat Brush font
3. **Name entered** → "Next" button turns green (enabled)
4. **Tap "Next"** → Saves name to store, navigates to home/profile

## 🔤 Fonts Required

- **Ceviche One**: Title
- **Caveat Brush**: Input text
- **Chakra Petch Bold**: Instruction text
- **Chakra Petch SemiBold**: Button text

## ✅ Checklist

- [ ] `hamster-egghatch.png` in `assets/onboarding/`
- [ ] `orange-theme.png` in `assets/onboarding/` (or use solid color)
- [ ] All fonts loaded (Ceviche One, Caveat Brush, Chakra Petch)
- [ ] Input field accepts text
- [ ] Placeholder shows "Hammy" in faded color
- [ ] Typing line appears on left side
- [ ] "Next" button disabled when empty
- [ ] "Next" button enabled when name entered
- [ ] Name saves to store on "Next"

## 🚀 Testing

1. Navigate to name-buddy screen
2. See hamster hatching image
3. Input field should auto-focus
4. Type a name (max 20 characters)
5. "Next" button should enable
6. Tap "Next" → Should save name and navigate

## 📝 Console Logs to Watch

```
[Onboarding] Buddy named: [name]
```

## 🎨 Alternative: No Orange Theme Image

If you don't have `orange-theme.png`, you can use a solid color:

```tsx
// Replace ImageBackground with View
<View style={[styles.orangeSection, { backgroundColor: '#FF9800' }]}>
  {/* content */}
</View>
```

## 🖼️ Image Tips

### Hamster Egg Hatch
- Show hamster emerging from cracked egg
- Cute, friendly expression
- Transparent background
- Centered composition

### Orange Theme
- Warm orange gradient or solid color
- Can have subtle pattern/texture
- Should complement the overall design
