/**
 * Plant System - Handles plant lifecycle and updates
 */
import * as THREE from 'three';
import { GAME_CONFIG, ENTITY_TYPES } from '../Constants.js';
import { Components } from '../engine/ECS.js';

export class PlantSystem {
    constructor(world, gridSystem, modelGenerator) {
        this.world = world;
        this.gridSystem = gridSystem;
        this.modelGenerator = modelGenerator;
    }

    update(deltaTime) {
        const plants = this.world.getEntitiesByType(ENTITY_TYPES.PLANT);

        for (const plant of plants) {
            if (!plant.active) continue;

            // Handle Lifetime
            if (plant.hasComponent('Lifetime')) {
                const lifetime = plant.getComponent('Lifetime');
                lifetime.remaining -= deltaTime * 1000; // Convert to ms

                // Check expiration
                if (lifetime.remaining <= 0) {
                    this.killPlant(plant);
                    continue;
                }

                // Update Timer Ring
                if (plant.hasComponent('TimerRing')) {
                    this.updateTimerRing(plant, lifetime);
                }
            }
        }
    }

    updateTimerRing(plant, lifetime) {
        const timerRing = plant.getComponent('TimerRing');
        if (timerRing.mesh && timerRing.mesh.material) {
            // Update shader uniform
            const progress = lifetime.remaining / lifetime.total;
            if (timerRing.mesh.material.uniforms) {
                timerRing.mesh.material.uniforms.uProgress.value = progress;

                // Color change based on time (Green -> Red)
                const color = timerRing.mesh.material.uniforms.uColor.value;
                if (progress < 0.3) {
                    color.setHex(0xFF0000); // Red warning
                } else if (progress < 0.6) {
                    color.setHex(0xFFA500); // Orange
                } else {
                    color.setHex(0xFFFFFF); // White/Green
                }
            }
        }
    }

    killPlant(plant) {
        // Free up grid cell
        const row = this.gridSystem.getPlantRow(plant);
        const col = this.gridSystem.getPlantColumn(plant);

        if (row !== -1 && col !== -1) {
            this.gridSystem.removePlant(row, col);
        }

        // Destroy entity
        plant.destroy();
        this.world.removeEntity(plant);
    }
}
