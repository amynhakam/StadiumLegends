# Stadium Legends - Product Requirements Document

## Overview

**Stadium Legends** is a musician-themed rhythm game where players select from 5 characters (loosely based on famous musicians) and perform at world-famous stadiums. Players hit notes streaming down the screen (Guitar Hero style) to earn money, unlock venues, and upgrade instruments.

---

## Core Concept

- **Genre**: Rhythm / Music Game
- **Platform**: Web-based (HTML/CSS/JavaScript)
- **Target Devices**: Desktop browsers & Mobile web (responsive)
- **Starting Balance**: $1,000,000

---

## Characters

Each character has a unique visual style, instrument, and music genre:

| Character | Inspired By | Instrument | Music Style |
|-----------|-------------|------------|-------------|
| 🖤 **Stella Luna** | Billie Eilish | Dark Synth | Dark pop, electronic, atmospheric |
| 🔥 **K-Fire** | Kendrick Lamar | Beat Pad | Hip-hop, rap, conscious beats |
| 🐰 **El Conejo** | Bad Bunny | Reggaeton Drums | Reggaeton, Latin trap, dance |
| ⚡ **Ziggy Flash** | David Bowie | Electric Guitar | Glam rock, art rock, experimental |
| 🦋 **Dolly Mae** | Dolly Parton | Acoustic Guitar | Country, folk, Americana |

---

## Gameplay Mechanics

### Note System
- Notes stream down the screen in 4 lanes
- Players must hit notes when they reach the "hit zone" at the bottom
- **Desktop Controls**: Number keys 1, 2, 3, 4
- **Mobile Controls**: 4 touch buttons displayed on screen

### Scoring System
| Hit Quality | Timing Window | Money Effect |
|-------------|---------------|--------------|
| **Perfect** | ±50ms | +$500,000 |
| **Good** | ±100ms | +$100,000 |
| **Miss** | >100ms or no input | -$500,000 |

### Performance Metrics
- Combo multiplier for consecutive hits
- Accuracy percentage displayed
- Total earnings/losses per song

---

## Progression System

### Stadium Unlocks
Players unlock larger venues by accumulating total earnings:

| Tier | Venue | Unlock Cost | Capacity | Earnings Multiplier |
|------|-------|-------------|----------|---------------------|
| 1 | 🎤 **Local Bar** | Free | 100 | 1.0x |
| 2 | 🎵 **Club Venue** | $500,000 | 500 | 1.2x |
| 3 | 🎭 **Theater** | $2,000,000 | 2,000 | 1.5x |
| 4 | 🏟️ **Arena** | $5,000,000 | 15,000 | 2.0x |
| 5 | 🌟 **Madison Square Garden** | $10,000,000 | 20,000 | 2.5x |
| 6 | 🏆 **Wembley Stadium** | $20,000,000 | 90,000 | 3.0x |

### Instrument Upgrades
Each character can upgrade their instrument through 3 tiers:

| Tier | Cost | Benefits |
|------|------|----------|
| **Basic** | Free | Default instrument |
| **Pro** | $3,000,000 | +20% timing window, visual effects |
| **Legend** | $10,000,000 | +40% timing window, premium effects, unique sounds |

---

## Audio System

### Music Requirements
- Royalty-free music tracks in each character's style
- 2-3 songs per character initially
- Background music loops for menus
- Sound effects for:
  - Perfect hit
  - Good hit
  - Miss
  - Combo milestones
  - Money gain/loss

### Music Styles by Character
- **Stella Luna**: Dark, atmospheric synth beats
- **K-Fire**: Hard-hitting hip-hop instrumentals
- **El Conejo**: Reggaeton/Latin trap rhythms
- **Ziggy Flash**: Classic rock guitar riffs
- **Dolly Mae**: Country acoustic strumming

---

## User Interface

### Screens

1. **Title Screen**
   - Game logo
   - "Play" button
   - Current balance display

2. **Character Select**
   - 5 character cards with portraits
   - Character name, instrument, style
   - Instrument upgrade status

3. **Stadium Select**
   - List of venues (locked/unlocked status)
   - Venue capacity and multiplier info
   - Cost to unlock

4. **Song Select**
   - Available songs for selected character
   - Song difficulty indicator
   - Best score display

5. **Gameplay Screen**
   - 4 note lanes
   - Hit zone indicator
   - Current score/money
   - Combo counter
   - Accuracy percentage
   - Progress bar

6. **Results Screen**
   - Performance breakdown (Perfect/Good/Miss counts)
   - Money earned/lost
   - New total balance
   - Unlocks achieved (if any)

7. **Upgrade Shop**
   - Instrument upgrades per character
   - Cost and benefits display
   - Purchase confirmation

---

## Visual Design

### Theme
- Vibrant, energetic concert aesthetic
- Neon accents and stage lighting effects
- Character-specific color schemes:
  - Stella Luna: Black, green, purple
  - K-Fire: Red, gold, black
  - El Conejo: Pink, yellow, tropical
  - Ziggy Flash: Blue, orange, silver (glam)
  - Dolly Mae: Pink, white, gold (rhinestone)

### Responsive Design
- Desktop: Full-width gameplay, keyboard controls
- Mobile: Stacked layout, large touch targets (minimum 48px)
- Landscape orientation recommended for mobile

---

## Technical Requirements

### Stack
- **HTML5**: Structure and canvas for game rendering
- **CSS3**: Styling, animations, responsive layout
- **JavaScript (ES5+)**: Game logic, no external frameworks
- **Web Audio API**: Sound playback and timing

### Performance
- Target 60fps gameplay
- Preload audio assets
- Minimal DOM manipulation during gameplay

### Data Persistence
- **LocalStorage** for:
  - Player balance
  - Unlocked stadiums
  - Instrument upgrades
  - High scores per song

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari / Chrome for iOS/Android

---

## File Structure

```
StadiumLegends/
├── index.html
├── css/
│   ├── styles.css        # Global styles, variables
│   ├── menu.css          # Menu screens
│   ├── game.css          # Gameplay screen
│   └── responsive.css    # Mobile breakpoints
├── js/
│   ├── config.js         # Game constants, character data
│   ├── storage.js        # LocalStorage management
│   ├── audio.js          # Sound management
│   ├── characters.js     # Character definitions
│   ├── stadiums.js       # Stadium/venue data
│   ├── songs.js          # Song data and note patterns
│   ├── game.js           # Core gameplay logic
│   ├── ui.js             # Screen management
│   └── app.js            # Main entry point
├── assets/
│   ├── audio/
│   │   ├── music/        # Background tracks
│   │   └── sfx/          # Sound effects
│   └── images/           # Character portraits, backgrounds
└── README.md
```

---

## Future Enhancements (Out of Scope for MVP)

- Multiplayer mode (battle/co-op)
- Online leaderboards
- Additional characters (DLC style)
- Custom song import
- Achievement system
- Daily challenges
- Tour mode (story progression)

---

## Success Metrics

- Game loads and runs without errors
- All 5 characters playable
- Progression system functional (unlocks, upgrades)
- Responsive on desktop and mobile
- Audio synced with visual notes
- Data persists between sessions
