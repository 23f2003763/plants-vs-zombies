/**
 * Animation System - Punchy, fast animations for plants and zombies
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

    // Bouncy, energetic swaying for plants
    animatePlantIdle(mesh, time) {
        const bounce = Math.sin(time * 4) * 0.08;
        const sway = Math.sin(time * 3 + 0.5) * 0.06;

        mesh.rotation.z = sway;
        mesh.rotation.x = Math.sin(time * 2.5) * 0.04;
        mesh.position.y = Math.abs(bounce) * 0.5;
    }

    // Sunflower happy bobbing
    animateSunflowerIdle(mesh, time) {
        mesh.rotation.z = Math.sin(time * 3) * 0.12;
        mesh.position.y = Math.sin(time * 4) * 0.05;
        // Slight scale pulse
        const pulse = 1 + Math.sin(time * 5) * 0.03;
        mesh.scale.setScalar(pulse);
    }

    // Fast, aggressive zombie walking
    animateZombieWalk(mesh, time) {
        const walkSpeed = 8; // Much faster animation
        const armSwing = 0.6;
        const legSwing = 0.7;

        mesh.traverse((child) => {
            if (child.userData.isArm) {
                const isLeft = child.position.x < 0;
                // Arms reach forward aggressively
                child.rotation.x = -0.7 + Math.sin(time * walkSpeed + (isLeft ? 0 : Math.PI)) * armSwing;
            }
            if (child.userData.isLeg) {
                const isLeft = child.position.x < 0;
                child.rotation.x = Math.sin(time * walkSpeed + (isLeft ? 0 : Math.PI)) * legSwing;
            }
        });

        // Exaggerated body bob and lurch
        mesh.position.y = Math.abs(Math.sin(time * walkSpeed * 2)) * 0.1;
        mesh.rotation.z = Math.sin(time * walkSpeed) * 0.08;
        mesh.rotation.x = 0.15 + Math.sin(time * walkSpeed * 2) * 0.05; // Lean forward
    }

    // Frantic zombie attacking
    animateZombieAttack(mesh, time) {
        const attackSpeed = 12; // Very fast attack animation

        mesh.traverse((child) => {
            if (child.userData.isArm) {
                // Rapid chomping motion
                child.rotation.x = -1.0 + Math.sin(time * attackSpeed) * 0.5;
            }
        });

        // Aggressive lean forward and shake
        mesh.rotation.x = 0.25 + Math.sin(time * attackSpeed) * 0.1;
        mesh.position.y = Math.abs(Math.sin(time * attackSpeed * 2)) * 0.08;
        mesh.rotation.z = Math.sin(time * attackSpeed * 1.5) * 0.06;
    }

    // Bouncy floating sun
    animateSunFloat(mesh, time) {
        mesh.rotation.z = time * 1.5;
        mesh.rotation.y = time * 0.5;
        mesh.position.y = Math.sin(time * 3) * 0.15;
        // Pulse
        const pulse = 1 + Math.sin(time * 6) * 0.1;
        mesh.scale.setScalar(pulse);
    }

    // Intense cherry bomb shaking
    animateCherryBomb(mesh, time) {
        mesh.traverse((child) => {
            if (child.userData.isSpark) {
                child.scale.setScalar(0.5 + Math.sin(time * 30) * 0.8);
                if (child.material) {
                    child.material.emissiveIntensity = 1 + Math.sin(time * 40) * 1;
                }
            }
        });

        // Intense shaking before explosion
        const intensity = Math.min(time * 0.5, 1);
        mesh.rotation.z = Math.sin(time * 40) * 0.1 * intensity;
        mesh.rotation.x = Math.sin(time * 35) * 0.1 * intensity;
        mesh.position.y = Math.abs(Math.sin(time * 50)) * 0.05 * intensity;
    }

    // Snappy shoot recoil
    animateShoot(mesh) {
        const originalZ = mesh.rotation.z;
        const originalScale = mesh.scale.x;

        // Quick scale punch
        mesh.scale.setScalar(1.2);
        mesh.rotation.z -= 0.3;

        setTimeout(() => {
            mesh.scale.setScalar(originalScale);
            mesh.rotation.z = originalZ;
        }, 80);
    }

    // Fast, dramatic death animation
    animateDeath(mesh, callback) {
        const startY = mesh.position.y;
        const startScale = mesh.scale.x;
        const duration = 350; // Faster death
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out bounce
            const eased = 1 - Math.pow(1 - progress, 3);

            // Fall, spin and shrink dramatically
            mesh.position.y = startY - eased * 0.8;
            mesh.scale.setScalar(startScale * (1 - eased * 0.8));
            mesh.rotation.z = eased * Math.PI / 2;
            mesh.rotation.x = eased * 0.5;

            // Fade out
            mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 1 - eased;
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

    // Punchy explosion animation
    animateExplosion(explosionMesh, callback) {
        const duration = 250; // Faster explosion
        const startTime = performance.now();
        const maxScale = 2.5;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Elastic ease out for pop effect
            const eased = 1 - Math.pow(1 - progress, 4);

            // Rapid expand and fade
            const scale = eased * maxScale;
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

    // Zippy sun collection
    animateSunCollect(mesh, targetPosition, callback) {
        const startPos = mesh.position.clone();
        const duration = 200; // Very fast collection
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Quick ease out
            const eased = 1 - Math.pow(1 - progress, 4);

            mesh.position.lerpVectors(startPos, targetPosition, eased);
            mesh.scale.setScalar((1 - progress * 0.7) * (1 + Math.sin(progress * Math.PI) * 0.3));
            mesh.rotation.z += 0.3;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        animate();
    }

    // Bouncy plant placement pop-in
    animatePlantPlace(mesh) {
        mesh.scale.setScalar(0);
        mesh.position.y = -0.5;
        const targetScale = 1;
        const duration = 150; // Snappy placement
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Elastic bounce
            const elastic = 1 - Math.pow(1 - progress, 3);
            const overshoot = 1 + 0.3 * Math.sin(progress * Math.PI * 1.5);

            mesh.scale.setScalar(elastic * overshoot * targetScale);
            mesh.position.y = (1 - elastic) * -0.3;
            mesh.rotation.z = (1 - elastic) * 0.5;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // Hit flash effect
    animateHit(mesh) {
        const originalMaterials = [];

        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                originalMaterials.push({
                    mesh: child,
                    color: child.material.color.clone()
                });
                child.material.color.setHex(0xFFFFFF);
            }
        });

        setTimeout(() => {
            for (const data of originalMaterials) {
                data.mesh.material.color.copy(data.color);
            }
        }, 50);
    }
}
