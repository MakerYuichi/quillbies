# Real-Time Clock System

## 🕐 **Overview**
Dynamic real-time clock component that displays current time based on user's timezone from onboarding, with responsive positioning for all devices.

## 📱 **Responsive Design**

### **Original Figma Specs (iPhone 15 Pro - 393x852):**
```css
position: absolute;
width: 266px;
height: 66px;
left: 16px;
top: 9px;
font-size: 21px;
line-height: 33px;
```

### **Dynamic Implementation:**
```typescript
// Scales proportionally to any screen size
width: (SCREEN_WIDTH * 266) / 393,
height: (SCREEN_HEIGHT * 66) / 852,
left: (SCREEN_WIDTH * 16) / 393,
top: (SCREEN_HEIGHT * 9) / 852,
fontSize: (SCREEN_WIDTH * 21) / 393,
lineHeight: (SCREEN_WIDTH * 33) / 393,
```

### **Device Compatibility:**
- **iPhone SE (375x667)**: Scales down proportionally
- **iPhone 15 Pro (393x852)**: Original design specs
- **iPhone 15 Pro Max (430x932)**: Scales up proportionally
- **iPad (768x1024)**: Maintains aspect ratio
- **Android devices**: Universal compatibility

## ⏰ **Time Features**

### **Timezone Integration:**
- **Source**: User's timezone from onboarding profile
- **Format**: 12-hour format with AM/PM
- **Fallback**: Local device time if timezone invalid
- **Update**: Real-time updates every second

### **Time-Based Emojis:**
```typescript
6:00 AM - 11:59 AM: 🌅 Morning
12:00 PM - 4:59 PM: ☀️ Afternoon  
5:00 PM - 7:59 PM: 🌆 Evening
8:00 PM - 5:59 AM: 🌙 Night
```

### **Display Format:**
```
"4:23 PM 🌆 Hammy's Room"
"9:15 AM 🌅 Buddy's Room"
"11:30 PM 🌙 Quillby's Room"
```

## 🎨 **Visual Design**

### **Typography:**
- **Font**: ChakraPetch_400Regular (consistent with app)
- **Color**: #000000 (black for readability)
- **Weight**: 400 (normal)
- **Alignment**: Left-aligned

### **Animation:**
- **Subtle fade**: 0.2-second fade on each update
- **Opacity**: 1.0 → 0.7 → 1.0 transition
- **Purpose**: Indicates live updates without distraction

### **Positioning:**
- **Z-index**: 25 (above room layers, below modals)
- **Pointer Events**: None (doesn't interfere with interactions)
- **Layout**: Absolute positioning for precise placement

## 🔧 **Technical Implementation**

### **Component Structure:**
```typescript
export default function RealTimeClock() {
  const { userData } = useQuillbyStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // Real-time updates every second
  // Timezone-aware formatting
  // Time-based emoji selection
  // Subtle animation on updates
}
```

### **Timezone Handling:**
```typescript
const timeString = currentTime.toLocaleTimeString('en-US', {
  timeZone: userData.timezone || 'UTC',
  hour12: true,
  hour: 'numeric',
  minute: '2-digit'
});
```

### **Error Handling:**
- **Invalid timezone**: Falls back to local device time
- **Missing buddy name**: Uses default "Hammy"
- **Timezone parsing errors**: Graceful degradation
- **Console warnings**: Logs issues for debugging

### **Performance Optimization:**
- **Efficient updates**: Only re-renders when time changes
- **Memory management**: Proper interval cleanup
- **Animation**: Uses native driver for smooth performance
- **Minimal re-renders**: Optimized state management

## 🎮 **User Experience**

### **Personalization:**
- **Buddy Name**: Shows user's chosen hamster name
- **Timezone**: Displays time in user's location
- **Context**: "Room" indicates personal space

### **Visual Feedback:**
- **Live Updates**: Subtle animation shows time is live
- **Time Context**: Emoji indicates time of day
- **Consistency**: Matches app's overall design language

### **Accessibility:**
- **High Contrast**: Black text on light background
- **Readable Font**: Clear, legible typography
- **Appropriate Size**: Large enough for easy reading
- **Non-intrusive**: Doesn't block important UI elements

## 📍 **Integration Points**

### **Onboarding Connection:**
- **Profile Screen**: Captures user's timezone selection
- **Store Integration**: Timezone saved in userData
- **Automatic Setup**: No additional configuration needed

### **Home Screen Layout:**
- **Fixed Position**: Stays in top-left corner
- **Layer Management**: Proper z-index stacking
- **Responsive**: Adapts to different screen sizes
- **Non-blocking**: Doesn't interfere with other components

### **State Management:**
- **Zustand Store**: Accesses userData.timezone and userData.buddyName
- **Real-time Updates**: Independent timer for time updates
- **Efficient Rendering**: Minimal impact on app performance

## 🌍 **Timezone Support**

### **Supported Timezones:**
- **US**: All major US timezones (EST, CST, MST, PST, etc.)
- **International**: Europe, Asia, Australia, Canada
- **Automatic Detection**: Uses expo-localization for defaults
- **Manual Selection**: User can choose specific timezone

### **Format Examples:**
```
US Eastern: "2:30 PM 🌆 Buddy's Room"
UK London: "7:30 PM 🌙 Hammy's Room"  
Japan: "3:30 AM 🌙 Quillby's Room"
Australia: "5:30 AM 🌅 Pet's Room"
```

This real-time clock system provides a personalized, responsive, and visually appealing way to show the current time while maintaining the app's cohesive design and user experience.