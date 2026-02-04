/**
 * Main Game Class - Orchestrates all game systems
 */
import * as THREE from 'three';
import { GAME_CONFIG, GAME_STATES, ENTITY_TYPES } from './Constants.js';
import { Renderer } from './engine/Renderer.js';
import { World, Components } from './engine/ECS.js';
import { CameraController } from './engine/Camera.js';
import { Time } from './engine/Time.js';
import { Input } from './engine/Input.js';
import { ModelGenerator } from './assets/ModelGenerator.js';
import { AnimationSystem } from './assets/AnimationSystem.js';
import { GridSystem } from './systems/GridSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { ZombieAI } from './systems/ZombieAI.js';
import { WaveManager } from './systems/WaveManager.js';
import { SunSystem } from './systems/SunSystem.js';
import { UIManager } from './ui/UIManager.js';
import { PlantSystem } from './systems/PlantSystem.js';
import { WeatherSystem } from './systems/WeatherSystem.js';
import { AudioManager } from './audio/AudioManager.js';

export class Game {
    constructor() {
        this.state = GAME_STATES.LOADING;
        this.canvas = document.getElementById('game-canvas');

        // Core systems
        this.renderer = null;
        this.world = null;
        this.time = null;
        this.input = null;
        this.cameraController = null;

        // Asset generators
        this.modelGenerator = null;
        this.animationSystem = null;

        // Game systems
        this.gridSystem = null;
        this.combatSystem = null;
        this.zombieAI = null;
        this.waveManager = null;
        this.sunSystem = null;
        this.plantSystem = null;
        this.weatherSystem = null;

        // UI & Audio
        this.uiManager = null;
        this.audioManager = null;

        // Currently selected plant for placement
        this.selectedPlant = null;

        // Environment objects
        this.house = null;

        // Animation frame ID
        this.animationFrameId = null;

        // Visibility handling
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    async initialize() {
        try {
            // Initialize renderer
            this.renderer = new Renderer(this.canvas);

            // Initialize ECS world
            this.world = new World();

            // Initialize time system
            this.time = new Time();

            // Initialize input
            this.input = new Input(this.canvas, this.renderer.getCamera());

            // Initialize camera controller
            this.cameraController = new CameraController(
                this.renderer.getCamera(),
                this.canvas
            );

            // Initialize model generator
            this.modelGenerator = new ModelGenerator();

            // Initialize animation system
            this.animationSystem = new AnimationSystem();

            // Initialize audio manager
            this.audioManager = new AudioManager();
            await this.audioManager.initialize();

            // Initialize grid system
            this.gridSystem = new GridSystem(
                this.world,
                this.renderer.getScene(),
                this.modelGenerator
            );

            // Initialize combat system
            this.combatSystem = new CombatSystem(
                this.world,
                this.renderer.getScene(),
                this.modelGenerator,
                this.animationSystem,
                this.audioManager
            );

            // Wire up zombie kill reward
            this.combatSystem.onZombieKill = (amount) => {
                if (this.sunSystem) {
                    this.sunSystem.addSun(amount);
                    // Also show floating text if possible (optional improvement for later)
                }
            };

            // Initialize zombie AI
            this.zombieAI = new ZombieAI(
                this.world,
                this.gridSystem,
                this.combatSystem
            );

            // Plant System
            this.plantSystem = new PlantSystem(
                this.world,
                this.gridSystem,
                this.modelGenerator
            );

            // Weather System
            this.weatherSystem = new WeatherSystem(
                this.renderer.getScene(),
                null // Light system not separated yet
            );

            // Initialize wave manager
            this.waveManager = new WaveManager(
                this.world,
                this.renderer.getScene(),
                this.modelGenerator,
                this.gridSystem
            );

            // Level State
            this.currentLevel = 1;

            // Start first level
            this.startLevel(this.currentLevel);

            // Initialize sun system
            this.sunSystem = new SunSystem(
                this.world,
                this.renderer.getScene(),
                this.modelGenerator,
                this.animationSystem
            );

            // Connect sun system to UI
            this.sunSystem.onSunChange = (amount) => {
                this.uiManager?.updateSunDisplay(amount);
            };

            // Initialize UI manager
            this.uiManager = new UIManager(this);

            // Create environment
            this.createEnvironment();

            // Show main menu
            this.state = GAME_STATES.MENU;
            this.uiManager.showScreen('menu');

            console.log('Game initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error;
        }
    }

    createEnvironment() {
        const scene = this.renderer.getScene();

        // Create sky dome with gradient
        this.createSky();

        // Create ground plane
        this.createGround();

        // Create mountains in background
        this.createMountains();

        // Create animated clouds
        this.createClouds();

        // Create house backdrop
        this.house = this.modelGenerator.createHouse();
        scene.add(this.house);

        // Add decorative elements
        this.createDecorations();

        // Create ambient sun in sky
        this.createSkySun();
    }

    createSky() {
        const scene = this.renderer.getScene();

        // Sky dome with gradient
        const skyGeom = new THREE.SphereGeometry(100, 32, 16);
        // Flip normals to render inside
        skyGeom.scale(-1, 1, 1);

        // Create gradient material using vertex colors
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0x89CFF0) },
                offset: { value: 0 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeom, skyMat);
        scene.add(sky);
    }

