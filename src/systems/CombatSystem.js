/**
 * Combat System - Handles projectiles, damage, and combat interactions
 */
import * as THREE from 'three';
import { GAME_CONFIG, ENTITY_TYPES } from '../Constants.js';
import { Components } from '../engine/ECS.js';

export class CombatSystem {
    constructor(world, scene, modelGenerator, animationSystem, audioManager) {
        this.world = world;
        this.scene = scene;
        this.modelGenerator = modelGenerator;
        this.animationSystem = animationSystem;
        this.audioManager = audioManager;

        // Object pools
        this.projectilePool = [];
        this.maxProjectiles = 50;

        // Pre-create projectile pool
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.maxProjectiles; i++) {
            const mesh = this.modelGenerator.createProjectile();
            mesh.visible = false;
            this.scene.add(mesh);
            this.projectilePool.push(mesh);
        }
    }

    getProjectileFromPool() {
        for (const mesh of this.projectilePool) {
            if (!mesh.visible) {
                mesh.visible = true;
                return mesh;
            }
        }
        return null;
    }

    returnProjectileToPool(mesh) {
        mesh.visible = false;
    }

    update(deltaTime, elapsedTime, gridSystem) {
        // Update shooters
        this.updateShooters(elapsedTime, gridSystem);

        // Update projectiles
        this.updateProjectiles(deltaTime);

        // Check explosives
        this.updateExplosives(deltaTime, gridSystem);
    }

    updateShooters(elapsedTime, gridSystem) {
        const plants = this.world.getEntitiesByType(ENTITY_TYPES.PLANT);
        const zombies = this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE);

        for (const plant of plants) {
            if (!plant.active || !plant.hasComponent('Shooter')) continue;

            const shooter = plant.getComponent('Shooter');
            const plantData = plant.getComponent('Plant');
            const transform = plant.getComponent('Transform');

            // Check if there's a zombie in this row
            const row = gridSystem.getPlantRow(plant);
            if (row === -1) continue;

            const hasTarget = zombies.some(zombie => {
                if (!zombie.active) return false;
                const zombieData = zombie.getComponent('Zombie');
                return zombieData.row === row && zombie.mesh.position.x > transform.x;
            });

            if (hasTarget) {
                const timeSinceShot = elapsedTime * 1000 - shooter.lastShot;
                if (timeSinceShot >= shooter.fireRate) {
                    this.fireProjectile(plant, shooter);
                    shooter.lastShot = elapsedTime * 1000;

                    // Play sound
                    if (this.audioManager) {
                        this.audioManager.playSound('shoot');
                    }
                }
            }
        }
    }

    fireProjectile(plant, shooter) {
        const transform = plant.getComponent('Transform');

        const mesh = this.getProjectileFromPool();
        if (!mesh) return;

        mesh.position.set(transform.x + 0.4, 0.5, transform.z);

        const entity = this.world.createEntity(ENTITY_TYPES.PROJECTILE);
        entity.addComponent('Transform', Components.Transform(
            transform.x + 0.4,
            0.5,
            transform.z
        ));
        entity.addComponent('Projectile', Components.Projectile(
            shooter.damage,
            GAME_CONFIG.PROJECTILE.SPEED,
            new THREE.Vector3(1, 0, 0)
        ));
        entity.setMesh(mesh);

        // Shooting animation
        if (this.animationSystem && plant.mesh) {
            this.animationSystem.animateShoot(plant.mesh);
        }
    }

    updateProjectiles(deltaTime) {
        const projectiles = this.world.getEntitiesByType(ENTITY_TYPES.PROJECTILE);
        const zombies = this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE);

        for (const projectile of projectiles) {
            if (!projectile.active) continue;

            const proj = projectile.getComponent('Projectile');
            const transform = projectile.getComponent('Transform');

            // Move projectile
            transform.x += proj.direction.x * proj.speed * deltaTime;
            projectile.mesh.position.x = transform.x;

            // Check bounds
            if (transform.x > 10) {
                this.removeProjectile(projectile);
                continue;
            }

            // Check collision with zombies
            for (const zombie of zombies) {
                if (!zombie.active) continue;

                const zombieTransform = zombie.getComponent('Transform');
                const dx = transform.x - zombieTransform.x;
                const dz = transform.z - zombieTransform.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist < 0.5) {
                    // Hit!
                    this.damageZombie(zombie, proj.damage);
                    this.removeProjectile(projectile);

                    // Play hit sound
                    if (this.audioManager) {
                        this.audioManager.playSound('hit');
                    }
                    break;
                }
            }
        }
    }

    updateExplosives(deltaTime, gridSystem) {
        const plants = this.world.getEntitiesByType(ENTITY_TYPES.PLANT);
        const zombies = this.world.getEntitiesByType(ENTITY_TYPES.ZOMBIE);

        for (const plant of plants) {
            if (!plant.active || !plant.hasComponent('Explosive')) continue;

            const explosive = plant.getComponent('Explosive');

            // Increment timer
            explosive.timer += deltaTime;

            // Explode after short delay (when planted)
            if (explosive.timer >= 1.0 && !explosive.exploded) {
                this.explode(plant, explosive, zombies, gridSystem);
            }
        }
    }

    explode(plant, explosive, zombies, gridSystem) {
        explosive.exploded = true;
        const transform = plant.getComponent('Transform');

        // Create explosion effect
        const explosion = this.modelGenerator.createExplosion();
        explosion.position.set(transform.x, 0.5, transform.z);
        this.scene.add(explosion);

        // Damage zombies in radius
        for (const zombie of zombies) {
            if (!zombie.active) continue;

            const zombieTransform = zombie.getComponent('Transform');
            const dx = transform.x - zombieTransform.x;
            const dz = transform.z - zombieTransform.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist <= explosive.radius * GAME_CONFIG.GRID.CELL_SIZE) {
                this.damageZombie(zombie, explosive.damage);
            }
        }

        // Play explosion sound
        if (this.audioManager) {
            this.audioManager.playSound('explosion');
        }

        // Animate explosion and remove
        this.animationSystem.animateExplosion(explosion, () => {
            this.scene.remove(explosion);
        });

        // Remove plant from grid
        const row = gridSystem.getPlantRow(plant);
        const col = gridSystem.getPlantColumn(plant);
        if (row !== -1 && col !== -1) {
            gridSystem.removePlant(row, col);
        }

        // Remove plant entity
        plant.destroy();
        this.world.removeEntity(plant);
    }

    damageZombie(zombie, damage) {
        const health = zombie.getComponent('Health');
        health.current -= damage;

        // Visual feedback - flash red
        if (zombie.mesh) {
            zombie.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    const originalColor = child.material.color.getHex();
                    child.material.color.setHex(0xFF0000);
                    setTimeout(() => {
                        child.material.color.setHex(originalColor);
                    }, 100);
                }
            });
        }

        // Check death
        if (health.current <= 0) {
            this.killZombie(zombie);
        }
    }

    killZombie(zombie) {
        const zombieData = zombie.getComponent('Zombie');
        zombieData.state = 'die';

        // Play death sound
        if (this.audioManager) {
            this.audioManager.playSound('zombieDeath');
        }

        // Death animation
        if (this.animationSystem && zombie.mesh) {
            this.animationSystem.animateDeath(zombie.mesh, () => {
                zombie.destroy();
                this.world.removeEntity(zombie);
            });
        } else {
            zombie.destroy();
            this.world.removeEntity(zombie);
        }
    }

    damagePlant(plant, damage, gridSystem) {
        const health = plant.getComponent('Health');
        health.current -= damage;

        // Visual feedback
        if (plant.mesh) {
            plant.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    const originalColor = child.material.color.getHex();
                    child.material.color.setHex(0xFF8888);
                    setTimeout(() => {
                        child.material.color.setHex(originalColor);
                    }, 100);
                }
            });
        }

        // Check death
        if (health.current <= 0) {
            this.killPlant(plant, gridSystem);
        }
    }

    killPlant(plant, gridSystem) {
        // Remove from grid
        const row = gridSystem.getPlantRow(plant);
        const col = gridSystem.getPlantColumn(plant);
        if (row !== -1 && col !== -1) {
            gridSystem.removePlant(row, col);
        }

        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('plantDeath');
        }

        // Death animation
        if (this.animationSystem && plant.mesh) {
            this.animationSystem.animateDeath(plant.mesh, () => {
                plant.destroy();
                this.world.removeEntity(plant);
            });
        } else {
            plant.destroy();
            this.world.removeEntity(plant);
        }
    }

    removeProjectile(projectile) {
        this.returnProjectileToPool(projectile.mesh);
        projectile.destroy();
        this.world.removeEntity(projectile);
    }

    clear() {
        // Return all projectiles to pool
        const projectiles = this.world.getEntitiesByType(ENTITY_TYPES.PROJECTILE);
        for (const p of projectiles) {
            if (p.mesh) {
                this.returnProjectileToPool(p.mesh);
            }
        }
    }
}
