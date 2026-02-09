# Coffee & Apple Counter Fix

## Problem
When users clicked coffee or apple buttons more than 3 or 5 times respectively in a focus session, the counter display (e.g., "2/3" or "4/5") was not updating. The buttons appeared to work (focus boost was applied, coins were deducted), but the visual counter remained stuck.

## Root Cause
The `tapCoffeeInSession` and `tapAppleInSession` functions in `sessionSlice.ts` were:
1. ✅ Applying the focus boost correctly
2. ✅ Deducting coins correctly
3. ✅ Tracking premium usage correctly
4. ❌ **NOT incrementing the daily tap counters** (`coffeeTapsToday` and `appleTapsToday`)

Without incrementing these counters, the UI couldn't update the display from "2/3" to "3/3" or "4/5" to "5/5".

## Solution
Updated both functions to increment the daily tap counters when using the free version (not premium):

### tapAppleInSession
```typescript
userData: {
  ...userData,
  qCoins: userData.qCoins - cost,
  appleTapsToday: isPremium ? userData.appleTapsToday : userData.appleTapsToday + 1  // ← Added
}
```

### tapCoffeeInSession
```typescript
userData: {
  ...userData,
  qCoins: userData.qCoins - cost,
  coffeeTapsToday: isPremium ? userData.coffeeTapsToday : userData.coffeeTapsToday + 1  // ← Added
}
```

## Logic Explanation

**For Free Uses (isPremium = false):**
- Increment the counter: `appleTapsToday + 1` or `coffeeTapsToday + 1`
- This updates the UI display: "2/3" → "3/3"
- After reaching the limit (3 for coffee, 5 for apple), the button shows "PREMIUM" option

**For Premium Uses (isPremium = true):**
- Don't increment the counter: keep current value
- Premium uses don't count toward the daily free limit
- User can still use their free taps on another session

## User Experience Flow

### Coffee Button (3 free per day)
1. **Tap 1**: "2/3" → Boost +6, Cost -3 coins, Counter updates to "3/3"
2. **Tap 2**: "3/3" → Boost +6, Cost -3 coins, Counter stays "3/3" (limit reached)
3. **Tap 3**: "3/3" → Boost +6, Cost -3 coins, Button now shows "PREMIUM"
4. **Tap 4** (Premium): "PREMIUM +15 5m -15🪙" → Boost +15 for 5 minutes, Cost -15 coins
5. **After Premium**: Button shows "USED" (can't use premium again this session)

### Apple Button (5 free per day)
1. **Taps 1-4**: Counter updates "4/5" → "5/5"
2. **Tap 5**: Counter stays "5/5", button shows "PREMIUM"
3. **Premium Tap**: "PREMIUM +10 -10🪙" → Boost +10, Cost -10 coins
4. **After Premium**: Button shows "USED"

## Files Modified
- `quillby-app/app/state/slices/sessionSlice.ts` - Added counter increments to both functions

## Testing
To verify the fix:
1. Start a focus session
2. Click coffee button 3 times - counter should update: "0/3" → "1/3" → "2/3" → "3/3"
3. After 3 clicks, button should show "PREMIUM" option
4. Click apple button 5 times - counter should update: "0/5" → "1/5" → ... → "5/5"
5. After 5 clicks, button should show "PREMIUM" option
6. Premium clicks should NOT increment the counter (preserves free uses)
