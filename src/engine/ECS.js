/**
 * Entity-Component-System Implementation
 */

// Entity ID counter
let entityIdCounter = 0;

/**
 * Entity class - simple container for components
 */
export class Entity {
    constructor(type = 'default') {
        this.id = entityIdCounter++;
        this.type = type;
        this.components = new Map();
        this.active = true;
        this.mesh = null;
    }

    addComponent(componentName, data) {
        this.components.set(componentName, data);
        return this;
    }

    getComponent(componentName) {
        return this.components.get(componentName);
    }

    hasComponent(componentName) {
        return this.components.has(componentName);
    }

    removeComponent(componentName) {
        this.components.delete(componentName);
        return this;
    }

    setMesh(mesh) {
        this.mesh = mesh;
        mesh.userData.entityId = this.id;
        return this;
    }

    destroy() {
        this.active = false;
    }
}

/**
 * System base class
 */
export class System {
    constructor(world) {
        this.world = world;
        this.requiredComponents = [];
    }

    // Override in subclasses
    update(deltaTime) { }

    getEntities() {
        return this.world.getEntitiesWithComponents(this.requiredComponents);
    }
}

/**
 * World - manages all entities and systems
 */
export class World {
    constructor() {
        this.entities = new Map();
        this.systems = [];
        this.entityPools = new Map();
        this.pendingRemovals = [];
    }

    createEntity(type = 'default') {
        const entity = new Entity(type);
        this.entities.set(entity.id, entity);
        return entity;
    }

    getEntity(id) {
        return this.entities.get(id);
    }

    removeEntity(entity) {
        this.pendingRemovals.push(entity);
    }

    processPendingRemovals(scene) {
        for (const entity of this.pendingRemovals) {
            if (entity.mesh) {
                scene.remove(entity.mesh);
                if (entity.mesh.geometry) entity.mesh.geometry.dispose();
                if (entity.mesh.material) {
                    if (Array.isArray(entity.mesh.material)) {
                        entity.mesh.material.forEach(m => m.dispose());
                    } else {
                        entity.mesh.material.dispose();
                    }
                }
            }
            this.entities.delete(entity.id);
        }
        this.pendingRemovals = [];
    }

    addSystem(system) {
        this.systems.push(system);
        return this;
    }

    getEntitiesWithComponents(componentNames) {
        const result = [];
        for (const entity of this.entities.values()) {
            if (!entity.active) continue;

            let hasAll = true;
            for (const name of componentNames) {
                if (!entity.hasComponent(name)) {
                    hasAll = false;
                    break;
                }
            }

            if (hasAll) {
                result.push(entity);
            }
        }
        return result;
    }

    getEntitiesByType(type) {
        const result = [];
        for (const entity of this.entities.values()) {
            if (entity.active && entity.type === type) {
                result.push(entity);
            }
        }
        return result;
    }

    update(deltaTime) {
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }

    clear(scene) {
        for (const entity of this.entities.values()) {
            if (entity.mesh) {
                scene.remove(entity.mesh);
                if (entity.mesh.geometry) entity.mesh.geometry.dispose();
                if (entity.mesh.material) {
                    if (Array.isArray(entity.mesh.material)) {
                        entity.mesh.material.forEach(m => m.dispose());
                    } else {
                        entity.mesh.material.dispose();
                    }
                }
            }
        }
        this.entities.clear();
        this.pendingRemovals = [];
    }
}

/**
 * Component Definitions
 */
export const Components = {
    Transform: (x = 0, y = 0, z = 0, rotation = 0) => ({
        x, y, z, rotation
    }),

    Health: (maxHealth, currentHealth = null) => ({
        max: maxHealth,
        current: currentHealth ?? maxHealth
    }),

    Plant: (plantType, config) => ({
        type: plantType,
        config: config,
        lastAction: 0
    }),

    Zombie: (zombieType, config, row) => ({
        type: zombieType,
        config: config,
        row: row,
        state: 'walk', // walk, attack, die
        target: null,
        lastAttack: 0
    }),

    Shooter: (fireRate, damage, projectileSpeed) => ({
        fireRate: fireRate,
        damage: damage,
        projectileSpeed: projectileSpeed,
        lastShot: 0
    }),

    SunProducer: (interval, value) => ({
        interval: interval,
        value: value,
        lastProduced: 0
    }),

    Projectile: (damage, speed, direction) => ({
        damage: damage,
        speed: speed,
        direction: direction
    }),

    Explosive: (radius, damage, timer = 0) => ({
        radius: radius,
        damage: damage,
        timer: timer,
        exploded: false
    }),

    Collectable: (type, value) => ({
        type: type,
        value: value,
        collected: false,
        floatOffset: Math.random() * Math.PI * 2
    }),

    GridCell: (row, col) => ({
        row: row,
        col: col,
        occupied: false,
        plant: null
    }),

    Animation: (animationType, speed = 1) => ({
        type: animationType,
        speed: speed,
        time: 0
    })
};
