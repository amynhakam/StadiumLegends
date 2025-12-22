# Stadium Legends - Implementation Plan

## Overview

This document outlines the phased approach to building Stadium Legends, a musician-themed rhythm game. Each phase builds upon the previous, ensuring a functional game at each milestone.

**Estimated Total Phases**: 12  
**Tech Stack**: HTML5, CSS3, JavaScript (ES5+), Web Audio API

---

## Phase 1: Project Setup & Base HTML Structure

### Goals
- Create folder structure
- Set up index.html with all screen containers
- Link CSS and JS files

### Files Created
- `index.html` - Main HTML with screen containers
- `css/styles.css` - CSS variables, reset, base styles
- `js/config.js` - Game constants placeholder
- `js/app.js` - Main entry point placeholder

### Deliverable
- Empty screens that can be shown/hidden
- Project structure in place

---

## Phase 2: CSS Foundation & Visual Theme

### Goals
- Define CSS custom properties (colors, spacing, typography)
- Create base component styles (buttons, cards, badges)
- Set up screen layout templates
- Add responsive breakpoints

### Files Created/Updated
- `css/styles.css` - Global styles, variables, components
- `css/menu.css` - Menu screen layouts
- `css/game.css` - Gameplay screen styles
- `css/responsive.css` - Mobile breakpoints

### Deliverable
- Styled empty screens
- Consistent visual theme
- Mobile-responsive layout

---

## Phase 3: Game Configuration & Data Structures

### Goals
- Define character data (names, instruments, styles, colors)
- Define stadium data (tiers, costs, multipliers)
- Define instrument upgrade tiers
- Set up game constants (scoring, timing windows)

### Files Created
- `js/config.js` - All game constants
- `js/characters.js` - Character definitions
- `js/stadiums.js` - Stadium/venue data

### Deliverable
- Complete data model for game entities

### Character Data Structure
```javascript
{
  id: 'stella-luna',
  name: 'Stella Luna',
  icon: '🖤',
  instrument: 'Dark Synth',
  style: 'Dark pop, electronic',
  colors: { primary: '#1a1a2e', accent: '#16c172', highlight: '#9b5de5' },
  instrumentTiers: ['Basic Synth', 'Pro Synth', 'Legend Synth']
}
```

---

## Phase 4: LocalStorage & State Management

### Goals
- Create storage utility for saving/loading game state
- Initialize default player state (balance, unlocks)
- Implement save/load functions

### Files Created
- `js/storage.js` - LocalStorage wrapper

### Player State Structure
```javascript
{
  balance: 1000000,
  unlockedStadiums: ['local-bar'],
  instrumentUpgrades: {
    'stella-luna': 0,
    'k-fire': 0,
    // ... etc
  },
  highScores: {}
}
```

### Deliverable
- Persistent game state between sessions

---

## Phase 5: UI Screen Management

### Goals
- Create screen navigation system
- Implement show/hide screen functions
- Add transition animations
- Wire up navigation buttons

### Files Created
- `js/ui.js` - Screen management, transitions

### Screens
1. `title-screen`
2. `character-select`
3. `stadium-select`
4. `song-select`
5. `gameplay-screen`
6. `results-screen`
7. `upgrade-shop`

### Deliverable
- Navigate between all screens
- Smooth transitions

---

## Phase 6: Title Screen & Character Select

### Goals
- Build title screen with logo, balance display, play button
- Build character selection grid
- Display character cards with instrument/style info
- Show upgrade status badges

### Files Updated
- `index.html` - Title and character select content
- `css/menu.css` - Character card styles
- `js/ui.js` - Populate character grid

### Deliverable
- Functional title → character select flow
- Character selection working

---

## Phase 7: Stadium Select & Song Select Screens

### Goals
- Build stadium selection list
- Show locked/unlocked status
- Display venue info (capacity, multiplier, cost)
- Allow purchasing unlocks
- Build song selection (placeholder songs)

### Files Updated
- `index.html` - Stadium and song select content
- `css/menu.css` - Stadium card styles
- `js/ui.js` - Stadium/song list population
- `js/songs.js` - Placeholder song data

### Deliverable
- Stadium unlock purchasing
- Song selection functional

---

## Phase 8: Audio System Setup

### Goals
- Create audio manager using Web Audio API
- Load and play sound effects
- Load and play music tracks
- Handle audio context initialization (user gesture required)

### Files Created
- `js/audio.js` - Audio loading, playback, timing

### Sound Effects Needed
- `hit-perfect.mp3` - Perfect note hit
- `hit-good.mp3` - Good note hit
- `hit-miss.mp3` - Missed note
- `combo.mp3` - Combo milestone
- `money-gain.mp3` - Earning money
- `money-loss.mp3` - Losing money
- `ui-click.mp3` - Button clicks

