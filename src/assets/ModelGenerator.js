/**
 * Procedural Model Generator - Creates all game models
 * Roblox-style blocky characters and plants
 */
import * as THREE from 'three';
import { GAME_CONFIG } from '../Constants.js';

export class ModelGenerator {
    constructor() {
        // Shared materials cache
        this.materials = new Map();
    }

    getMaterial(color, options = {}) {
        const key = `${color}-${JSON.stringify(options)}`;
        if (!this.materials.has(key)) {
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: options.roughness ?? 0.7,
                metalness: options.metalness ?? 0.0,
                flatShading: options.flatShading ?? true,
                ...options
            });
            this.materials.set(key, material);
        }
        return this.materials.get(key);
    }

    // ==========================================
    // PLANT MODELS
    // ==========================================

    createPeashooter() {
        const group = new THREE.Group();

        // Stem
        const stemGeom = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
        const stemMat = this.getMaterial(0x2E7D32);
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = 0.25;
        stem.castShadow = true;
        group.add(stem);

        // Head (sphere)
        const headGeom = new THREE.SphereGeometry(0.35, 12, 8);
        const headMat = this.getMaterial(0x4CAF50);
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 0.6;
        head.castShadow = true;
        group.add(head);

        // Mouth (cylinder for shooter tube)
        const mouthGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.25, 8);
        const mouth = new THREE.Mesh(mouthGeom, stemMat);
        mouth.rotation.x = Math.PI / 2;
        mouth.position.set(0, 0.6, 0.35);
        mouth.castShadow = true;
        group.add(mouth);

        // Eyes
        const eyeGeom = new THREE.SphereGeometry(0.08, 8, 6);
        const eyeWhite = this.getMaterial(0xFFFFFF);
        const eyeBlack = this.getMaterial(0x000000);

        const leftEye = new THREE.Mesh(eyeGeom, eyeWhite);
        leftEye.position.set(-0.12, 0.7, 0.28);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeom, eyeWhite);
        rightEye.position.set(0.12, 0.7, 0.28);
        group.add(rightEye);

        const pupilGeom = new THREE.SphereGeometry(0.04, 6, 4);
        const leftPupil = new THREE.Mesh(pupilGeom, eyeBlack);
        leftPupil.position.set(-0.12, 0.7, 0.34);
        group.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeom, eyeBlack);
        rightPupil.position.set(0.12, 0.7, 0.34);
        group.add(rightPupil);

        // Leaves at base
        const leafGeom = new THREE.SphereGeometry(0.15, 6, 4);
        leafGeom.scale(1, 0.3, 1.5);
        const leafMat = this.getMaterial(0x388E3C);

        for (let i = 0; i < 3; i++) {
            const leaf = new THREE.Mesh(leafGeom, leafMat);
            const angle = (i / 3) * Math.PI * 2;
            leaf.position.set(Math.cos(angle) * 0.2, 0.1, Math.sin(angle) * 0.2);
            leaf.rotation.y = angle;
            leaf.castShadow = true;
            group.add(leaf);
        }

        group.userData.type = 'peashooter';
        return group;
    }

    createSunflower() {
        const group = new THREE.Group();

        // Stem
        const stemGeom = new THREE.CylinderGeometry(0.1, 0.15, 0.6, 8);
        const stemMat = this.getMaterial(0x2E7D32);
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = 0.3;
        stem.castShadow = true;
        group.add(stem);

        // Flower center
        const centerGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12);
        const centerMat = this.getMaterial(0x8B4513);
        const center = new THREE.Mesh(centerGeom, centerMat);
        center.position.y = 0.7;
        center.rotation.x = -Math.PI / 8;
        center.castShadow = true;
        group.add(center);

        // Petals
        const petalGeom = new THREE.SphereGeometry(0.12, 6, 4);
        petalGeom.scale(0.8, 0.3, 1.2);
        const petalMat = this.getMaterial(0xFFD700);

        for (let i = 0; i < 10; i++) {
            const petal = new THREE.Mesh(petalGeom, petalMat);
            const angle = (i / 10) * Math.PI * 2;
            const radius = 0.35;
            petal.position.set(
                Math.cos(angle) * radius,
                0.7,
                Math.sin(angle) * radius * 0.3 + 0.1
            );
            petal.rotation.y = angle;
            petal.rotation.x = -Math.PI / 8;
            petal.castShadow = true;
            group.add(petal);
        }

        // Happy face
        const eyeGeom = new THREE.SphereGeometry(0.05, 6, 4);
        const eyeMat = this.getMaterial(0x000000);

        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.08, 0.75, 0.18);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.08, 0.75, 0.18);
        group.add(rightEye);

        // Smile
        const smileGeom = new THREE.TorusGeometry(0.08, 0.02, 4, 8, Math.PI);
        const smile = new THREE.Mesh(smileGeom, eyeMat);
        smile.position.set(0, 0.65, 0.2);
        smile.rotation.x = Math.PI;
        group.add(smile);

        // Leaves
        const leafGeom = new THREE.SphereGeometry(0.12, 6, 4);
        leafGeom.scale(1, 0.3, 1.5);
        const leafMat = this.getMaterial(0x388E3C);

        const leaf1 = new THREE.Mesh(leafGeom, leafMat);
        leaf1.position.set(-0.2, 0.35, 0);
        leaf1.rotation.z = 0.5;
        group.add(leaf1);

        const leaf2 = new THREE.Mesh(leafGeom, leafMat);
        leaf2.position.set(0.2, 0.25, 0);
        leaf2.rotation.z = -0.5;
        group.add(leaf2);

        group.userData.type = 'sunflower';
        return group;
    }

    createWallnut() {
        const group = new THREE.Group();

        // Main body (rough sphere)
        const bodyGeom = new THREE.SphereGeometry(0.4, 8, 6);
        const bodyMat = this.getMaterial(0x8B4513, { roughness: 0.9 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.4;
        body.scale.set(1, 0.9, 0.8);
        body.castShadow = true;
        group.add(body);

        // Shell texture bumps
        const bumpGeom = new THREE.SphereGeometry(0.08, 4, 3);
        const bumpMat = this.getMaterial(0x6D3610);

        for (let i = 0; i < 8; i++) {
            const bump = new THREE.Mesh(bumpGeom, bumpMat);
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * Math.PI * 2;
            bump.position.set(
                Math.sin(theta) * Math.cos(phi) * 0.35,
                0.4 + Math.cos(theta) * 0.35,
                Math.sin(theta) * Math.sin(phi) * 0.3
            );
            bump.castShadow = true;
            group.add(bump);
        }

        // Face
        const eyeGeom = new THREE.SphereGeometry(0.06, 6, 4);
        const eyeMat = this.getMaterial(0x000000);

        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.12, 0.5, 0.32);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.12, 0.5, 0.32);
        group.add(rightEye);

        // Determined expression (eyebrows)
        const browGeom = new THREE.BoxGeometry(0.1, 0.02, 0.02);
        const browMat = this.getMaterial(0x4A2500);

        const leftBrow = new THREE.Mesh(browGeom, browMat);
        leftBrow.position.set(-0.12, 0.58, 0.34);
        leftBrow.rotation.z = 0.3;
        group.add(leftBrow);

        const rightBrow = new THREE.Mesh(browGeom, browMat);
        rightBrow.position.set(0.12, 0.58, 0.34);
        rightBrow.rotation.z = -0.3;
        group.add(rightBrow);

        group.userData.type = 'wallnut';
        return group;
    }

    createCherryBomb() {
        const group = new THREE.Group();

        // Twin cherries
        const cherryGeom = new THREE.SphereGeometry(0.3, 10, 8);
        const cherryMat = this.getMaterial(0xDC143C);

        const leftCherry = new THREE.Mesh(cherryGeom, cherryMat);
        leftCherry.position.set(-0.25, 0.3, 0);
        leftCherry.castShadow = true;
        group.add(leftCherry);

        const rightCherry = new THREE.Mesh(cherryGeom, cherryMat);
        rightCherry.position.set(0.25, 0.35, 0);
        rightCherry.castShadow = true;
        group.add(rightCherry);

        // Stems
        const stemGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
        const stemMat = this.getMaterial(0x2E7D32);

        const leftStem = new THREE.Mesh(stemGeom, stemMat);
        leftStem.position.set(-0.25, 0.55, 0);
        leftStem.rotation.z = 0.2;
        group.add(leftStem);

        const rightStem = new THREE.Mesh(stemGeom, stemMat);
        rightStem.position.set(0.25, 0.6, 0);
        rightStem.rotation.z = -0.2;
        group.add(rightStem);

        // Angry faces
        const eyeGeom = new THREE.SphereGeometry(0.05, 6, 4);
        const eyeMat = this.getMaterial(0x000000);

        // Left cherry face
        const l_leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        l_leftEye.position.set(-0.33, 0.35, 0.25);
        group.add(l_leftEye);

        const l_rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        l_rightEye.position.set(-0.17, 0.35, 0.25);
        group.add(l_rightEye);

        // Right cherry face
        const r_leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        r_leftEye.position.set(0.17, 0.4, 0.25);
        group.add(r_leftEye);

        const r_rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        r_rightEye.position.set(0.33, 0.4, 0.25);
        group.add(r_rightEye);

        // Fuse
        const fuseGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 4);
        const fuseMat = this.getMaterial(0x333333);
        const fuse = new THREE.Mesh(fuseGeom, fuseMat);
        fuse.position.set(0, 0.75, 0);
        group.add(fuse);

        // Spark
        const sparkGeom = new THREE.SphereGeometry(0.04, 6, 4);
        const sparkMat = this.getMaterial(0xFFFF00, { emissive: 0xFFAA00, emissiveIntensity: 2 });
        const spark = new THREE.Mesh(sparkGeom, sparkMat);
        spark.position.set(0, 0.85, 0);
        spark.userData.isSpark = true;
        group.add(spark);

        group.userData.type = 'cherrybomb';
        return group;
    }

    // ==========================================
    // ZOMBIE MODELS (ROBLOX STYLE)
    // ==========================================

    createZombie(type = 'basic') {
        const group = new THREE.Group();
        const config = GAME_CONFIG.ZOMBIES[type.toUpperCase()] || GAME_CONFIG.ZOMBIES.BASIC;

        // Body parts colors
        const skinColor = 0x7CB342; // Zombie green
        const shirtColor = 0x5D4037;
        const pantsColor = 0x3E2723;

        // Torso (box)
        const torsoGeom = new THREE.BoxGeometry(0.5, 0.6, 0.25);
        const torsoMat = this.getMaterial(shirtColor);
        const torso = new THREE.Mesh(torsoGeom, torsoMat);
        torso.position.y = 0.9;
        torso.castShadow = true;
        group.add(torso);

        // Head (box with rounded edges simulation)
        const headGeom = new THREE.BoxGeometry(0.4, 0.4, 0.35);
        const headMat = this.getMaterial(skinColor);
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.45;
        head.castShadow = true;
        group.add(head);

        // Eyes
        const eyeGeom = new THREE.BoxGeometry(0.08, 0.08, 0.05);
        const eyeWhite = this.getMaterial(0xFFFFFF);
        const eyeRed = this.getMaterial(0xFF0000);

        const leftEye = new THREE.Mesh(eyeGeom, eyeWhite);
        leftEye.position.set(-0.1, 1.5, 0.16);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeom, eyeWhite);
        rightEye.position.set(0.1, 1.5, 0.16);
        group.add(rightEye);

        // Red pupils (zombie!)
        const pupilGeom = new THREE.BoxGeometry(0.04, 0.04, 0.02);
        const leftPupil = new THREE.Mesh(pupilGeom, eyeRed);
        leftPupil.position.set(-0.1, 1.5, 0.185);
        group.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeom, eyeRed);
        rightPupil.position.set(0.1, 1.5, 0.185);
        group.add(rightPupil);

        // Arms
        const armGeom = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const armMat = this.getMaterial(skinColor);

        const leftArm = new THREE.Mesh(armGeom, armMat);
        leftArm.position.set(-0.35, 0.9, 0.15);
        leftArm.rotation.x = -0.5; // Arms forward (zombie pose)
        leftArm.castShadow = true;
        leftArm.userData.isArm = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeom, armMat);
        rightArm.position.set(0.35, 0.9, 0.15);
        rightArm.rotation.x = -0.5;
        rightArm.castShadow = true;
        rightArm.userData.isArm = true;
        group.add(rightArm);

        // Legs
        const legGeom = new THREE.BoxGeometry(0.18, 0.5, 0.18);
        const legMat = this.getMaterial(pantsColor);

        const leftLeg = new THREE.Mesh(legGeom, legMat);
        leftLeg.position.set(-0.12, 0.35, 0);
        leftLeg.castShadow = true;
        leftLeg.userData.isLeg = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeom, legMat);
        rightLeg.position.set(0.12, 0.35, 0);
        rightLeg.castShadow = true;
        rightLeg.userData.isLeg = true;
        group.add(rightLeg);

        // Type-specific accessories
        if (type === 'cone') {
            const coneGeom = new THREE.ConeGeometry(0.2, 0.4, 8);
            const coneMat = this.getMaterial(0xFF6600);
            const cone = new THREE.Mesh(coneGeom, coneMat);
            cone.position.y = 1.8;
            cone.castShadow = true;
            group.add(cone);
        } else if (type === 'bucket') {
            const bucketGeom = new THREE.CylinderGeometry(0.2, 0.22, 0.3, 8);
            const bucketMat = this.getMaterial(0x808080, { metalness: 0.5 });
            const bucket = new THREE.Mesh(bucketGeom, bucketMat);
            bucket.position.y = 1.75;
            bucket.castShadow = true;
            group.add(bucket);
        } else if (type === 'flag') {
            // Flag pole
            const poleGeom = new THREE.CylinderGeometry(0.02, 0.02, 1, 6);
            const poleMat = this.getMaterial(0x8B4513);
            const pole = new THREE.Mesh(poleGeom, poleMat);
            pole.position.set(0.35, 1.3, -0.15);
            group.add(pole);

            // Flag
            const flagGeom = new THREE.PlaneGeometry(0.4, 0.3);
            const flagMat = this.getMaterial(0xDC143C, { side: THREE.DoubleSide });
            const flag = new THREE.Mesh(flagGeom, flagMat);
            flag.position.set(0.55, 1.65, -0.15);
            group.add(flag);
        }

        group.userData.type = type;
        group.userData.zombieType = type;
        return group;
    }

    // ==========================================
    // ENVIRONMENT
    // ==========================================

    createGrassTile(row, col) {
        const group = new THREE.Group();

        // Alternating grass colors for checkerboard
        const isLight = (row + col) % 2 === 0;
        const grassColor = isLight ? 0x7CFC00 : 0x228B22;

        const tileGeom = new THREE.BoxGeometry(
            GAME_CONFIG.GRID.CELL_SIZE * 0.95,
            0.1,
            GAME_CONFIG.GRID.CELL_SIZE * 0.95
        );
        const tileMat = this.getMaterial(grassColor);
        const tile = new THREE.Mesh(tileGeom, tileMat);
        tile.receiveShadow = true;
        group.add(tile);

        // Small grass blades for detail
        if (Math.random() > 0.5) {
            const bladeGeom = new THREE.ConeGeometry(0.03, 0.15, 4);
            const bladeMat = this.getMaterial(0x2E7D32);

            for (let i = 0; i < 3; i++) {
                const blade = new THREE.Mesh(bladeGeom, bladeMat);
                blade.position.set(
                    (Math.random() - 0.5) * 0.8,
                    0.1,
                    (Math.random() - 0.5) * 0.8
                );
                blade.rotation.x = (Math.random() - 0.5) * 0.2;
                group.add(blade);
            }
        }

        return group;
    }

    createHouse() {
        const group = new THREE.Group();

        // House body
        const houseGeom = new THREE.BoxGeometry(8, 5, 4);
        const houseMat = this.getMaterial(0xDEB887);
        const house = new THREE.Mesh(houseGeom, houseMat);
        house.position.set(0, 2.5, -5);
        house.castShadow = true;
        house.receiveShadow = true;
        group.add(house);

        // Roof
        const roofGeom = new THREE.ConeGeometry(5, 2, 4);
        const roofMat = this.getMaterial(0x8B0000);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.set(0, 6, -5);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Door
        const doorGeom = new THREE.BoxGeometry(1, 2, 0.1);
        const doorMat = this.getMaterial(0x4A3000);
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 1, -2.95);
        group.add(door);

        // Windows
        const windowGeom = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const windowMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.7 });

        const leftWindow = new THREE.Mesh(windowGeom, windowMat);
        leftWindow.position.set(-2, 3, -2.95);
        group.add(leftWindow);

        const rightWindow = new THREE.Mesh(windowGeom, windowMat);
        rightWindow.position.set(2, 3, -2.95);
        group.add(rightWindow);

        return group;
    }

    createProjectile() {
        const group = new THREE.Group();

        // Main pea - BRIGHT green
        const peaGeom = new THREE.SphereGeometry(
            GAME_CONFIG.PROJECTILE.SIZE,
            12, 8
        );
        const peaMat = new THREE.MeshBasicMaterial({
            color: 0x44FF44  // Bright lime green
        });
        const pea = new THREE.Mesh(peaGeom, peaMat);
        group.add(pea);

        // Outer glow - bigger for visibility
        const glowGeom = new THREE.SphereGeometry(
            GAME_CONFIG.PROJECTILE.SIZE * 1.8,
            8, 6
        );
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x88FF88,
            transparent: true,
            opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        group.add(glow);

        // Trail effect
        const trailGeom = new THREE.ConeGeometry(
            GAME_CONFIG.PROJECTILE.SIZE * 0.6,
            GAME_CONFIG.PROJECTILE.SIZE * 2,
            6
        );
        const trailMat = new THREE.MeshBasicMaterial({
            color: 0x22AA22,
            transparent: true,
            opacity: 0.5
        });
        const trail = new THREE.Mesh(trailGeom, trailMat);
        trail.position.x = -GAME_CONFIG.PROJECTILE.SIZE * 1.2;
        trail.rotation.z = -Math.PI / 2;
        group.add(trail);

        return group;
    }

    createSun() {
        const group = new THREE.Group();

        // Outer glow sphere
        const glowGeom = new THREE.SphereGeometry(0.5, 16, 12);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xFFEB3B,
            transparent: true,
            opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        group.add(glow);

        // Main sun body - bigger
        const sunGeom = new THREE.SphereGeometry(0.35, 16, 12);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xFFD700
        });
        const sun = new THREE.Mesh(sunGeom, sunMat);
        group.add(sun);

        // Inner bright core
        const coreGeom = new THREE.SphereGeometry(0.2, 12, 8);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xFFFFAA
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        group.add(core);

        // Sun rays - bigger and more prominent
        const rayGeom = new THREE.ConeGeometry(0.12, 0.3, 4);
        const rayMat = new THREE.MeshBasicMaterial({
            color: 0xFFD700
        });

        for (let i = 0; i < 8; i++) {
            const ray = new THREE.Mesh(rayGeom, rayMat);
            const angle = (i / 8) * Math.PI * 2;
            ray.position.set(
                Math.cos(angle) * 0.45,
                Math.sin(angle) * 0.45,
                0
            );
            ray.rotation.z = angle - Math.PI / 2;
            group.add(ray);
        }

        // Point light for extra glow
        const light = new THREE.PointLight(0xFFD700, 1, 3);
        group.add(light);

        // Mark for easy identification
        group.userData.isSun = true;

        return group;
    }

    createPlacementPreview() {
        const geom = new THREE.BoxGeometry(
            GAME_CONFIG.GRID.CELL_SIZE * 0.9,
            0.1,
            GAME_CONFIG.GRID.CELL_SIZE * 0.9
        );
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            transparent: true,
            opacity: 0.4
        });
        return new THREE.Mesh(geom, mat);
    }

    createExplosion() {
        const group = new THREE.Group();

        // Explosion sphere
        const explosionGeom = new THREE.SphereGeometry(1.5, 16, 12);
        const explosionMat = new THREE.MeshBasicMaterial({
            color: 0xFF4500,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(explosionGeom, explosionMat);
        group.add(explosion);

        // Inner glow
        const innerGeom = new THREE.SphereGeometry(1, 12, 8);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.9
        });
        const inner = new THREE.Mesh(innerGeom, innerMat);
        group.add(inner);

        return group;
    }

    createTimerRing() {
        // Simple ring geometry that will be masked by shader
        const geometry = new THREE.PlaneGeometry(1, 1);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uProgress: { value: 1.0 },
                uColor: { value: new THREE.Color(0xFFFFFF) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uProgress;
                uniform vec3 uColor;
                varying vec2 vUv;
                
                #define PI 3.14159265359
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    vec2 diff = vUv - center;
                    float dist = length(diff);
                    
                    // Ring shape (thickness)
                    if (dist < 0.35 || dist > 0.45) discard;
                    
                    // Angle calculation for progress
                    float angle = atan(-diff.x, diff.y); // -PI to PI
                    if (angle < 0.0) angle += 2.0 * PI; // 0 to 2PI
                    
                    if (angle > uProgress * 2.0 * PI) discard;
                    
                    gl_FragColor = vec4(uColor, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Flat on ground
        mesh.renderOrder = 999; // Render on top
        return mesh;
    }

    dispose() {
        for (const material of this.materials.values()) {
            material.dispose();
        }
        this.materials.clear();
    }
}
