# 🎯 Focus Tab - Mission Control Redesign

## Theme: Quillby's War Room / Strategy Command Center

### Key Changes

1. **Header: Quillby as Commander**
   - Quillby in "focus" pose (studying.png) at a strategy table
   - Speech bubble with mission briefing based on deadline count
   - Energy displayed as Quillby's power shield

2. **Mission Language**
   - "Deadlines" → "Missions"
   - "Focus on This" → "⚔️ Attack!" or "🚀 Launch Mission!"
   - "Create Deadline" → "📝 Plan New Mission"
   - Urgent → "🔴 RED ALERT!"
   - Upcoming → "🟡 UPCOMING MISSIONS"
   - Completed → "🏆 VICTORIES"

3. **Mission Cards (Parchment/Scroll Style)**
   - Beige/cream background like old paper
   - Torn edges effect
   - Priority ribbons (red/yellow/green)
   - Visual progress bar (stacked books)
   - Urgency indicators (🔥 flames, ⏰ clock)

4. **Start Session Button**
   - Giant glowing portal/orb design
   - Quillby standing next to it when enabled
   - Quillby sleeping next to it when disabled
   - Pulsing animation when ready

5. **Empty State**
   - Quillby at empty strategy table
   - "No missions yet! Ready to plan your first conquest?"
   - Big friendly button

## Visual Hierarchy

```
╔══════════════════════════════════════╗
║  🐹 QUILLBY'S MISSION CONTROL       ║
║  [Quillby studying.png]              ║
║  💬 "We've got 3 missions, captain!" ║
║  ⚡ Energy Shield: 85                ║
╚══════════════════════════════════════╝

┌────────────────────────────────────┐
│   🚀 LAUNCH MISSION PORTAL         │
│   [Glowing orb with Quillby]       │
│   Costs 20 energy • Ready!         │
└────────────────────────────────────┘

╔══════════════════════════════════════╗
║ 🔴 RED ALERT! - URGENT MISSIONS     ║
╠══════════════════════════════════════╣
║ ┌──────────────────────────────┐   ║
║ │ 📜 FINAL ESSAY               │   ║
║ │ 🔥 Due: Tomorrow             │   ║
║ │ [████████░░] 4.5/8h          │   ║
║ │      [⚔️ ATTACK NOW!]        │   ║
║ └──────────────────────────────┘   ║
╚══════════════════════════════════════╝

╔══════════════════════════════════════╗
║ 🟡 UPCOMING MISSIONS                 ║
╠══════════════════════════════════════╣
║ ┌──────────────────────────────┐   ║
║ │ 📊 Math Exam                 │   ║
║ │ 🗓️ Due: in 5 days            │   ║
║ │ [░░░░░░░░░░] 0/12h           │   ║
║ │      [🎯 PLAN ATTACK]        │   ║
║ └──────────────────────────────┘   ║
╚══════════════════════════════════════╝

[📝 PLAN NEW MISSION]
```

## Color Palette

- **Urgent**: #FF5252 (red alert)
- **Upcoming**: #FFB300 (warning yellow)
- **Completed**: #4CAF50 (victory green)
- **Parchment**: #FFF8DC (cornsilk)
- **Portal**: #6200EA (purple glow)
- **Energy Shield**: #FFD700 (gold)

## Assets Used

- `studying.png` - Quillby as commander
- `focus.png` - Quillby ready for battle
- `idle-sit-happy.png` - Quillby celebrating victories
- `sad.png` - Quillby when no energy
- `sleeping.png` - Quillby when too tired

## Implementation Priority

1. ✅ Add mission count and Quillby commander header
2. ✅ Rename all "deadline" language to "mission"
3. ✅ Redesign mission cards with parchment style
4. ✅ Add visual progress bars
5. ✅ Change button text to action-oriented
6. ✅ Add urgency indicators (🔥, ⏰, 💀)
7. ✅ Redesign start button as portal
8. ✅ Update empty state
