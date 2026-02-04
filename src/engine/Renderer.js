/**
 * Three.js Renderer with Post-Processing
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GAME_CONFIG } from '../Constants.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Create WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Create Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(GAME_CONFIG.COLORS.SKY);
        this.scene.fog = new THREE.Fog(GAME_CONFIG.COLORS.SKY, 15, 50);

        // Create Camera
        this.camera = new THREE.PerspectiveCamera(
            GAME_CONFIG.CAMERA.FOV,
            this.width / this.height,
            GAME_CONFIG.CAMERA.NEAR,
            GAME_CONFIG.CAMERA.FAR
        );

        this.camera.position.set(
            GAME_CONFIG.CAMERA.POSITION.x,
            GAME_CONFIG.CAMERA.POSITION.y,
            GAME_CONFIG.CAMERA.POSITION.z
        );

        this.camera.lookAt(
            GAME_CONFIG.CAMERA.LOOK_AT.x,
            GAME_CONFIG.CAMERA.LOOK_AT.y,
            GAME_CONFIG.CAMERA.LOOK_AT.z
        );

        // Setup Lighting
        this.setupLighting();

        // Setup Post-Processing
        this.setupPostProcessing();

        // Handle Resize
        window.addEventListener('resize', this.onResize.bind(this));
    }

    setupLighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional Light (Sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.sunLight.position.set(10, 20, 10);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 50;
        this.sunLight.shadow.camera.left = -15;
        this.sunLight.shadow.camera.right = 15;
        this.sunLight.shadow.camera.top = 15;
        this.sunLight.shadow.camera.bottom = -15;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);

        // Hemisphere Light for nice sky/ground color
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.3);
        this.scene.add(hemiLight);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);

        // Render Pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom Pass
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            0.3,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(this.bloomPass);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
    }

    render() {
        this.composer.render();
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    dispose() {
        this.renderer.dispose();
        this.composer.dispose();
        window.removeEventListener('resize', this.onResize.bind(this));
    }
}
