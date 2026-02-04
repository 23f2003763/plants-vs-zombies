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

            // Initialize zombie AI
            this.zombieAI = new ZombieAI(
                this.world,
                this.gridSystem,
                this.combatSystem
            );

            // Initialize wave manager
            this.waveManager = new WaveManager(
                this.world,
                this.renderer.getScene(),
                this.modelGenerator,
                this.gridSystem
            );

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

        // Create house backdrop
        this.house = this.modelGenerator.createHouse();
        scene.add(this.house);

        // Add some decorative elements
        this.createDecorations();
    }

    createDecorations() {
        const scene = this.renderer.getScene();

        // Trees on the sides
        const treePositions = [
            { x: -8, z: -3 },
            { x: -8, z: 2 },
            { x: 8, z: -3 },
            { x: 8, z: 2 }
        ];

        for (const pos of treePositions) {
            const tree = this.createTree();
            tree.position.set(pos.x, 0, pos.z);
            scene.add(tree);
        }

        // Fence along the right side
        for (let z = -3; z <= 3; z += 1) {
            const post = this.createFencePost();
            post.position.set(7, 0, z);
            scene.add(post);
        }
    }

    createTree() {
        const group = new THREE.Group();

        // Trunk
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        group.add(trunk);

        // Foliage (cone)
        const foliageGeom = new THREE.ConeGeometry(1, 2, 8);
        const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeom, foliageMat);
        foliage.position.y = 2.5;
        foliage.castShadow = true;
        group.add(foliage);

        return group;
    }

    createFencePost() {
        const group = new THREE.Group();

        const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const postMat = new THREE.MeshStandardMaterial({
            color: 0xD2691E,
            roughness: 0.8
        });
        const post = new THREE.Mesh(postGeom, postMat);
        post.position.y = 0.4;
        post.castShadow = true;
        group.add(post);

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

        // Update animations
        const allEntities = [...this.world.entities.values()];
        this.animationSystem.update(allEntities, deltaTime, elapsedTime);

        // Check wave completion
        if (this.waveManager.isWaveComplete()) {
            if (this.waveManager.hasMoreWaves()) {
                // Start next wave after delay
                setTimeout(() => {
                    if (this.state === GAME_STATES.PLAYING) {
                        this.waveManager.startWave();
                        this.uiManager.updateWaveDisplay(this.waveManager.getCurrentWave(), 0);
                    }
                }, 5000);
            }
        }

        // Update wave progress UI
        const waveProgress = this.waveManager.getProgress();
        this.uiManager.updateWaveDisplay(
            this.waveManager.getCurrentWave(),
            waveProgress.progress
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
