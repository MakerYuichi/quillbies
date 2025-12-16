# Character Selection Screen - Required Assets

## 📍 Place These Images Here

### 1. Background Theme
- **File name**: `theme.png`
- **Size**: 593×889px
- **Purpose**: Full-screen background overlay
- **Location**: `assets/onboarding/theme.png`

### 2. Casual Hamster
- **File name**: `casual-hamster.png`
- **Size**: 162×196px
- **Purpose**: Casual personality character
- **Shadow**: Green (#008339)
- **Location**: `assets/onboarding/casual-hamster.png`

### 3. Energetic Hamster
- **File name**: `energetic-hamster.png`
- **Size**: 160×215px
- **Purpose**: Energetic personality character
- **Shadow**: Red (#FF0000)
- **Location**: `assets/onboarding/energetic-hamster.png`

### 4. Scholar Hamster
- **File name**: `scholar-hamster.png`
- **Size**: 177×181px
- **Purpose**: Scholar personality character
- **Shadow**: Orange (#ED8600)
- **Location**: `assets/onboarding/scholar-hamster.png`

## 🎨 Layout Specifications

### Card Positions (Staggered Diagonal)
```
Casual:     x:10,  y:210  (Top-left)
Energetic:  x:195, y:387  (Middle-right)
Scholar:    x:22,  y:589  (Bottom-left)
```

### Card Styling
- **Size**: 185×191px each
- **Background**: White (#FFFFFF)
- **Border**: 1px solid black
- **Shadow Colors**:
  - Casual: Green (#008339)
  - Energetic: Red (#FF0000)
  - Scholar: Orange (#ED8600)

### Labels
- **Font**: Caveat Brush
- **Size**: 36px
- **Color**: Black (#000000)
- **Positions**:
  - Casual: x:51, y:403
  - Energetic: x:228, y:604
  - Scholar: x:66, y:780

## 🔤 Required Fonts

### 1. Ceviche One
- **File name**: `CevicheOne-Regular.ttf`
- **Usage**: Main title "Choose Your COMPANION"
- **Download**: https://fonts.google.com/specimen/Ceviche+One
- **Location**: `assets/fonts/CevicheOne-Regular.ttf`

### 2. Caveat Brush
- **File name**: `CaveatBrush-Regular.ttf`
- **Usage**: Character labels (Casual, Energetic, Scholar)
- **Download**: https://fonts.google.com/specimen/Caveat+Brush
- **Location**: `assets/fonts/CaveatBrush-Regular.ttf`

## 📐 Design Specs

### Title
- **Text**: "Choose Your\nCOMPANION"
- **Font**: Ceviche One, 55px
- **Color**: #63582A (brown)
- **Position**: x:-7, y:53
- **Width**: 408px

### Selection Effect
- **Border**: 3px solid #FF9800 (orange)
- **Scale**: 1.05 (5% larger)
- **Animation**: Smooth transform

### Next Button
- **Position**: Bottom center, 50px from bottom
- **Background**: #FF9800 (orange) when enabled
- **Background**: #CCCCCC (gray) when disabled
- **Text**: "Next →" or "Choose a companion"
- **Font**: Chakra Petch SemiBold, 18px

## 🎯 Image Requirements

All hamster images should:
- Be PNG with transparent backgrounds
- Have consistent art style
- Show personality through pose/expression:
  - **Casual**: Relaxed, laid-back pose
  - **Energetic**: Active, excited pose
  - **Scholar**: Studious, focused pose

## 📱 Screen Dimensions

- **Design Width**: 393px
- **Design Height**: 852px
- **Background**: White (#FFFFFF)

## ✅ Checklist

- [ ] `theme.png` in `assets/onboarding/`
- [ ] `casual-hamster.png` in `assets/onboarding/`
- [ ] `energetic-hamster.png` in `assets/onboarding/`
- [ ] `scholar-hamster.png` in `assets/onboarding/`
- [ ] `CevicheOne-Regular.ttf` in `assets/fonts/`
- [ ] `CaveatBrush-Regular.ttf` in `assets/fonts/`

## 🚀 After Adding Assets

1. Restart the app: `npx expo start --clear`
2. Navigate to character selection screen
3. Verify layout matches design exactly
4. Test selection interaction
5. Test "Next" button navigation
