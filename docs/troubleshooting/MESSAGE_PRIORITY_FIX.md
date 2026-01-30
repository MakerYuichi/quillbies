# Message Priority Fix - Speech Bubble Updates

## Problem

After waking up from sleep, the water button stopped updating the speech bubble. The sleep message would persist and override water messages.

### Why It Happened

The message priority logic was:
```typescript
const hamsterMessage = sleepMessage || waterMessage || defaultMessage;
```

This meant:
1. If `sleepMessage` exists (even if old), it always shows
2. `waterMessage` only shows if `sleepMessage` is empty
3. After waking up, `sleepMessage` persists forever

### Example Bug Flow
```
1. User wakes up → sleepMessage = "😊 Slept 7h..."
2. User drinks water → waterMessage = "💧 7 to go!"
3. Speech bubble shows: "😊 Slept 7h..." ❌ (sleepMessage takes priority)
4. User drinks more water → waterMessage = "💧 6 to go!"
5. Speech bubble shows: "😊 Slept 7h..." ❌ (still showing old sleep message)
```

## Solution

Added **timestamp-based priority** to show the most recent message.

### Implementation

#### 1. Added Timestamps to Hooks

**useWaterTracking.ts**:
```typescript
const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

const handleDrinkWater = () => {
  // ... existing logic ...
  setMessage(newMessage);
  setMessageTimestamp(Date.now()); // Record when message was set
};

return {
  waterMessage: message,
  waterMessageTimestamp: messageTimestamp, // Export timestamp
};
```

**useSleepTracking.ts**:
```typescript
const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

const handleSleepButton = () => {
  // ... existing logic ...
  setMessage(newMessage);
  setMessageTimestamp(Date.now()); // Record when message was set
};

const handleWakeUpButton = () => {
  // ... existing logic ...
  setMessage(newMessage);
  setMessageTimestamp(Date.now()); // Record when message was set
};

return {
  sleepMessage: message,
  sleepMessageTimestamp: messageTimestamp, // Export timestamp
};
```

#### 2. Updated Message Priority Logic

**index.tsx**:
```typescript
// Get timestamps from hooks
const {
  waterMessage,
  waterMessageTimestamp,
} = useWaterTracking(buddyName);

const {
  sleepMessage,
  sleepMessageTimestamp,
} = useSleepTracking(buddyName);

// Show the most recent message (highest timestamp)
let hamsterMessage = `Hi ${buddyName}! 👋\nLet's have a productive day!`;

if (waterMessage && sleepMessage) {
  // Both have messages - show the most recent one
  hamsterMessage = waterMessageTimestamp > sleepMessageTimestamp 
    ? waterMessage 
    : sleepMessage;
} else if (waterMessage) {
  hamsterMessage = waterMessage;
} else if (sleepMessage) {
  hamsterMessage = sleepMessage;
}
```

## How It Works Now

### Example Fixed Flow
```
1. User wakes up at 10:00:00
   → sleepMessage = "😊 Slept 7h..."
   → sleepMessageTimestamp = 1000000
   → Shows: "😊 Slept 7h..." ✅

2. User drinks water at 10:00:05
   → waterMessage = "💧 7 to go!"
   → waterMessageTimestamp = 1000005
   → Compares: 1000005 > 1000000
   → Shows: "💧 7 to go!" ✅

3. User drinks more water at 10:00:10
   → waterMessage = "💧 6 to go!"
   → waterMessageTimestamp = 1000010
   → Compares: 1000010 > 1000000
   → Shows: "💧 6 to go!" ✅

4. User sleeps again at 10:00:20
   → sleepMessage = "💤 Sleeping..."
   → sleepMessageTimestamp = 1000020
   → Compares: 1000020 > 1000010
   → Shows: "💤 Sleeping..." ✅
```

## Benefits

### 1. Always Shows Latest Action
- Most recent action's message is displayed
- No more stuck messages
- Natural conversation flow

### 2. Fair Priority
- Neither water nor sleep takes permanent priority
- Timestamp-based = chronological order
- User sees feedback for their latest action

### 3. Flexible System
- Easy to add more features (breakfast, exercise, etc.)
- Each feature tracks its own message + timestamp
- Main screen compares all timestamps

### 4. No Manual Clearing
- No need to clear messages after timeout
- Messages naturally get replaced by newer ones
- Simpler state management

## Testing

### Test 1: Water After Sleep
1. Tap "😴 Sleep" → Wait 10s → Tap "☀️ Woke Up"
2. Check: Speech bubble shows sleep message ✅
3. Tap "💧 Water"
4. Check: Speech bubble updates to water message ✅

### Test 2: Sleep After Water
1. Tap "💧 Water"
2. Check: Speech bubble shows water message ✅
3. Tap "😴 Sleep"
4. Check: Speech bubble updates to sleep message ✅

### Test 3: Multiple Waters
1. Tap "💧 Water" → Check: "7 to go!" ✅
2. Tap "💧 Water" → Check: "6 to go!" ✅
3. Tap "💧 Water" → Check: "5 to go!" ✅

### Test 4: Interleaved Actions
1. Tap "💧 Water" → Check: Water message ✅
2. Tap "😴 Sleep" → Check: Sleep message ✅
3. Tap "☀️ Woke Up" → Check: Wake message ✅
4. Tap "💧 Water" → Check: Water message ✅

## Future Enhancements

### 1. Message Expiration
Add timeout to clear old messages:
```typescript
useEffect(() => {
  if (messageTimestamp > 0) {
    const timeout = setTimeout(() => {
      setMessage('');
      setMessageTimestamp(0);
    }, 10000); // Clear after 10 seconds
    
    return () => clearTimeout(timeout);
  }
}, [messageTimestamp]);
```

### 2. Message Queue
Show multiple messages in sequence:
```typescript
const [messageQueue, setMessageQueue] = useState<string[]>([]);

// Add message to queue
const addMessage = (msg: string) => {
  setMessageQueue(prev => [...prev, msg]);
};

// Show next message every 3 seconds
useEffect(() => {
  if (messageQueue.length > 0) {
    const timer = setTimeout(() => {
      setMessageQueue(prev => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [messageQueue]);
```

### 3. Message Priority Levels
Add importance levels:
```typescript
interface Message {
  text: string;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// High priority messages override recent low priority ones
const selectMessage = (messages: Message[]) => {
  const urgent = messages.find(m => m.priority === 'urgent');
  if (urgent) return urgent;
  
  // Otherwise, show most recent
  return messages.sort((a, b) => b.timestamp - a.timestamp)[0];
};
```

## Conclusion

The speech bubble now correctly updates based on the most recent action. Water messages no longer get stuck behind old sleep messages, and vice versa. The timestamp-based priority system is simple, fair, and extensible! 🐹💬✨