### Music Tracks (Royalty-Free)
- 1-2 tracks per character style (can use generated tones initially)

### Deliverable
- Audio plays on user interaction
- Sound effects functional

---

## Phase 9: Core Gameplay - Note Rendering

### Goals
- Create gameplay canvas/DOM structure
- Render 4 note lanes
- Animate notes falling down screen
- Draw hit zone indicator
- Display current score, combo, accuracy

### Files Updated
- `index.html` - Gameplay screen structure
- `css/game.css` - Note lane styling
- `js/game.js` - Note rendering, animation loop

### Note Data Structure
```javascript
{
  lane: 0-3,
  time: 1500,  // ms from song start
  hit: false,
  result: null  // 'perfect', 'good', 'miss'
}
```

### Deliverable
- Notes visually fall down lanes
- Hit zone visible

---

## Phase 10: Core Gameplay - Input & Scoring

### Goals
- Handle keyboard input (1, 2, 3, 4 keys)
- Handle touch input (4 tap zones)
- Detect note hits based on timing
- Calculate Perfect/Good/Miss
- Update score and money in real-time
- Track combo multiplier

### Files Updated
- `js/game.js` - Input handling, hit detection, scoring

### Timing Windows
- Perfect: ±50ms
- Good: ±100ms
- Miss: >100ms or no input

### Deliverable
- Playable rhythm game
- Scoring functional

---

## Phase 11: Results Screen & Progression

### Goals
- Show performance breakdown after song
- Display Perfect/Good/Miss counts
- Calculate and show earnings
- Update player balance
- Check for new stadium unlocks
- Return to menu flow

### Files Updated
- `index.html` - Results screen content
- `css/menu.css` - Results styling
- `js/ui.js` - Results screen population
- `js/game.js` - End game flow

### Deliverable
- Complete gameplay loop
- Money updates persist

---

## Phase 12: Upgrade Shop & Polish

### Goals
- Build upgrade shop interface
- Display instrument tiers per character
- Handle upgrade purchases
- Add visual/audio feedback for upgrades
- Apply upgrade benefits (timing window increase)
- Final polish and bug fixes

### Files Updated
- `index.html` - Upgrade shop content
- `css/menu.css` - Shop styling
- `js/ui.js` - Shop population
- `js/game.js` - Apply upgrade effects

### Upgrade Benefits
| Tier | Cost | Timing Bonus |
|------|------|--------------|
| Basic | Free | ±50ms / ±100ms |
| Pro | $3,000,000 | ±60ms / ±120ms (+20%) |
| Legend | $10,000,000 | ±70ms / ±140ms (+40%) |

### Deliverable
- Complete game with all features
- Polished UI/UX
- Ready for deployment

---

## Phase Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | Project Setup | Folder structure, base HTML |
| 2 | CSS Foundation | Visual theme, responsive layout |
| 3 | Game Data | Characters, stadiums, config |
| 4 | Storage | LocalStorage persistence |
| 5 | UI Navigation | Screen management system |
| 6 | Title/Character | Character selection flow |
| 7 | Stadium/Song | Venue unlocks, song selection |
| 8 | Audio | Sound effects, music playback |
| 9 | Gameplay Render | Note lanes, falling notes |
| 10 | Gameplay Input | Hit detection, scoring |
| 11 | Results | Performance summary, progression |
| 12 | Shop/Polish | Upgrades, final polish |

---

## Testing Checkpoints

After each phase, verify:
- [ ] No console errors
- [ ] Responsive on desktop and mobile
- [ ] Previous functionality still works
- [ ] State persists in LocalStorage (Phase 4+)

---

## Dependencies & Assets Needed

### External Libraries
- None (vanilla JS)

### Assets to Source/Create
- Character portrait images (or use emojis/CSS art)
- Background images for stadiums (optional)
- Royalty-free music tracks (5 styles)
- Sound effect audio files

### Fallback Strategy
- Use CSS-generated visuals if images unavailable
- Use Web Audio API to generate tones if music unavailable
- Emoji icons for characters initially

---

## Deployment

After Phase 12:
1. Test on multiple browsers
2. Test on mobile devices
3. Create GitHub repository
4. Enable GitHub Pages
5. Share URL

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Audio sync issues | Use Web Audio API scheduling, not setTimeout |
| Mobile touch lag | Use touchstart event, prevent default |
| Large audio files | Compress to MP3, lazy load non-essential |
| Browser compatibility | Test early, use feature detection |
| LocalStorage limits | Keep state minimal, handle quota errors |
