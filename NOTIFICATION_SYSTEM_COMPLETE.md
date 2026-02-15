# Complete Notification System Documentation

## Overview
Quillby uses a comprehensive notification system to keep users engaged and on track with their goals, even when the app is closed.

## All Notifications That Will Come

### 1. DEADLINE NOTIFICATIONS

#### Today's Deadline Alert
- **When**: When deadline is due today AND work remaining ≈ hours remaining
- **Example**: "⚠️ Math Assignment - Time Critical! Hey Alex! Only 8h left and 7.5h of work remaining. Start now! 🚨"
- **Channel**: deadline-alerts (MAX priority)

#### 3 Days Before Deadline
- **When**: 3 days before due date at 9:00 AM
- **Example**: "📝 Deadline in 3 days! Math Assignment is due in 3 days. 8h of work needed. Let's plan! 💪"
- **Channel**: deadline-alerts

#### 1 Day Before Deadline
- **When**: 1 day before due date at 9:00 AM
- **Example**: "📝 Deadline tomorrow! Math Assignment is due tomorrow! 5.5h of work remaining. Time to focus! 🎯"
- **Channel**: deadline-alerts

### 2. HABIT REMINDERS

#### Water Reminders
- **When**: Every 2 hours from 8 AM to 8 PM (8, 10, 12, 14, 16, 18, 20)
- **Example**: "💧 Hydration Time! Hey Alex! Time to drink water. Goal: 8 glasses today. Stay hydrated! 💦"
- **Channel**: habit-reminders

#### Meal Reminders
- **When**: 
  - Breakfast: 8:00 AM
  - Lunch: 1:00 PM
  - Dinner: 7:00 PM
- **Examples**:
  - "🍳 Breakfast Time! Hey Alex! Time for breakfast. Don't forget to log your meal! 😊"
  - "🥗 Lunch Time! Hey Alex! Time for lunch. Don't forget to log your meal! 😊"
  - "🍽️ Dinner Time! Hey Alex! Time for dinner. Don't forget to log your meal! 😊"
- **Channel**: habit-reminders

#### Exercise Reminders
- **When**: 7:00 AM and 5:00 PM (morning and evening options)
- **Example**: "💪 Exercise Time! Hey Alex! Time to move! Goal: 30 minutes today. Let's get active! 🏃"
- **Channel**: habit-reminders

### 3. SLEEP REMINDERS

#### Pre-Bedtime Warning
- **When**: 30 minutes before calculated bedtime
- **Example**: "🌙 Bedtime Soon! Hey Alex! It's almost time for Quillby to sleep. Start winding down! 😴"
- **Channel**: sleep-reminders

#### Bedtime Notification
- **When**: At calculated bedtime (based on sleep goal)
- **Example**: "💤 Time to Sleep! Hey Alex! It's time for Quillby to sleep. Let's get some rest! Good night! 🌙"
- **Channel**: sleep-reminders

### 4. MOTIVATIONAL NOTIFICATIONS

#### Morning Motivation
- **When**: 10:00 AM daily
- **Example**: "💝 Quillby says... Quillby believes in you! Keep up the great work! 🌟"
- **Channel**: motivation

#### Afternoon Boost
- **When**: 3:00 PM daily
- **Example**: "💝 Quillby says... You're doing amazing, Alex! Quillby is proud! 💪"
- **Channel**: motivation

#### Evening Reflection
- **When**: 9:00 PM daily
- **Example**: "💝 Quillby says... Great day, Alex! Quillby is happy with your progress! ✨"
- **Channel**: motivation

### 5. STUDY CHECKPOINT REMINDERS

#### Checkpoint Notifications
- **When**: At each selected checkpoint time (9 AM, 12 PM, 3 PM, 6 PM, 9 PM)
- **Example**: "📚 Study Checkpoint! Hey Alex! Time to check your study progress. Goal: 6h today. Keep going! 💪"
- **Channel**: study-reminders

#### Behind Schedule Alert
- **When**: When user is behind at a checkpoint AND work remaining ≈ time remaining
- **Example**: "⚠️ Behind by 1h 30min... room's getting messy! 📚 Expected: 3.0h by 3 PM, You: 1.5h"
- **Channel**: study-reminders

## Notification Channels (Android)

### 1. study-reminders
- **Importance**: HIGH
- **Vibration**: [0, 250, 250, 250]
- **Light Color**: Green (#4CAF50)

### 2. deadline-alerts
- **Importance**: MAX (highest priority)
- **Vibration**: [0, 500, 250, 500]
- **Light Color**: Red (#FF5722)

### 3. habit-reminders
- **Importance**: HIGH
- **Vibration**: [0, 250, 250, 250]
- **Light Color**: Blue (#2196F3)

### 4. sleep-reminders
- **Importance**: HIGH
- **Vibration**: [0, 250, 250, 250]
- **Light Color**: Purple (#9C27B0)

### 5. motivation
- **Importance**: DEFAULT
- **Vibration**: [0, 250]
- **Light Color**: Gold (#FFD700)

## Background Notifications

All notifications are scheduled using Expo Notifications with proper trigger types:
- **DAILY triggers**: For recurring notifications (habits, checkpoints, motivation)
- **DATE triggers**: For one-time notifications (deadlines, specific alerts)

These notifications will fire even when:
- App is closed
- App is in background
- Device is locked
- User hasn't opened the app in days

## Setup Requirements

1. **Permissions**: User must grant notification permissions during onboarding
2. **Channels**: Android channels are automatically created on first setup
3. **Scheduling**: Notifications are scheduled when:
   - User completes onboarding
   - User updates their goals/habits
   - User creates/updates deadlines
   - App starts (re-schedules if needed)

## Testing Notifications

Use the test notification feature in settings:
- Schedules a notification 5 seconds in the future
- Helps verify notifications work when app is closed
- Useful for debugging notification issues

## Notification Persistence

- Notifications persist across app restarts
- Notifications are re-scheduled if app is updated
- Clearing app data will clear scheduled notifications
- User can disable specific notification types in settings

## Energy Increase Timing

Energy increases automatically every 30 seconds when the app is open, based on:
- Base regeneration rate
- Current energy level
- Max energy cap (affected by mess points)
- Time since last update

Energy does NOT increase when:
- App is closed
- User is in a focus session
- Energy is already at max cap
