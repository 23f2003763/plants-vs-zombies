/**
 * Zombie AI System - State machine for zombie behavior
 */
import * as THREE from 'three';
import { GAME_CONFIG, ENTITY_TYPES } from '../Constants.js';

export class ZombieAI {
    constructor(world, gridSystem, combatSystem) {
        this.world = world;
        this.gridSystem = gridSystem;
        this.combatSystem = combatSystem;
    }

    update(deltaTime, elapsedTime) {
        const zombies = this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE);

        for (const zombie of zombies) {
            if (!zombie.active) continue;

            const zombieData = zombie.getComponent('Zombie');
            const transform = zombie.getComponent('Transform');
            const animation = zombie.getComponent('Animation');

            // Ensure state exists
            if (!zombieData.state) {
                zombieData.state = 'walk';
            }

            switch (zombieData.state) {
                case 'walk':
                    this.handleWalkState(zombie, zombieData, transform, animation, deltaTime, elapsedTime);
                    break;
                case 'attack':
                    this.handleAttackState(zombie, zombieData, transform, animation, deltaTime, elapsedTime);
                    break;
                case 'die':
                    // Death is handled by combat system
                    break;
                default:
                    // Unknown state, reset to walk
                    zombieData.state = 'walk';
                    break;
            }

            // Update mesh position
            if (zombie.mesh) {
                zombie.mesh.position.x = transform.x;
                zombie.mesh.position.z = transform.z;
            }
        }
    }

    handleWalkState(zombie, zombieData, transform, animation, deltaTime, elapsedTime) {
        const config = zombieData.config;

        // Safety check for config
        if (!config || typeof config.speed !== 'number') {
            console.error('Invalid zombie config:', config);
            return;
        }

        // Check for plant collision
        const plantsInRow = this.gridSystem.getPlantsInRow(zombieData.row);
        let blockedByPlant = null;

        for (const { col, entity } of plantsInRow) {
            // Make sure entity is still active
            if (!entity || !entity.active) continue;

            const plantPos = this.gridSystem.gridToWorld(zombieData.row, col);
            if (Math.abs(transform.x - plantPos.x) < 0.6 && transform.x > plantPos.x - 0.4) {
                blockedByPlant = entity;
                break;
            }
        }

        if (blockedByPlant && blockedByPlant.active) {
            // Start attacking
            zombieData.state = 'attack';
            zombieData.target = blockedByPlant;
            zombieData.lastAttack = elapsedTime * 1000;
            animation.type = 'zombieAttack';
        } else {
            // Keep walking - speed is units per second
            const moveAmount = config.speed * deltaTime;
            transform.x -= moveAmount;
            animation.type = 'zombieWalk';

            // Check if zombie reached the house (game over condition)
            if (transform.x < GAME_CONFIG.GRID.OFFSET_X - 1) {
                // Mark for game over check
                zombieData.reachedHouse = true;
            }
        }
    }

    handleAttackState(zombie, zombieData, transform, animation, deltaTime, elapsedTime) {
        const config = zombieData.config;
        const target = zombieData.target;

        // Check if target still exists
        if (!target || !target.active) {
            zombieData.state = 'walk';
            zombieData.target = null;
            animation.type = 'zombieWalk';
            return;
        }

        // Attack timing
        const timeSinceAttack = elapsedTime * 1000 - zombieData.lastAttack;
        if (timeSinceAttack >= config.attackSpeed) {
            // Deal damage
            this.combatSystem.damagePlant(target, config.damage, this.gridSystem);
            zombieData.lastAttack = elapsedTime * 1000;
        }

        // Check if target died
        if (!target.active) {
            zombieData.state = 'walk';
            zombieData.target = null;
            animation.type = 'zombieWalk';
        }
    }

    hasZombieReachedHouse() {
        const zombies = this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE);
        for (const zombie of zombies) {
            if (!zombie.active) continue;
            const zombieData = zombie.getComponent('Zombie');
            if (zombieData.reachedHouse) {
                return true;
            }
        }
        return false;
    }

    getActiveZombieCount() {
        return this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE)
            .filter(z => z.active).length;
    }
}
