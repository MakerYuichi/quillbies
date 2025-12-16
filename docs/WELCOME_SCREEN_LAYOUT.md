# Welcome Screen - Layout Guide

## 🎨 Visual Layout

```
┌─────────────────────────────────┐
│                                 │
│   [Your Background Image]       │
│   (Full screen, with 40%        │
│    dark overlay)                │
│                                 │
│   ┌─────────────────────────┐   │
│   │  TOP SECTION (60px)     │   │
│   │                         │   │
│   │  Ready for a Study      │   │
│   │      Partner?           │   │
│   │  (Caveat, 42px, bold)   │   │
│   │                         │   │
│   │  Quillby stays with     │   │
│   │  you. To remind you     │   │
│   │  gently, we need        │   │
│   │  notification           │   │
│   │  permission.            │   │
│   │  (Chakra Petch, 16px)   │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  MIDDLE SECTION         │   │
│   │  (Flexible, centered)   │   │
│   │                         │   │
│   │      🐹                 │   │
│   │   [Cute Hamster]        │   │
│   │   (220x220px)           │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  BOTTOM SECTION (40px)  │   │
│   │                         │   │
│   │  ┌───────────────────┐  │   │
│   │  │ Allow             │  │   │
│   │  │ Notifications     │  │   │
│   │  │ (Green button)    │  │   │
│   │  └───────────────────┘  │   │
│   │                         │   │
│   │  ┌───────────────────┐  │   │
│   │  │ Maybe Later       │  │   │
│   │  │ (Outlined button) │  │   │
│   │  └───────────────────┘  │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

## 📐 Spacing & Measurements

### Top Section
- **Margin Top**: 60px
- **Title Font**: Caveat_700Bold, 42px
- **Title Color**: #FFF
- **Description Font**: ChakraPetch_400Regular, 16px
- **Description Line Height**: 24px
- **Spacing**: 20px between title and description

### Middle Section
- **Flex**: 1 (takes remaining space)
- **Alignment**: Center (both horizontal and vertical)
- **Hamster Size**: 220x220px
- **Resize Mode**: contain

### Bottom Section
- **Margin Bottom**: 40px
- **Gap Between Buttons**: 15px
- **Button Padding**: 18px vertical, 40px horizontal
- **Button Border Radius**: 16px
- **Button Font**: ChakraPetch_600SemiBold

### Primary Button (Allow Notifications)
- **Background**: #4CAF50 (green)
- **Text Color**: #FFF
- **Font Size**: 18px
- **Shadow**: Yes (elevation 5)

### Secondary Button (Maybe Later)
- **Background**: Transparent
- **Border**: 2px solid #FFF
- **Text Color**: #FFF
- **Font Size**: 16px

## 🎨 Color Palette

- **Overlay**: rgba(0, 0, 0, 0.4) - 40% dark
- **Text**: #FFF - White
- **Primary Button**: #4CAF50 - Green
- **Secondary Button Border**: #FFF - White
- **Loading Background**: #1A237E - Dark blue

## 📱 Responsive Behavior

- Layout uses `flex: 1` for middle section
- Adapts to different screen heights
- Hamster stays centered
- Buttons always at bottom with 40px margin
- Text wraps naturally with padding

## 🖼️ Asset Requirements

### Background Image
- **Path**: `assets/backgrounds/welcome-bg.png`
- **Size**: 1080x1920 or higher (9:16 aspect ratio)
- **Format**: PNG or JPG
- **Note**: Overlay will be applied automatically

### Hamster Image
- **Path**: `assets/onboarding/welcome-hamster.png`
- **Size**: 400x400px minimum (displayed at 220x220)
- **Format**: PNG with transparent background
- **Style**: Cute, friendly, welcoming
- **Colors**: Should work well against dark overlay

## 🔤 Font Loading

Fonts are loaded using `useFonts` hook:
- **Caveat_700Bold** - For headline
- **ChakraPetch_400Regular** - For body text
- **ChakraPetch_600SemiBold** - For buttons

Loading spinner shows while fonts load.

## ✨ User Experience Flow

1. **App opens** → Brief loading (fonts)
2. **Screen appears** → Background + overlay visible
3. **User reads** → Title and description
4. **User sees** → Cute hamster (builds connection)
5. **User decides** → Allow or skip notifications
6. **Navigation** → Character selection screen

## 🎯 Design Goals

- **Welcoming**: Cute hamster creates friendly first impression
- **Clear**: Text is readable with overlay
- **Simple**: Two clear choices
- **Beautiful**: Custom fonts add personality
- **Professional**: Clean layout, proper spacing
