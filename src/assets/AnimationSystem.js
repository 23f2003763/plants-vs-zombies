/**
 * Animation System - Programmatic animations for plants and zombies
 */
import * as THREE from 'three';

export class AnimationSystem {
    constructor() {
        this.animations = new Map();
    }

    // Update all animated entities
    update(entities, deltaTime, elapsedTime) {
        for (const entity of entities) {
            if (!entity.mesh || !entity.hasComponent('Animation')) continue;

            const anim = entity.getComponent('Animation');
            anim.time += deltaTime * anim.speed;

            switch (anim.type) {
                case 'plantIdle':
                    this.animatePlantIdle(entity.mesh, anim.time);
                    break;
                case 'sunflowerIdle':
                    this.animateSunflowerIdle(entity.mesh, anim.time);
                    break;
                case 'zombieWalk':
                    this.animateZombieWalk(entity.mesh, anim.time);
                    break;
                case 'zombieAttack':
                    this.animateZombieAttack(entity.mesh, anim.time);
                    break;
                case 'sunFloat':
                    this.animateSunFloat(entity.mesh, anim.time);
                    break;
                case 'cherryBomb':
                    this.animateCherryBomb(entity.mesh, anim.time);
                    break;
            }
        }
    }

    // Gentle swaying for plants
    animatePlantIdle(mesh, time) {
        mesh.rotation.z = Math.sin(time * 2) * 0.05;
        mesh.rotation.x = Math.sin(time * 1.5 + 0.5) * 0.03;
    }

    // Sunflower head tracking / bobbing
    animateSunflowerIdle(mesh, time) {
        mesh.rotation.z = Math.sin(time * 1.5) * 0.08;
        mesh.position.y = Math.sin(time * 2) * 0.02;
    }

    // Zombie walking animation
    animateZombieWalk(mesh, time) {
        const walkSpeed = 3;
        const armSwing = 0.4;
        const legSwing = 0.5;

        mesh.traverse((child) => {
            if (child.userData.isArm) {
                // Stiff zombie arms swinging slightly
                const isLeft = child.position.x < 0;
                child.rotation.x = -0.5 + Math.sin(time * walkSpeed + (isLeft ? 0 : Math.PI)) * armSwing;
            }
            if (child.userData.isLeg) {
                // Leg walking animation
                const isLeft = child.position.x < 0;
                child.rotation.x = Math.sin(time * walkSpeed + (isLeft ? 0 : Math.PI)) * legSwing;
            }
        });

        // Slight body bob
        mesh.position.y = Math.abs(Math.sin(time * walkSpeed * 2)) * 0.05;
        // Slight body sway
        mesh.rotation.z = Math.sin(time * walkSpeed) * 0.03;
    }

    // Zombie attacking animation
    animateZombieAttack(mesh, time) {
        const attackSpeed = 6;

        mesh.traverse((child) => {
            if (child.userData.isArm) {
                // Arms lunging forward
                child.rotation.x = -0.8 + Math.sin(time * attackSpeed) * 0.3;
            }
        });

        // Lean forward during attack
        mesh.rotation.x = 0.1 + Math.sin(time * attackSpeed) * 0.05;
    }

    // Floating sun animation
    animateSunFloat(mesh, time) {
        mesh.rotation.z = time * 0.5;
        mesh.position.y = Math.sin(time * 2) * 0.1;
    }

    // Cherry bomb fuse sparking
    animateCherryBomb(mesh, time) {
        mesh.traverse((child) => {
            if (child.userData.isSpark) {
                child.scale.setScalar(0.8 + Math.sin(time * 20) * 0.4);
                child.material.emissiveIntensity = 1 + Math.sin(time * 30) * 0.5;
            }
        });

        // Shake before explosion
        mesh.rotation.z = Math.sin(time * 30) * 0.05;
        mesh.rotation.x = Math.sin(time * 25) * 0.05;
    }

    // Shoot animation (recoil)
    animateShoot(mesh) {
        // Quick recoil and return
        const originalZ = mesh.rotation.z;
        mesh.rotation.z -= 0.2;

        setTimeout(() => {
            mesh.rotation.z = originalZ;
        }, 100);
    }

    // Death animation for plant/zombie
    animateDeath(mesh, callback) {
        const startY = mesh.position.y;
        const startScale = mesh.scale.x;
        const duration = 500;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Fall and shrink
            mesh.position.y = startY - progress * 0.5;
            mesh.scale.setScalar(startScale * (1 - progress * 0.5));
            mesh.rotation.z = progress * Math.PI / 4;

            // Fade out
            mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 1 - progress;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        animate();
    }

    // Explosion animation
    animateExplosion(explosionMesh, callback) {
        const duration = 300;
        const startTime = performance.now();
        const maxScale = 2;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Expand and fade
            const scale = progress * maxScale;
            explosionMesh.scale.setScalar(scale);

            explosionMesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 1 - progress;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        animate();
    }

    // Sun collection animation
    animateSunCollect(mesh, targetPosition, callback) {
        const startPos = mesh.position.clone();
        const duration = 300;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);

            mesh.position.lerpVectors(startPos, targetPosition, eased);
            mesh.scale.setScalar(1 - progress * 0.5);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        animate();
    }

    // Plant placement pop-in animation
    animatePlantPlace(mesh) {
        mesh.scale.setScalar(0);
        const targetScale = 1;
        const duration = 200;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Spring effect
            const eased = 1 - Math.pow(1 - progress, 3);
            const overshoot = 1 + 0.2 * Math.sin(progress * Math.PI);

            mesh.scale.setScalar(eased * overshoot * targetScale);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }
}
