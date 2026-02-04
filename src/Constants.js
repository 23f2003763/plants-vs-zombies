/**
 * Game Constants and Configuration
 * Balanced for fun gameplay
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

    // Sun Settings - GENEROUS for fast gameplay
    SUN: {
        STARTING_AMOUNT: 150,  // Start with enough for 2-3 plants
        NATURAL_SPAWN_INTERVAL: 5000,  // Sun every 5 seconds
        NATURAL_SUN_VALUE: 50,  // Worth more
        SUNFLOWER_INTERVAL: 10000,  // Sunflower produces every 10 seconds
        SUNFLOWER_VALUE: 50,
        COLLECT_SPEED: 10
    },

    // Plant Types - FAST cooldowns for action
    PLANTS: {
        PEASHOOTER: {
            id: 'peashooter',
            name: 'Peashooter',
            description: 'Shoots peas at zombies',
            cost: 100,
            health: 300,
            cooldown: 3000,  // 3 second cooldown - FAST
            fireRate: 1200,  // Shoots faster
            damage: 25,
            color: 0x4CAF50
        },
        SUNFLOWER: {
            id: 'sunflower',
            name: 'Sunflower',
            description: 'Produces sun for planting',
            cost: 50,
            health: 300,
            cooldown: 3000,  // 3 second cooldown
            sunInterval: 10000,
            sunValue: 50,
            color: 0xFFD700
        },
        WALLNUT: {
            id: 'wallnut',
            name: 'Wall-nut',
            description: 'Blocks zombies with tough shell',
            cost: 50,
            health: 4000,
            cooldown: 5000,  // 5 second cooldown
            color: 0x8B4513
        },
        CHERRYBOMB: {
            id: 'cherrybomb',
            name: 'Cherry Bomb',
            description: 'Explodes in 3x3 area',
            cost: 150,
            health: 1,
            cooldown: 15000,  // 15 second cooldown
            explosionRadius: 2.0,
            explosionDamage: 2000,
            color: 0xF44336
        }
    },

    // Zombie Types - Slower for early game
    ZOMBIES: {
        BASIC: {
            id: 'basic',
            name: 'Zombie',
            health: 200,  // Easier to kill
            speed: 0.5,   // SLOWER
            damage: 80,
            attackSpeed: 600,
            color: 0x98FB98
        },
        CONE: {
            id: 'cone',
            name: 'Conehead',
            health: 450,
            speed: 0.5,
            damage: 80,
            attackSpeed: 600,
            color: 0x98FB98
        },
        BUCKET: {
            id: 'bucket',
            name: 'Buckethead',
            health: 900,
            speed: 0.4,
            damage: 80,
            attackSpeed: 600,
            color: 0x98FB98
        },
        FLAG: {
            id: 'flag',
            name: 'Flag Zombie',
            health: 200,
            speed: 0.8,
            damage: 80,
            attackSpeed: 600,
            color: 0x98FB98
        }
    },

    // Wave Settings - SLOWER spawns, more time between waves
    WAVES: [
        {
            number: 1,
            zombies: [
                { type: 'basic', count: 2, interval: 12000 }  // Only 2 zombies, 12s apart
            ],
            delay: 8000  // 8 second delay before wave starts
        },
        {
            number: 2,
            zombies: [
                { type: 'basic', count: 4, interval: 10000 },
                { type: 'cone', count: 1, interval: 15000 }
            ],
            delay: 6000
        },
        {
            number: 3,
            zombies: [
                { type: 'basic', count: 5, interval: 8000 },
                { type: 'cone', count: 2, interval: 12000 }
            ],
            delay: 5000
        },
        {
            number: 4,
            zombies: [
                { type: 'basic', count: 6, interval: 6000 },
                { type: 'cone', count: 3, interval: 10000 },
                { type: 'bucket', count: 1, interval: 20000 }
            ],
            delay: 4000
        },
        {
            number: 5,
            zombies: [
                { type: 'basic', count: 8, interval: 5000 },
                { type: 'cone', count: 4, interval: 8000 },
                { type: 'bucket', count: 2, interval: 15000 },
                { type: 'flag', count: 1, interval: 25000 }
            ],
            delay: 3000
        }
    ],

    // Projectile Settings
    PROJECTILE: {
        SPEED: 12,
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