    createGround() {
        const scene = this.renderer.getScene();

        // Large ground plane with gradient
        const groundGeom = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x5D8A3C,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        scene.add(ground);

        // Dirt path on the sides
        const pathGeom = new THREE.PlaneGeometry(4, 12);
        const pathMat = new THREE.MeshStandardMaterial({
            color: 0x8B5A2B,
            roughness: 0.95
        });

        const leftPath = new THREE.Mesh(pathGeom, pathMat);
        leftPath.rotation.x = -Math.PI / 2;
        leftPath.position.set(-8, -0.05, 0);
        leftPath.receiveShadow = true;
        scene.add(leftPath);

        const rightPath = new THREE.Mesh(pathGeom, pathMat);
        rightPath.rotation.x = -Math.PI / 2;
        rightPath.position.set(10, -0.05, 0);
        rightPath.receiveShadow = true;
        scene.add(rightPath);
    }

    createMountains() {
        const scene = this.renderer.getScene();

        // Create distant mountains
        const mountainColors = [0x4A6741, 0x3D5735, 0x5C7A4E];

        for (let i = 0; i < 8; i++) {
            const height = 8 + Math.random() * 12;
            const width = 10 + Math.random() * 15;
            const mountainGeom = new THREE.ConeGeometry(width, height, 4 + Math.floor(Math.random() * 4));
            const mountainMat = new THREE.MeshStandardMaterial({
                color: mountainColors[Math.floor(Math.random() * mountainColors.length)],
                flatShading: true,
                roughness: 0.9
            });
            const mountain = new THREE.Mesh(mountainGeom, mountainMat);

            const angle = (i / 8) * Math.PI - Math.PI / 2;
            const distance = 40 + Math.random() * 20;
            mountain.position.set(
                Math.cos(angle) * distance,
                height / 2 - 2,
                -30 - Math.random() * 20
            );
            mountain.rotation.y = Math.random() * Math.PI;
            scene.add(mountain);
        }

        // Snow caps on some mountains
        for (let i = 0; i < 4; i++) {
            const snowGeom = new THREE.ConeGeometry(4, 3, 4);
            const snowMat = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                flatShading: true
            });
            const snow = new THREE.Mesh(snowGeom, snowMat);
            snow.position.set(
                -20 + i * 15,
                12 + Math.random() * 5,
                -45
            );
            scene.add(snow);
        }
    }

    createClouds() {
        const scene = this.renderer.getScene();
        this.clouds = [];

        for (let i = 0; i < 10; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                -50 + Math.random() * 100,
                15 + Math.random() * 10,
                -20 - Math.random() * 30
            );
            cloud.userData.speed = 0.02 + Math.random() * 0.03;
            cloud.userData.startX = cloud.position.x;
            scene.add(cloud);
            this.clouds.push(cloud);
        }
    }

    createCloud() {
        const group = new THREE.Group();

        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 1,
            transparent: true,
            opacity: 0.9
        });

        // Create puffy cloud from multiple spheres
        const puffCount = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < puffCount; i++) {
            const size = 1.5 + Math.random() * 2;
            const puffGeom = new THREE.SphereGeometry(size, 8, 6);
            const puff = new THREE.Mesh(puffGeom, cloudMat);
            puff.position.set(
                (i - puffCount / 2) * 1.5,
                Math.random() * 0.5,
                Math.random() * 1 - 0.5
            );
            puff.scale.y = 0.6;
            group.add(puff);
        }

        return group;
    }

    createSkySun() {
        const scene = this.renderer.getScene();

        // Big sun in the sky
        const sunGeom = new THREE.SphereGeometry(5, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xFFDD44
        });
        this.skySun = new THREE.Mesh(sunGeom, sunMat);
        this.skySun.position.set(20, 30, -40);
        scene.add(this.skySun);

        // Sun glow
        const glowGeom = new THREE.SphereGeometry(7, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xFFEE88,
            transparent: true,
            opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        this.skySun.add(glow);

        // Sun rays (simple planes)
        const rayMat = new THREE.MeshBasicMaterial({
            color: 0xFFEE88,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 8; i++) {
            const rayGeom = new THREE.PlaneGeometry(1, 12);
            const ray = new THREE.Mesh(rayGeom, rayMat);
            ray.rotation.z = (i / 8) * Math.PI;
            ray.position.z = -0.1;
            this.skySun.add(ray);
        }
    }

    createDecorations() {
        const scene = this.renderer.getScene();

        // Trees scattered around - more of them
        const treePositions = [
            { x: -10, z: -4, scale: 1.2 },
            { x: -9, z: 2, scale: 1 },
            { x: -11, z: 0, scale: 0.8 },
            { x: 9, z: -3, scale: 1.1 },
            { x: 10, z: 1, scale: 0.9 },
            { x: 11, z: 3, scale: 1 },
            { x: -12, z: -6, scale: 1.3 },
            { x: 12, z: -5, scale: 1.2 },
            { x: -7, z: 5, scale: 0.7 },
            { x: 8, z: 5, scale: 0.8 }
        ];

        for (const pos of treePositions) {
            const tree = this.createTree();
            tree.position.set(pos.x, 0, pos.z);
            tree.scale.setScalar(pos.scale);
            scene.add(tree);
        }

        // Fence along the right side
        for (let z = -4; z <= 4; z += 0.8) {
            const post = this.createFencePost();
            post.position.set(7.5, 0, z);
            scene.add(post);
        }

        // Add fence rails
        const railGeom = new THREE.BoxGeometry(0.08, 0.08, 9);
        const railMat = new THREE.MeshStandardMaterial({ color: 0xD2691E });

        const topRail = new THREE.Mesh(railGeom, railMat);
        topRail.position.set(7.5, 0.7, 0);
        scene.add(topRail);

        const bottomRail = new THREE.Mesh(railGeom, railMat);
        bottomRail.position.set(7.5, 0.35, 0);
        scene.add(bottomRail);

        // Flowers scattered on grass
        this.createFlowers();

        // Bushes
        this.createBushes();
    }

    createFlowers() {
        const scene = this.renderer.getScene();
        const flowerColors = [0xFF69B4, 0xFFFF00, 0xFF4500, 0xEE82EE, 0x00CED1];

        for (let i = 0; i < 25; i++) {
            const x = -12 + Math.random() * 24;
            const z = -6 + Math.random() * 12;

            // Don't place on lawn
            if (x > -6 && x < 6 && z > -3 && z < 3) continue;

            const flower = new THREE.Group();

            // Stem
            const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 4);
            const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeom, stemMat);
            stem.position.y = 0.1;
            flower.add(stem);

            // Petals
            const petalGeom = new THREE.SphereGeometry(0.08, 6, 4);
            const petalMat = new THREE.MeshStandardMaterial({
                color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
            });
            const petals = new THREE.Mesh(petalGeom, petalMat);
            petals.position.y = 0.22;
            flower.add(petals);

            flower.position.set(x, 0, z);
            scene.add(flower);
        }
    }

    createBushes() {
        const scene = this.renderer.getScene();

        const bushPositions = [
            { x: -7, z: -3 }, { x: -7, z: 3 },
            { x: 6.5, z: -4 }, { x: 6.5, z: 4 }
        ];

        for (const pos of bushPositions) {
            const bush = new THREE.Group();

            for (let i = 0; i < 5; i++) {
                const sphereGeom = new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 6, 4);
                const sphereMat = new THREE.MeshStandardMaterial({
                    color: 0x2E8B2E + Math.floor(Math.random() * 0x002020),
                    roughness: 0.8
                });
                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                sphere.position.set(
                    Math.random() * 0.4 - 0.2,
                    0.3 + Math.random() * 0.2,
                    Math.random() * 0.4 - 0.2
                );
                sphere.castShadow = true;
                bush.add(sphere);
            }

            bush.position.set(pos.x, 0, pos.z);
            scene.add(bush);
        }
    }

    createTree() {
        const group = new THREE.Group();

        // Trunk
        const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 1.8, 8);
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 0.9;
        trunk.castShadow = true;
        group.add(trunk);

        // Multiple layers of foliage for more depth
        const foliageColors = [0x228B22, 0x2E8B2E, 0x3CB371];

        for (let layer = 0; layer < 3; layer++) {
            const size = 1.2 - layer * 0.3;
            const foliageGeom = new THREE.ConeGeometry(size, 1.2, 8);
            const foliageMat = new THREE.MeshStandardMaterial({
                color: foliageColors[layer],
                roughness: 0.8,
                flatShading: true
            });
            const foliage = new THREE.Mesh(foliageGeom, foliageMat);
            foliage.position.y = 2 + layer * 0.6;
            foliage.castShadow = true;
            group.add(foliage);
        }

        return group;
    }

    createFencePost() {
        const group = new THREE.Group();

        const postGeom = new THREE.BoxGeometry(0.1, 0.9, 0.1);
        const postMat = new THREE.MeshStandardMaterial({
            color: 0xD2691E,
            roughness: 0.8
        });
        const post = new THREE.Mesh(postGeom, postMat);
        post.position.y = 0.45;
        post.castShadow = true;
        group.add(post);

        // Pointed top
        const topGeom = new THREE.ConeGeometry(0.07, 0.12, 4);
        const top = new THREE.Mesh(topGeom, postMat);
        top.position.y = 0.95;
        top.rotation.y = Math.PI / 4;
        group.add(top);

        return group;
    }


    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.uiManager.showScreen('game');
        this.uiManager.reset();

        // Reset systems
        this.gridSystem.clear();
        this.sunSystem.reset();
        this.waveManager.reset();
        this.world.clear(this.renderer.getScene());
        this.time.reset();

        // Recreate environment (tiles were cleared)
        this.gridSystem.initializeGrid();

        // Update sun display
        this.uiManager.updateSunDisplay(this.sunSystem.getSunAmount());

        // Start first wave after delay
        setTimeout(() => {
            if (this.state === GAME_STATES.PLAYING) {
                this.waveManager.startWave(1);
                this.uiManager.updateWaveDisplay(1, 0);
            }
        }, 3000);

        // Start music
        this.audioManager.playMusic();

        // Start game loop if not running
        if (!this.animationFrameId) {
            this.gameLoop();
        }
    }

    pauseGame() {
        if (this.state !== GAME_STATES.PLAYING) return;

        this.state = GAME_STATES.PAUSED;
        this.time.pause();
        this.uiManager.showScreen('pause');
        this.audioManager.suspend();
    }

    resumeGame() {
        if (this.state !== GAME_STATES.PAUSED) return;

        this.state = GAME_STATES.PLAYING;
        this.time.resume();
        this.uiManager.showScreen('game');
        this.audioManager.resume();
    }

    restartGame() {
        this.state = GAME_STATES.LOADING;

        // Clear world
        this.world.clear(this.renderer.getScene());

        // Reinitialize grid
        this.gridSystem.initializeGrid();

        // Start fresh game
        this.startGame();
    }

    quitToMenu() {
        this.state = GAME_STATES.MENU;
        this.time.pause();
        this.uiManager.showScreen('menu');
        this.audioManager.stopMusic();

        // Clear game state
        this.world.clear(this.renderer.getScene());
        this.gridSystem.clear();
    }

    setSelectedPlant(plantType) {
        this.selectedPlant = plantType;
        this.gridSystem.setSelectedPlant(plantType);
    }

    gameLoop() {
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());

        const deltaTime = this.time.tick();

        // Update input
        this.handleInput();
        this.input.update();

        // Update camera
        this.cameraController.update(deltaTime);

        // Update environment animations
        this.updateEnvironment(deltaTime);

        // Game state specific updates
        if (this.state === GAME_STATES.PLAYING) {
            this.updateGame(deltaTime);
        }

        // Update UI
        this.uiManager.update(deltaTime);

        // Render
        this.renderer.render();

        // Process entity removals
        this.world.processPendingRemovals(this.renderer.getScene());
    }

    updateEnvironment(deltaTime) {
        // Animate clouds
        if (this.clouds) {
            for (const cloud of this.clouds) {
                cloud.position.x += cloud.userData.speed;
                // Wrap around
                if (cloud.position.x > 60) {
                    cloud.position.x = -60;
                }
            }
        }

        // Rotate sky sun slowly
        if (this.skySun) {
            this.skySun.rotation.z += deltaTime * 0.1;
        }
    }

    updateGame(deltaTime) {
        const elapsedTime = this.time.getElapsed();

        // Update wave manager
        this.waveManager.update(deltaTime, elapsedTime);

        // Update sun system
        this.sunSystem.update(deltaTime, elapsedTime);

        // Update zombie AI
        this.zombieAI.update(deltaTime, elapsedTime);

        // Update combat system
        this.combatSystem.update(deltaTime, elapsedTime, this.gridSystem);

        // Update plant system (lifetime)
        this.plantSystem.update(deltaTime);

        // Update weather system
        this.weatherSystem.update(deltaTime);


        // Update animations
        const allEntities = [...this.world.entities.values()];
        this.animationSystem.update(allEntities, deltaTime, elapsedTime);

        // Check wave completion
        if (this.waveManager.isWaveComplete()) {
            if (this.waveManager.hasMoreWaves()) {
                // Start next wave after delay
                setTimeout(() => {
                    if (this.state === GAME_STATES.PLAYING && !this.waveManager.waveActive) {
                        this.waveManager.startWave();
                        this.uiManager.updateWaveDisplay(this.waveManager.getCurrentWave(), 0);
                    }
                }, 5000);
            } else if (this.waveManager.allWavesComplete) {
                // Level Complete!
                // Proceed to next level if available
                if (this.currentLevel < GAME_CONFIG.LEVELS.length) {
                    this.currentLevel++;
                    setTimeout(() => {
                        this.startLevel(this.currentLevel);
                    }, 5000); // 5s break between levels
                } else {
                    // Game Win handled in checkGameEnd
                }
            }
        }

        // Update wave progress UI
        const waveProgress = this.waveManager.getProgress();
        this.uiManager.updateWaveDisplay(
            this.waveManager.getCurrentWave(),
            waveProgress.progress,
            waveProgress.remaining || 0
        );

        // Check win/lose conditions
        this.checkGameEnd();
    }

    handleInput() {
        if (this.state !== GAME_STATES.PLAYING) return;

        // Get world position of mouse
        const worldPos = this.input.getWorldPosition();

        // Update placement preview
        this.gridSystem.updatePreview(worldPos);

        // Handle click
        if (this.input.consumeClick()) {
            // Try to collect sun first
            const collectedSun = this.sunSystem.tryCollectSun(worldPos);

            if (collectedSun) {
                this.audioManager.playSound('sunCollect');
            } else if (this.selectedPlant && this.gridSystem.previewValid) {
                // Try to place plant
                this.tryPlacePlant(worldPos);
            }
        }

        // Right click to cancel placement
        if (this.input.isRightMouseDown()) {
            this.setSelectedPlant(null);
            this.uiManager.deselectPlant();
        }

        // Speed toggle (for testing)
        if (this.input.isKeyPressed('Space')) {
            this.time.setTimeScale(this.time.timeScale === 1 ? 2 : 1);
        }
    }

    tryPlacePlant(worldPos) {
        const { row, col } = this.gridSystem.worldToGrid(worldPos);

        if (!this.gridSystem.isCellEmpty(row, col)) return;

        const plantType = this.selectedPlant.toUpperCase();
        const plantConfig = GAME_CONFIG.PLANTS[plantType];

        if (!plantConfig) return;

        // Check if can afford
        if (!this.sunSystem.spendSun(plantConfig.cost)) {
            return;
        }

        // Create plant entity
        const entity = this.createPlant(plantType, plantConfig, row, col);

        if (entity) {
            // Place on grid
            this.gridSystem.placePlant(row, col, entity);

            // Play sound
            this.audioManager.playSound('plantPlace');

            // Animate placement
            if (entity.mesh) {
                this.animationSystem.animatePlantPlace(entity.mesh);
            }

            // Start cooldown
            this.uiManager.startCooldown(this.selectedPlant, plantConfig.cooldown);

            // Deselect plant
            this.setSelectedPlant(null);
            this.uiManager.deselectPlant();
        }
    }

    createPlant(type, config, row, col) {
        const entity = this.world.createEntity(ENTITY_TYPES.PLANT);

        const worldPos = this.gridSystem.gridToWorld(row, col);

        entity.addComponent('Transform', Components.Transform(
            worldPos.x, 0, worldPos.z
        ));

        entity.addComponent('Health', Components.Health(config.health));

        entity.addComponent('Plant', Components.Plant(type.toLowerCase(), config));

        // Type-specific components
        if (type === 'PEASHOOTER') {
            entity.addComponent('Shooter', Components.Shooter(
                config.fireRate,
                config.damage,
                GAME_CONFIG.PROJECTILE.SPEED
            ));
            entity.addComponent('Animation', Components.Animation('plantIdle', 1));
        } else if (type === 'SUNFLOWER') {
            entity.addComponent('SunProducer', Components.SunProducer(
                config.sunInterval,
                config.sunValue
            ));
            entity.addComponent('Animation', Components.Animation('sunflowerIdle', 1));
        } else if (type === 'WALLNUT') {
            entity.addComponent('Animation', Components.Animation('plantIdle', 0.5));
        } else if (type === 'CHERRYBOMB') {
            entity.addComponent('Explosive', Components.Explosive(
                config.explosionRadius,
                config.explosionDamage
            ));
            entity.addComponent('Animation', Components.Animation('cherryBomb', 1));
        }

        // Add Lifetime if configured
        if (config.lifetime) {
            entity.addComponent('Lifetime', Components.Lifetime(config.lifetime));

            // Add timer ring
            const timerMesh = this.modelGenerator.createTimerRing();
            if (entity.mesh) {
                // Position above plant
                timerMesh.position.y = 1.0;
                entity.mesh.add(timerMesh);

                entity.addComponent('TimerRing', Components.TimerRing(timerMesh));
            }
        }


        // Create mesh
        let mesh;
        switch (type) {
            case 'PEASHOOTER':
                mesh = this.modelGenerator.createPeashooter();
                break;
            case 'SUNFLOWER':
                mesh = this.modelGenerator.createSunflower();
                break;
            case 'WALLNUT':
                mesh = this.modelGenerator.createWallnut();
                break;
            case 'CHERRYBOMB':
                mesh = this.modelGenerator.createCherryBomb();
                break;
            default:
                console.error('Unknown plant type:', type);
                return null;
        }

        mesh.position.set(worldPos.x, 0, worldPos.z);
        this.renderer.getScene().add(mesh);
        entity.setMesh(mesh);

        return entity;
    }

    checkGameEnd() {
        // Check lose condition - zombie reached house
        if (this.zombieAI.hasZombieReachedHouse()) {
            this.gameOver(false);
            return;
        }

        // Check win condition - all waves complete and no zombies left
        if (this.waveManager.isAllWavesComplete()) {
            this.gameOver(true);
        }
    }

    gameOver(won) {
        this.state = won ? GAME_STATES.WIN : GAME_STATES.LOSE;
        this.time.pause();
        this.audioManager.stopMusic();

        if (won) {
            this.uiManager.showScreen('win');
        } else {
            this.uiManager.showScreen('lose');
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            if (this.state === GAME_STATES.PLAYING) {
                this.pauseGame();
            }
        }
    }

    dispose() {
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Remove event listener
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        // Dispose systems
        this.renderer?.dispose();
        this.input?.dispose();
        this.cameraController?.dispose();
        this.modelGenerator?.dispose();
        this.audioManager?.dispose();
    }
}
