# Gems System Implementation

## Overview

The gems system is a premium currency feature that rewards users for achievements, streaks, and special accomplishments. Unlike Q-Coins (earned through daily habits), gems are rarer and used for exclusive premium items in the shop.

## Database Schema

### New Column Added
```sql
ALTER TABLE user_profiles
ADD COLUMN gems INTEGER DEFAULT 0;
```

The gems field is stored in the `user_profiles` table alongside other user data like Q-Coins, energy, and mess points.

## Type Definitions

### UserData Interface
Added `gems: number` field to the UserData interface in `app/core/types.ts`:

```typescript
export interface UserData {
  energy: number;
  maxEnergyCap: number;
  qCoins: number;
  gems: number; // Premium currency for exclusive items
  messPoints: number;
  // ... other fields
}
```

## State Management

### User Slice Actions

Two new actions added to `userSlice.ts`:

1. **addGems(amount: number, reason?: string)**
   - Adds gems to user's balance
   - Logs the transaction with optional reason
   - Syncs to database automatically
   
2. **spendGems(amount: number, reason?: string)**
   - Deducts gems from user's balance
   - Returns false if insufficient gems
   - Logs the transaction with optional reason
   - Syncs to database automatically

### Example Usage

```typescript
// Add gems for achievement
addGems(5, 'Unlocked 7-day streak achievement');

// Spend gems for premium item
const success = spendGems(10, 'Purchased exclusive wallpaper');
if (!success) {
  alert('Not enough gems!');
}
```

## UI Integration

### Stats Screen

The stats screen now displays gems in the overview card:

- **Location**: Overview Card (top section)
- **Display**: Shows current gem count with 💎 icon
- **Styling**: Purple color (#7E57C2) to distinguish from Q-Coins
- **Info**: Includes explanation text about gems being premium currency

**Layout**:
```
⚡ Current Status
┌─────────────────────────────────┐
│ Energy  │ Q-Coins │ 💎 Gems │ Streak │
│   85    │   150   │    12   │   5    │
└─────────────────────────────────┘
💎 Gems are premium currency earned through
   achievements and special events
```

### Shop Screen

The shop screen displays gems alongside Q-Coins:

- **Location**: Top-right corner, below Q-Coins display
- **Display**: Gem icon (💎) with count in purple badge
- **Styling**: Purple border and background to match gem theme
- **Info Section**: New "How to Earn Gems" card explaining gem sources

**Visual Hierarchy**:
```
┌─────────────────────┐
│ 🪙 150 Q-Coins      │ ← Top right
│ 💎 12 Gems          │ ← Below Q-Coins
└─────────────────────┘
```

## How to Earn Gems

Users can earn gems through:

1. **Achievements** (+1-5 gems)
   - Unlock various achievements
   - Rarer achievements give more gems

2. **Streak Milestones** (+3-10 gems)
   - 7-day streak: +3 gems
   - 30-day streak: +10 gems
   - 100-day streak: +20 gems

3. **Special Challenges** (+5-20 gems)
   - Weekly challenges
   - Monthly goals
   - Special events

4. **Perfect Study Days** (+2 gems)
   - Complete all study goals
   - Meet all habit targets
   - Zero missed checkpoints

## Future Enhancements

### Planned Features

1. **Gem Shop Items**
   - Exclusive character skins
   - Premium room decorations
   - Special animations
   - Unique sound packs

2. **Gem Rewards Integration**
   - Connect to achievements system
   - Automatic gem rewards on milestone completion
   - Daily login bonuses (gems for 7+ day streaks)

3. **Gem Conversion**
   - Option to convert gems to Q-Coins (1 gem = 50 Q-Coins)
   - One-way conversion to maintain gem value

4. **Gem Gifting**
   - Send gems to friends (premium feature)
   - Receive gems from community events

## Technical Notes

### Database Sync

- Gems are automatically synced to Supabase database
- Uses the same `syncToDatabase()` utility as other user data
- Offline changes are queued and synced when connection restored

### Default Values

- New users start with 0 gems
- Existing users migrated with 0 gems
- No negative gem values allowed

### Security

- All gem transactions logged with reason
- Server-side validation for gem purchases (future)
- Prevent client-side gem manipulation

## Testing

### Manual Testing Checklist

- [ ] Gems display correctly in stats screen
- [ ] Gems display correctly in shop screen
- [ ] addGems() increases gem count
- [ ] spendGems() decreases gem count
- [ ] spendGems() returns false when insufficient
- [ ] Gems sync to database
- [ ] Gems persist after app restart
- [ ] Gems load from database on app start

### Test Commands

```typescript
// In development console
const { addGems, spendGems } = useQuillbyStore.getState();

// Add test gems
addGems(100, 'Testing');

// Try spending
const success = spendGems(50, 'Test purchase');
console.log('Purchase success:', success);
```

## Files Modified

1. `quillby-app/DATABASE_GEMS_SYSTEM.sql` - Database schema
2. `quillby-app/app/core/types.ts` - Type definitions
3. `quillby-app/app/state/slices/userSlice.ts` - State management
4. `quillby-app/app/state/store-modular.ts` - Database sync
5. `quillby-app/app/(tabs)/stats.tsx` - Stats UI
6. `quillby-app/app/(tabs)/shop.tsx` - Shop UI

## Summary

The gems system adds a premium currency layer to the app, creating additional engagement through rare rewards and exclusive content. The implementation is complete and ready for integration with the achievements system and premium shop items.
