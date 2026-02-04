# Plants vs Zombies 3D - Roblox Style Tower Defense

A fully playable 3D single-player tower-defense game inspired by Plants vs Zombies, rendered in a Roblox-style aesthetic with blocky avatars, modular characters, and colorful readable geometry.

![Game Screenshot](screenshot.png)

## 🎮 Features

- **3D Roblox-Style Graphics**: Blocky characters with procedurally generated models
- **4 Unique Plants**: Peashooter, Sunflower, Wall-nut, Cherry Bomb
- **4 Zombie Types**: Basic, Cone, Bucket, Flag zombies
- **5 Progressive Waves**: Increasing difficulty
- **Full Gameplay Loop**: Sun collection, plant placement, combat, win/lose conditions
- **Procedural Audio**: All sounds generated using Web Audio API
- **Post-Processing Effects**: Bloom, shadows, fog
- **Responsive UI**: Glassmorphism design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Modern web browser (Chrome, Firefox, Edge)

### Installation

```bash
# Navigate to project directory
cd "Plants vs Zombies Web"

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open automatically at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 🎯 How to Play

1. **Start**: Click "Play Game" from the main menu
2. **Collect Sun**: Click on falling suns to collect them (currency)
3. **Select Plants**: Click a plant card in the top bar (or press 1-4)
4. **Place Plants**: Click on an empty grass tile to place
5. **Defend**: Plants automatically attack zombies in their row
6. **Win**: Survive all 5 waves!
7. **Lose**: If any zombie reaches the house, you lose

### Controls

| Action | Control |
|--------|---------|
| Select Plant | Left Click on card / Number keys 1-4 |
| Place Plant | Left Click on grass tile |
| Cancel Placement | Right Click |
| Collect Sun | Left Click on sun |
| Pan Camera | Right Click + Drag |
| Zoom | Mouse Wheel |
| Pause | Escape |
| Speed Toggle | Spacebar |

### Plants

| Plant | Cost | Description |
|-------|------|-------------|
| 🌱 Peashooter | 100 | Fires peas at zombies in its lane |
| 🌻 Sunflower | 50 | Produces sun over time |
| 🥜 Wall-nut | 50 | High HP barrier to block zombies |
| 🍒 Cherry Bomb | 150 | Explodes, destroying nearby zombies |

### Zombies

| Zombie | Health | Speed | Description |
|--------|--------|-------|-------------|
| Basic | 100 | Normal | Standard zombie |
| Cone | 200 | Normal | Wears traffic cone for protection |
| Bucket | 400 | Slow | Wears bucket for heavy protection |
| Flag | 100 | Fast | Signals large waves coming |

## 🏗️ Project Structure

```
Plants vs Zombies Web/
├── index.html          # Entry HTML
├── styles.css          # UI styles
├── package.json        # Dependencies
├── vite.config.js      # Build config
└── src/
    ├── main.js         # Entry point
    ├── Game.js         # Main game class
    ├── Constants.js    # Game configuration
    ├── engine/
    │   ├── Renderer.js     # Three.js renderer
    │   ├── ECS.js          # Entity-Component-System
    │   ├── Camera.js       # Camera controller
    │   ├── Time.js         # Time management
    │   └── Input.js        # Input handling
    ├── assets/
    │   ├── ModelGenerator.js   # Procedural models
    │   └── AnimationSystem.js  # Programmatic animations
    ├── systems/
    │   ├── GridSystem.js       # Lawn grid
    │   ├── CombatSystem.js     # Projectiles & damage
    │   ├── ZombieAI.js         # Zombie behavior
    │   ├── WaveManager.js      # Wave spawning
    │   └── SunSystem.js        # Sun resources
    ├── ui/
    │   └── UIManager.js        # UI screens & HUD
    └── audio/
        └── AudioManager.js     # Procedural audio
```

## 🛠️ Technical Details

### Engine
- **Three.js**: WebGL rendering with post-processing
- **Custom ECS**: Entity-Component-System architecture
- **Fixed Timestep**: Consistent physics simulation

### Assets
- **100% Procedural**: All models and sounds generated at runtime
- **No External Files**: No asset downloads required
- **Material Caching**: Shared materials for performance

### Performance
- **Object Pooling**: Projectiles and suns are pooled
- **60 FPS Target**: Optimized rendering
- **Memory Efficient**: Proper disposal of resources

## 📝 License

This is an educational project inspired by Plants vs Zombies.
The original game is © Electronic Arts / PopCap Games.

This implementation uses no copyrighted assets.
All graphics, sounds, and code are original.

## 🙏 Credits

- Game concept inspired by PopCap's Plants vs Zombies
- Visual style inspired by Roblox
- Built with Three.js
