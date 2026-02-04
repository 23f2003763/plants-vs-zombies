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
        STARTING_AMOUNT: 50,
        NATURAL_SPAWN_INTERVAL: 10000, // ms
        NATURAL_SUN_VALUE: 25,
        SUNFLOWER_INTERVAL: 7000,
        SUNFLOWER_VALUE: 25,
        COLLECT_SPEED: 5
    },

    // Plant Types
    PLANTS: {
        PEASHOOTER: {
            id: 'peashooter',
            name: 'Peashooter',
            cost: 100,
            health: 100,
            cooldown: 2000,
            fireRate: 1500,
            damage: 20,
            color: 0x4CAF50
        },
        SUNFLOWER: {
            id: 'sunflower',
            name: 'Sunflower',
            cost: 50,
            health: 100,
            cooldown: 2000,
            sunInterval: 7000,
            sunValue: 25,
            color: 0xFFD700
        },
        WALLNUT: {
            id: 'wallnut',
            name: 'Wall-nut',
            cost: 50,
            health: 400,
            cooldown: 5000,
            color: 0x8B4513
        },
        CHERRYBOMB: {
            id: 'cherrybomb',
            name: 'Cherry Bomb',
            cost: 150,
            health: 1,
            cooldown: 10000,
            explosionRadius: 1.5,
            explosionDamage: 1800,
            color: 0xF44336
        }
    },

    // Zombie Types
    ZOMBIES: {
        BASIC: {
            id: 'basic',
            name: 'Basic Zombie',
            health: 100,
            speed: 0.3,
            damage: 20,
            attackSpeed: 1000,
            color: 0x98FB98
        },
        CONE: {
            id: 'cone',
            name: 'Cone Zombie',
            health: 200,
            speed: 0.3,
            damage: 20,
            attackSpeed: 1000,
            color: 0x98FB98
        },
        BUCKET: {
            id: 'bucket',
            name: 'Bucket Zombie',
            health: 400,
            speed: 0.25,
            damage: 25,
            attackSpeed: 1000,
            color: 0x98FB98
        },
        FLAG: {
            id: 'flag',
            name: 'Flag Zombie',
            health: 100,
            speed: 0.5,
            damage: 20,
            attackSpeed: 1000,
            color: 0x98FB98
        }
    },

    // Wave Settings
    WAVES: [
        {
            number: 1,
            zombies: [
                { type: 'basic', count: 3, interval: 5000 }
            ],
            delay: 5000
        },
        {
            number: 2,
            zombies: [
                { type: 'basic', count: 5, interval: 4000 },
                { type: 'cone', count: 2, interval: 6000 }
            ],
            delay: 3000
        },
        {
            number: 3,
            zombies: [
                { type: 'basic', count: 6, interval: 3500 },
                { type: 'cone', count: 4, interval: 5000 },
                { type: 'bucket', count: 1, interval: 10000 }
            ],
            delay: 3000
        },
        {
            number: 4,
            zombies: [
                { type: 'basic', count: 8, interval: 3000 },
                { type: 'cone', count: 5, interval: 4000 },
                { type: 'bucket', count: 2, interval: 8000 },
                { type: 'flag', count: 1, interval: 15000 }
            ],
            delay: 2000
        },
        {
            number: 5,
            zombies: [
                { type: 'basic', count: 10, interval: 2500 },
                { type: 'cone', count: 6, interval: 3500 },
                { type: 'bucket', count: 4, interval: 6000 },
                { type: 'flag', count: 2, interval: 10000 }
            ],
            delay: 2000
        }
    ],

    // Projectile Settings
    PROJECTILE: {
        SPEED: 8,
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
