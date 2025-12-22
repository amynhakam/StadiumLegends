# Stadium Legends 🎸

A musician-themed rhythm game where you choose from 5 unique characters and perform at world-famous stadiums!

## 🎮 How to Play

1. **Choose Your Artist** - Select from 5 unique characters, each with their own instrument and style
2. **Pick a Venue** - Start at local bars and work your way up to Wembley Stadium
3. **Select a Song** - Each character has 3 songs matching their style
4. **Hit the Notes** - Press the right keys when notes reach the hit zone

### Controls

**Desktop:**
- `1`, `2`, `3`, `4` keys to hit notes in each lane
- `P` or `Escape` to pause

**Mobile:**
- Tap the touch buttons at the bottom of the screen

### Scoring

| Hit Quality | Timing Window | Earnings |
|-------------|---------------|----------|
| Perfect | ±50ms | +$500,000 |
| Good | ±100ms | +$100,000 |
| Miss | >100ms | -$500,000 |

## 🎤 Characters

| Character | Instrument | Style |
|-----------|------------|-------|
| 🖤 Stella Luna | Dark Synth | Dark pop, electronic |
| 🔥 K-Fire | Beat Pad | Hip-hop, rap |
| 🐰 El Conejo | Reggaeton Drums | Latin trap, reggaeton |
| ⚡ Ziggy Flash | Electric Guitar | Glam rock, art rock |
| 🦋 Dolly Mae | Acoustic Guitar | Country, folk |

## 🏟️ Venues

1. **Local Bar** - Free (1.0x multiplier)
2. **Club Venue** - $500K (1.2x multiplier)
3. **Grand Theater** - $2M (1.5x multiplier)
4. **Metro Arena** - $5M (2.0x multiplier)
5. **Madison Square Garden** - $10M (2.5x multiplier)
6. **Wembley Stadium** - $20M (3.0x multiplier)

## 🎸 Upgrades

Upgrade your instruments to improve timing windows:

| Tier | Cost | Timing Bonus |
|------|------|--------------|
| Basic | Free | ±50ms / ±100ms |
| Pro | $3M | +20% timing window |
| Legend | $10M | +40% timing window |

## 🚀 Getting Started

Simply open `index.html` in your web browser to play!

## 🛠️ Tech Stack

- HTML5
- CSS3 (with CSS Custom Properties)
- Vanilla JavaScript (ES5+)
- Web Audio API (for generated sounds)

## 📁 Project Structure

```
StadiumLegends/
├── index.html          # Main game page
├── css/
│   ├── styles.css      # Global styles
│   ├── menu.css        # Menu screens
│   ├── game.css        # Gameplay styles
│   └── responsive.css  # Mobile support
├── js/
│   ├── config.js       # Game constants
│   ├── storage.js      # Save/load data
│   ├── audio.js        # Sound system
│   ├── characters.js   # Character data
│   ├── stadiums.js     # Venue data
│   ├── songs.js        # Song/note patterns
│   ├── game.js         # Core gameplay
│   ├── ui.js           # Screen management
│   └── app.js          # Main entry point
└── assets/
    ├── audio/          # Sound files (optional)
    └── images/         # Image assets (optional)
```

## 📝 License

MIT License - Feel free to modify and share!
