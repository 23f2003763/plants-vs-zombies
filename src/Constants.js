/**
 * Game Constants and Configuration
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

    // Sun Settings
    SUN: {
        STARTING_AMOUNT: 150,
        NATURAL_SPAWN_INTERVAL: 6000, // ms - faster sun spawns
        NATURAL_SUN_VALUE: 25,
        SUNFLOWER_INTERVAL: 5000,
        SUNFLOWER_VALUE: 25,
        COLLECT_SPEED: 8
    },

    // Plant Types
    PLANTS: {
        PEASHOOTER: {
            id: 'peashooter',
            name: 'Peashooter',
            cost: 100,
            health: 120,
            cooldown: 1500,
            fireRate: 800,  // Much faster firing
            damage: 25,
            color: 0x4CAF50
        },
        SUNFLOWER: {
            id: 'sunflower',
            name: 'Sunflower',
            cost: 50,
            health: 100,
            cooldown: 1500,
            sunInterval: 5000,
            sunValue: 25,
            color: 0xFFD700
        },
        WALLNUT: {
            id: 'wallnut',
            name: 'Wall-nut',
            cost: 50,
            health: 500,
            cooldown: 4000,
            color: 0x8B4513
        },
        CHERRYBOMB: {
            id: 'cherrybomb',
            name: 'Cherry Bomb',
            cost: 150,
            health: 1,
            cooldown: 8000,
            explosionRadius: 2.0,
            explosionDamage: 2000,
            color: 0xF44336
        }
    },

    // Zombie Types
    ZOMBIES: {
        BASIC: {
            id: 'basic',
            name: 'Basic Zombie',
            health: 100,
            speed: 1.2,
            damage: 25,
            attackSpeed: 600,
            color: 0x98FB98
        },
        CONE: {
            id: 'cone',
            name: 'Cone Zombie',
            health: 200,
            speed: 1.0,
            damage: 25,
            attackSpeed: 600,
            color: 0x98FB98
        },
        BUCKET: {
            id: 'bucket',
            name: 'Bucket Zombie',
            health: 400,
            speed: 0.8,
            damage: 30,
            attackSpeed: 700,
            color: 0x98FB98
        },
        FLAG: {
            id: 'flag',
            name: 'Flag Zombie',
            health: 100,
            speed: 1.8,
            damage: 25,
            attackSpeed: 500,
            color: 0x98FB98
        }
    },

    // Wave Settings
    WAVES: [
        {
            number: 1,
            zombies: [
                { type: 'basic', count: 4, interval: 3000 }
            ],
            delay: 2000
        },
        {
            number: 2,
            zombies: [
                { type: 'basic', count: 6, interval: 2500 },
                { type: 'cone', count: 2, interval: 4000 }
            ],
            delay: 2000
        },
        {
            number: 3,
            zombies: [
                { type: 'basic', count: 8, interval: 2000 },
                { type: 'cone', count: 4, interval: 3000 },
                { type: 'bucket', count: 1, interval: 6000 }
            ],
            delay: 1500
        },
        {
            number: 4,
            zombies: [
                { type: 'basic', count: 10, interval: 1800 },
                { type: 'cone', count: 6, interval: 2500 },
                { type: 'bucket', count: 3, interval: 5000 },
                { type: 'flag', count: 1, interval: 8000 }
            ],
            delay: 1500
        },
        {
            number: 5,
            zombies: [
                { type: 'basic', count: 12, interval: 1500 },
                { type: 'cone', count: 8, interval: 2000 },
                { type: 'bucket', count: 5, interval: 4000 },
                { type: 'flag', count: 3, interval: 6000 }
            ],
            delay: 1000
        }
    ],

    // Projectile Settings
    PROJECTILE: {
        SPEED: 12,
        SIZE: 0.18,
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
