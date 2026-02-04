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

        // Callback for zombie kills
        this.onZombieKill = null;

        // Object pools
        this.projectilePool = [];
        this.maxProjectiles = 200;  // Large pool for machine gun fire

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

        // Visual feedback - flash red (only if not already flashing)
        if (zombie.mesh && !zombie.mesh.userData.isFlashing) {
            zombie.mesh.userData.isFlashing = true;

            // Store original colors if not already stored
            if (!zombie.mesh.userData.originalColors) {
                zombie.mesh.userData.originalColors = new Map();
                zombie.mesh.traverse((child) => {
                    if (child.isMesh && child.material) {
                        // Clone material to avoid affecting other zombies
                        child.material = child.material.clone();
                        zombie.mesh.userData.originalColors.set(child.uuid, child.material.color.getHex());
                    }
                });
            }

            // Flash red
            zombie.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color.setHex(0xFF0000);
                }
            });

            // Restore original colors after 80ms
            setTimeout(() => {
                if (zombie.mesh && zombie.mesh.userData.originalColors) {
                    zombie.mesh.traverse((child) => {
                        if (child.isMesh && child.material && zombie.mesh.userData.originalColors.has(child.uuid)) {
                            child.material.color.setHex(zombie.mesh.userData.originalColors.get(child.uuid));
                        }
                    });
                }
                if (zombie.mesh) {
                    zombie.mesh.userData.isFlashing = false;
                }
            }, 80);
        }

        // Check death
        if (health.current <= 0) {
            this.killZombie(zombie);
        }
    }

    killZombie(zombie) {
        const zombieData = zombie.getComponent('Zombie');
        const transform = zombie.getComponent('Transform');
        zombieData.state = 'die';

        // Award 100 sun for killing zombie
        if (this.onZombieKill) {
            this.onZombieKill(100);
        }

        // Play death sound
        if (this.audioManager) {
            this.audioManager.playSound('zombieDeath');
        }

        // Create blood explosion with body parts
        if (zombie.mesh) {
            this.createZombieDeathExplosion(zombie.mesh.position.clone());
        }

        // Quick fade and remove
        if (zombie.mesh) {
            // Hide original zombie immediately
            zombie.mesh.visible = false;
        }

        zombie.destroy();
        this.world.removeEntity(zombie);
    }

    createZombieDeathExplosion(position) {
        // Create multiple blood/body part particles
        const particleCount = 15;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            // Mix of blood splats and body parts
            const isBodyPart = i < 5;
            let geometry, material;

            if (isBodyPart) {
                // Body parts - boxes
                geometry = new THREE.BoxGeometry(
                    0.1 + Math.random() * 0.15,
                    0.1 + Math.random() * 0.15,
                    0.1 + Math.random() * 0.1
                );
                material = new THREE.MeshBasicMaterial({
                    color: i < 2 ? 0x7CB342 : 0x5D4037 // Green skin or brown clothes
                });
            } else {
                // Blood splats - small spheres
                geometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.08, 6, 4);
                material = new THREE.MeshBasicMaterial({
                    color: 0x8B0000 // Dark red blood
                });
            }

            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            particle.position.y += 0.5 + Math.random() * 0.5;

            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                3 + Math.random() * 5,
                (Math.random() - 0.5) * 8
            );

            particle.userData.velocity = velocity;
            particle.userData.rotationSpeed = new THREE.Vector3(
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10
            );

            this.scene.add(particle);
            particles.push(particle);
        }

        // Create ground blood splatter
        const bloodSplat = new THREE.Mesh(
            new THREE.CircleGeometry(0.5 + Math.random() * 0.3, 8),
            new THREE.MeshBasicMaterial({
                color: 0x8B0000,
                transparent: true,
                opacity: 0.8
            })
        );
        bloodSplat.rotation.x = -Math.PI / 2;
        bloodSplat.position.copy(position);
        bloodSplat.position.y = 0.02;
        this.scene.add(bloodSplat);

        // Animate particles
        const gravity = -15;
        const startTime = performance.now();
        const duration = 1500; // 1.5 seconds

        const animateParticles = () => {
            const elapsed = performance.now() - startTime;
            const dt = 0.016; // ~60fps

            if (elapsed > duration) {
                // Clean up
                particles.forEach(p => {
                    this.scene.remove(p);
                    p.geometry.dispose();
                    p.material.dispose();
                });
                // Fade blood splat
                setTimeout(() => {
                    this.scene.remove(bloodSplat);
                    bloodSplat.geometry.dispose();
                    bloodSplat.material.dispose();
                }, 3000);
                return;
            }

            particles.forEach(particle => {
                // Apply gravity
                particle.userData.velocity.y += gravity * dt;

                // Move
                particle.position.x += particle.userData.velocity.x * dt;
                particle.position.y += particle.userData.velocity.y * dt;
                particle.position.z += particle.userData.velocity.z * dt;

                // Rotate
                particle.rotation.x += particle.userData.rotationSpeed.x * dt;
                particle.rotation.y += particle.userData.rotationSpeed.y * dt;
                particle.rotation.z += particle.userData.rotationSpeed.z * dt;

                // Bounce on ground
                if (particle.position.y < 0.1) {
                    particle.position.y = 0.1;
                    particle.userData.velocity.y *= -0.3;
                    particle.userData.velocity.x *= 0.7;
                    particle.userData.velocity.z *= 0.7;
                }

                // Shrink over time
                const progress = elapsed / duration;
                const scale = 1 - progress * 0.5;
                particle.scale.setScalar(scale);
            });

            requestAnimationFrame(animateParticles);
        };

        requestAnimationFrame(animateParticles);
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
