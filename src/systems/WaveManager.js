/**
 * Wave Manager - Handles zombie wave spawning and progression
 */
import * as THREE from 'three';
import { GAME_CONFIG, ENTITY_TYPES } from '../Constants.js';
import { Components } from '../engine/ECS.js';

export class WaveManager {
    constructor(world, scene, modelGenerator, gridSystem) {
        this.world = world;
        this.scene = scene;
        this.modelGenerator = modelGenerator;
        this.gridSystem = gridSystem;

        // Wave state
        this.currentWave = 0;
        this.waveStartTime = 0;
        this.waveActive = false;
        this.spawnTimers = [];
        this.zombiesSpawned = 0;
        this.totalZombiesInWave = 0;
        this.allWavesComplete = false;

        // Spawn position (right side of grid)
        this.spawnX = GAME_CONFIG.GRID.OFFSET_X +
            GAME_CONFIG.GRID.COLS * GAME_CONFIG.GRID.CELL_SIZE + 2;
    }

    startWave(waveNumber = null) {
        if (waveNumber !== null) {
            this.currentWave = waveNumber;
        } else {
            this.currentWave++;
        }

        if (this.currentWave > GAME_CONFIG.WAVES.length) {
            this.allWavesComplete = true;
            return false;
        }

        const waveData = GAME_CONFIG.WAVES[this.currentWave - 1];
        this.waveActive = true;
        this.waveStartTime = performance.now();
        this.zombiesSpawned = 0;
        this.spawnTimers = [];

        // Calculate total zombies
        this.totalZombiesInWave = 0;
        for (const zombieGroup of waveData.zombies) {
            this.totalZombiesInWave += zombieGroup.count;

            // Create spawn schedule for this group
            for (let i = 0; i < zombieGroup.count; i++) {
                this.spawnTimers.push({
                    type: zombieGroup.type,
                    time: waveData.delay + i * zombieGroup.interval,
                    spawned: false
                });
            }
        }

        // Sort by spawn time
        this.spawnTimers.sort((a, b) => a.time - b.time);

        return true;
    }

    update(deltaTime, elapsedTime) {
        if (!this.waveActive || this.allWavesComplete) return;

        const elapsed = performance.now() - this.waveStartTime;

        // Check for zombies to spawn
        for (const timer of this.spawnTimers) {
            if (!timer.spawned && elapsed >= timer.time) {
                this.spawnZombie(timer.type);
                timer.spawned = true;
                this.zombiesSpawned++;
            }
        }
    }

    spawnZombie(type) {
        const config = GAME_CONFIG.ZOMBIES[type.toUpperCase()];
        if (!config) {
            console.error(`Unknown zombie type: ${type}`);
            return;
        }

        // Random row
        const row = Math.floor(Math.random() * GAME_CONFIG.GRID.ROWS);
        const rowZ = GAME_CONFIG.GRID.OFFSET_Z +
            row * GAME_CONFIG.GRID.CELL_SIZE +
            GAME_CONFIG.GRID.CELL_SIZE / 2;

        // Create entity
        const entity = this.world.createEntity(ENTITY_TYPES.ZOMBIE);

        entity.addComponent('Transform', Components.Transform(
            this.spawnX + Math.random() * 2, // Slight variation
            0,
            rowZ
        ));

        entity.addComponent('Health', Components.Health(config.health));

        entity.addComponent('Zombie', Components.Zombie(type, config, row));

        entity.addComponent('Animation', Components.Animation('zombieWalk', 1));

        // Create mesh
        const mesh = this.modelGenerator.createZombie(type);
        mesh.position.set(this.spawnX, 0, rowZ);
        this.scene.add(mesh);
        entity.setMesh(mesh);

        return entity;
    }

    isWaveComplete() {
        if (!this.waveActive) return false;

        // All zombies spawned and none active
        const allSpawned = this.zombiesSpawned >= this.totalZombiesInWave;
        const zombiesRemaining = this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE)
            .filter(z => z.active).length;

        if (allSpawned && zombiesRemaining === 0) {
            this.waveActive = false;
            return true;
        }

        return false;
    }

    hasMoreWaves() {
        return this.currentWave < GAME_CONFIG.WAVES.length;
    }

    getProgress() {
        if (!this.waveActive) return { spawned: 0, total: 0, progress: 0 };

        const zombiesRemaining = this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE)
            .filter(z => z.active).length;
        const zombiesDefeated = this.zombiesSpawned - zombiesRemaining;

        return {
            spawned: this.zombiesSpawned,
            total: this.totalZombiesInWave,
            defeated: zombiesDefeated,
            remaining: zombiesRemaining,
            progress: this.totalZombiesInWave > 0
                ? zombiesDefeated / this.totalZombiesInWave
                : 0
        };
    }

    getCurrentWave() {
        return this.currentWave;
    }

    isAllWavesComplete() {
        return this.allWavesComplete &&
            this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE).filter(z => z.active).length === 0;
    }

    reset() {
        this.currentWave = 0;
        this.waveStartTime = 0;
        this.waveActive = false;
        this.spawnTimers = [];
        this.zombiesSpawned = 0;
        this.totalZombiesInWave = 0;
        this.allWavesComplete = false;
    }
}
