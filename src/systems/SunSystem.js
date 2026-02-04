/**
 * Sun System - Handles sun resource collection and generation
 */
import * as THREE from 'three';
import { GAME_CONFIG, ENTITY_TYPES } from '../Constants.js';
import { Components } from '../engine/ECS.js';

export class SunSystem {
    constructor(world, scene, modelGenerator, animationSystem) {
        this.world = world;
        this.scene = scene;
        this.modelGenerator = modelGenerator;
        this.animationSystem = animationSystem;

        // Sun state
        this.sunAmount = GAME_CONFIG.SUN.STARTING_AMOUNT;
        this.lastNaturalSpawn = 0;

        // Collection target (screen position for UI)
        this.collectTarget = new THREE.Vector3(-5, 3, 0);

        // Callbacks
        this.onSunChange = null;

        // Sun pool
        this.sunPool = [];
        this.maxSuns = 20;
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.maxSuns; i++) {
            const mesh = this.modelGenerator.createSun();
            mesh.visible = false;
            this.scene.add(mesh);
            this.sunPool.push(mesh);
        }
    }

    getSunFromPool() {
        for (const mesh of this.sunPool) {
            if (!mesh.visible) {
                mesh.visible = true;
                mesh.scale.setScalar(1);
                return mesh;
            }
        }
        return null;
    }

    returnSunToPool(mesh) {
        mesh.visible = false;
    }

    update(deltaTime, elapsedTime) {
        // Natural sun spawning
        const timeSinceSpawn = elapsedTime * 1000 - this.lastNaturalSpawn;
        if (timeSinceSpawn >= GAME_CONFIG.SUN.NATURAL_SPAWN_INTERVAL) {
            this.spawnNaturalSun();
            this.lastNaturalSpawn = elapsedTime * 1000;
        }

        // Update sunflower production
        this.updateSunflowers(elapsedTime);

        // Update floating suns
        this.updateSuns(deltaTime, elapsedTime);
    }

    updateSunflowers(elapsedTime) {
        const plants = this.world.getEntitiesByType(ENTITY_TYPES.PLANT);

        for (const plant of plants) {
            if (!plant.active || !plant.hasComponent('SunProducer')) continue;

            const producer = plant.getComponent('SunProducer');
            const transform = plant.getComponent('Transform');

            const timeSinceProduced = elapsedTime * 1000 - producer.lastProduced;
            if (timeSinceProduced >= producer.interval) {
                this.spawnSun(
                    transform.x + (Math.random() - 0.5) * 0.5,
                    1.5,
                    transform.z + (Math.random() - 0.5) * 0.5,
                    producer.value
                );
                producer.lastProduced = elapsedTime * 1000;
            }
        }
    }

    spawnNaturalSun() {
        // Random position above the grid
        const x = GAME_CONFIG.GRID.OFFSET_X +
            Math.random() * (GAME_CONFIG.GRID.COLS * GAME_CONFIG.GRID.CELL_SIZE);
        const z = GAME_CONFIG.GRID.OFFSET_Z +
            Math.random() * (GAME_CONFIG.GRID.ROWS * GAME_CONFIG.GRID.CELL_SIZE);

        this.spawnSun(x, 5, z, GAME_CONFIG.SUN.NATURAL_SUN_VALUE, true);
    }

    spawnSun(x, y, z, value, falling = false) {
        const mesh = this.getSunFromPool();
        if (!mesh) return null;

        mesh.position.set(x, y, z);

        const entity = this.world.createEntity(ENTITY_TYPES.SUN);
        entity.addComponent('Transform', Components.Transform(x, y, z));
        entity.addComponent('Collectable', Components.Collectable('sun', value));
        entity.addComponent('Animation', Components.Animation('sunFloat', 1));
        entity.setMesh(mesh);

        // If falling, animate down
        if (falling) {
            const targetY = 0.5 + Math.random() * 0.5;
            this.animateFall(entity, targetY);
        }

        return entity;
    }

    animateFall(entity, targetY) {
        const transform = entity.getComponent('Transform');
        const startY = transform.y;
        const duration = 2000;
        const startTime = performance.now();

        const animate = () => {
            if (!entity.active) return;

            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out
            const eased = 1 - Math.pow(1 - progress, 2);
            transform.y = startY + (targetY - startY) * eased;

            if (entity.mesh) {
                entity.mesh.position.y = transform.y;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateSuns(deltaTime, elapsedTime) {
        const suns = this.world.getEntitiesByType(ENTITY_TYPES.SUN);

        for (const sun of suns) {
            if (!sun.active) continue;

            const collectable = sun.getComponent('Collectable');
            const transform = sun.getComponent('Transform');
            const animation = sun.getComponent('Animation');

            // Update animation
            animation.time += deltaTime;

            if (sun.mesh) {
                // Floating animation
                sun.mesh.position.y = transform.y + Math.sin(animation.time * 2) * 0.1;
                sun.mesh.rotation.z = animation.time * 0.5;
            }

            // Auto-decay after 10 seconds
            if (animation.time > 10 && !collectable.collected) {
                this.removeSun(sun);
            }
        }
    }

    tryCollectSun(worldPos) {
        const suns = this.world.getEntitiesByType(ENTITY_TYPES.SUN);

        for (const sun of suns) {
            if (!sun.active) continue;

            const transform = sun.getComponent('Transform');
            const collectable = sun.getComponent('Collectable');

            if (collectable.collected) continue;

            const dx = worldPos.x - transform.x;
            const dy = worldPos.y - transform.y;
            const dz = worldPos.z - transform.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Larger collection radius for easier clicking
            if (dist < 1.8) {
                this.collectSun(sun);
                return true;
            }
        }

        return false;
    }

    addSun(amount) {
        this.sunAmount += amount;
        if (this.onSunChange) {
            this.onSunChange(this.sunAmount);
        }
    }

    collectSun(sunEntity) {
        const collectable = sunEntity.getComponent('Collectable');
        if (collectable.collected) return;

        collectable.collected = true;

        // Add sun
        this.addSun(collectable.value);

        // Play sound
        if (this.world && this.world.systems) {
            // Try to find audio manager if not directly available (optional safety)
        }

        // Animate collection
        if (this.animationSystem && sunEntity.mesh) {
            this.animationSystem.animateSunCollect(sunEntity.mesh, this.collectTarget, () => {
                this.removeSun(sunEntity);
            });
        } else {
            this.removeSun(sunEntity);
        }
    }

    removeSun(sun) {
        if (sun.mesh) {
            this.returnSunToPool(sun.mesh);
            sun.mesh = null; // Important: prevent World from removing pooled mesh from scene
        }
        sun.destroy();
        this.world.removeEntity(sun);
    }

    addSun(amount) {
        this.sunAmount += amount;
        if (this.onSunChange) {
            this.onSunChange(this.sunAmount);
        }
    }

    spendSun(amount) {
        if (this.sunAmount >= amount) {
            this.sunAmount -= amount;
            if (this.onSunChange) {
                this.onSunChange(this.sunAmount);
            }
            return true;
        }
        return false;
    }

    canAfford(amount) {
        return this.sunAmount >= amount;
    }

    getSunAmount() {
        return this.sunAmount;
    }

    reset() {
        this.sunAmount = GAME_CONFIG.SUN.STARTING_AMOUNT;
        this.lastNaturalSpawn = 0;

        // Clear all suns
        const suns = this.world.getEntitiesByType(ENTITY_TYPES.SUN);
        for (const sun of suns) {
            if (sun.mesh) {
                this.returnSunToPool(sun.mesh);
            }
            sun.destroy();
        }

        if (this.onSunChange) {
            this.onSunChange(this.sunAmount);
        }
    }
}
