/**
 * Game Constants and Configuration
 * Based on original Plants vs Zombies game stats
 */
export const GAME_CONFIG = {
    // Grid Settings
    GRID: {
        ROWS: 5,
        COLS: 9,
        CELL_SIZE: 1.2,
        OFFSET_X: -5.4,
        OFFSET_Z: -2.4
    },

    // Camera Settings
    CAMERA: {
        FOV: 45,
        NEAR: 0.1,
        FAR: 1000,
        POSITION: { x: 0, y: 12, z: 14 },
        LOOK_AT: { x: 0, y: 0, z: 0 }
    },

    // Time Settings
    TIME: {
        FIXED_TIMESTEP: 1 / 60,
        MAX_DELTA: 0.1
    },

    // Sun Settings (original game: sunflower produces every 20-24 seconds)
    SUN: {
        STARTING_AMOUNT: 50,  // Original game starts with 50
        NATURAL_SPAWN_INTERVAL: 8000,
        NATURAL_SUN_VALUE: 25,
        SUNFLOWER_INTERVAL: 20000, // 20 seconds like original
        SUNFLOWER_VALUE: 25,
        COLLECT_SPEED: 8
    },

    // Plant Types - Accurate to original game
    PLANTS: {
        PEASHOOTER: {
            id: 'peashooter',
            name: 'Peashooter',
            description: 'Shoots peas at zombies',
            cost: 100,  // Original: 100
            health: 300,
            cooldown: 7500,  // Fast recharge
            fireRate: 1400,  // ~1.4 seconds between shots
            damage: 20,   // 20 damage per pea
            color: 0x4CAF50
        },
        SUNFLOWER: {
            id: 'sunflower',
            name: 'Sunflower',
            description: 'Produces sun for planting',
            cost: 50,   // Original: 50
            health: 300,
            cooldown: 7500,  // Fast recharge
            sunInterval: 20000,  // 20 seconds
            sunValue: 25,
            color: 0xFFD700
        },
        WALLNUT: {
            id: 'wallnut',
            name: 'Wall-nut',
            description: 'Blocks zombies with tough shell',
            cost: 50,   // Original: 50
            health: 4000,  // Very high HP - absorbs lots of damage
            cooldown: 30000,  // Slow recharge
            color: 0x8B4513
        },
        CHERRYBOMB: {
            id: 'cherrybomb',
            name: 'Cherry Bomb',
            description: 'Explodes in 3x3 area',
            cost: 150,  // Original: 150
            health: 1,
            cooldown: 45000,  // Very slow recharge (45-50 seconds)
            explosionRadius: 1.8,  // 3x3 tiles
            explosionDamage: 1800,  // Instant kill most zombies
            color: 0xF44336
        }
    },

    // Zombie Types - Based on original game stats
    ZOMBIES: {
        BASIC: {
            id: 'basic',
            name: 'Zombie',
            health: 270,  // Original: 270 HP
            speed: 0.8,
            damage: 100,  // 100 DPS - eats plant in ~3 seconds
            attackSpeed: 500,
            color: 0x98FB98
        },
        CONE: {
            id: 'cone',
            name: 'Conehead',
            health: 640,  // Cone adds 370 HP to base 270
            speed: 0.8,
            damage: 100,
            attackSpeed: 500,
            color: 0x98FB98
        },
        BUCKET: {
            id: 'bucket',
            name: 'Buckethead',
            health: 1370,  // Bucket adds 1100 HP to base 270
            speed: 0.7,
            damage: 100,
            attackSpeed: 500,
            color: 0x98FB98
        },
        FLAG: {
            id: 'flag',
            name: 'Flag Zombie',
            health: 270,  // Same as basic
            speed: 1.2,   // Faster than basic
            damage: 100,
            attackSpeed: 500,
            color: 0x98FB98
        }
    },

    // Wave Settings
    WAVES: [
        {
            number: 1,
            zombies: [
                { type: 'basic', count: 3, interval: 8000 }
            ],
            delay: 3000
        },
        {
            number: 2,
            zombies: [
                { type: 'basic', count: 5, interval: 6000 },
                { type: 'cone', count: 1, interval: 12000 }
            ],
            delay: 3000
        },
        {
            number: 3,
            zombies: [
                { type: 'basic', count: 6, interval: 5000 },
                { type: 'cone', count: 3, interval: 8000 },
                { type: 'bucket', count: 1, interval: 20000 }
            ],
            delay: 3000
        },
        {
            number: 4,
            zombies: [
                { type: 'basic', count: 8, interval: 4000 },
                { type: 'cone', count: 4, interval: 6000 },
                { type: 'bucket', count: 2, interval: 15000 },
                { type: 'flag', count: 1, interval: 25000 }
            ],
            delay: 2000
        },
        {
            number: 5,
            zombies: [
                { type: 'basic', count: 10, interval: 3000 },
                { type: 'cone', count: 6, interval: 5000 },
                { type: 'bucket', count: 3, interval: 10000 },
                { type: 'flag', count: 2, interval: 15000 }
            ],
            delay: 2000
        }
    ],

    // Projectile Settings
    PROJECTILE: {
        SPEED: 10,
        SIZE: 0.15,
        COLOR: 0x00FF00
    },

    // Audio Settings
    AUDIO: {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8
    },

    // Colors
    COLORS: {
        GRASS_LIGHT: 0x7CFC00,
        GRASS_DARK: 0x228B22,
        SKY: 0x87CEEB,
        HOUSE: 0x8B4513,
        PATH: 0xD2B48C
    }
};

// Game States
export const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WIN: 'win',
    LOSE: 'lose'
};

// Entity Types
export const ENTITY_TYPES = {
    PLANT: 'plant',
    ZOMBIE: 'zombie',
    PROJECTILE: 'projectile',
    SUN: 'sun',
    TILE: 'tile'
};
