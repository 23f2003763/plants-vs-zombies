/**
 * Camera Controller - Isometric view with pan and zoom
 * Fixed: Better mouse event handling for panning
 */
import * as THREE from 'three';
import { GAME_CONFIG } from '../Constants.js';

export class CameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Camera bounds
        this.minZoom = 8;
        this.maxZoom = 25;
        this.panSpeed = 0.03;  // Increased pan speed
        this.zoomSpeed = 1.0;  // Increased zoom speed

        // Current state
        this.targetPosition = new THREE.Vector3(
            GAME_CONFIG.CAMERA.POSITION.x,
            GAME_CONFIG.CAMERA.POSITION.y,
            GAME_CONFIG.CAMERA.POSITION.z
        );
        this.lookAtTarget = new THREE.Vector3(
            GAME_CONFIG.CAMERA.LOOK_AT.x,
            GAME_CONFIG.CAMERA.LOOK_AT.y,
            GAME_CONFIG.CAMERA.LOOK_AT.z
        );

        // Pan state
        this.isPanning = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Smooth movement
        this.smoothness = 0.15;

        // Bound functions for proper removal
        this.boundOnWheel = this.onWheel.bind(this);
        this.boundOnMouseDown = this.onMouseDown.bind(this);
        this.boundOnMouseMove = this.onMouseMove.bind(this);
        this.boundOnMouseUp = this.onMouseUp.bind(this);
        this.boundOnContextMenu = this.onContextMenu.bind(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Use document for mouse move/up to catch events outside canvas
        this.domElement.addEventListener('wheel', this.boundOnWheel, { passive: false });
        this.domElement.addEventListener('mousedown', this.boundOnMouseDown);
        this.domElement.addEventListener('contextmenu', this.boundOnContextMenu);
        document.addEventListener('mousemove', this.boundOnMouseMove);
        document.addEventListener('mouseup', this.boundOnMouseUp);
    }

    onContextMenu(event) {
        event.preventDefault();
    }

    onWheel(event) {
        event.preventDefault();

        const delta = event.deltaY > 0 ? 1 : -1;
        const zoomChange = delta * this.zoomSpeed;

        // Zoom by moving camera closer/further
        const direction = new THREE.Vector3()
            .subVectors(this.targetPosition, this.lookAtTarget)
            .normalize();

        const newDistance = this.targetPosition.distanceTo(this.lookAtTarget) + zoomChange;

        if (newDistance >= this.minZoom && newDistance <= this.maxZoom) {
            this.targetPosition.addScaledVector(direction, zoomChange);
        }
    }

    onMouseDown(event) {
        // Right click (2) or middle click (1) to pan
        if (event.button === 2 || event.button === 1) {
            event.preventDefault();
            this.isPanning = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    onMouseMove(event) {
        if (!this.isPanning) return;

        const deltaX = (event.clientX - this.lastMouseX) * this.panSpeed;
        const deltaY = (event.clientY - this.lastMouseY) * this.panSpeed;

        // Pan camera and look target together
        this.targetPosition.x -= deltaX;
        this.lookAtTarget.x -= deltaX;
        this.targetPosition.z += deltaY;
        this.lookAtTarget.z += deltaY;

        // Clamp to bounds
        const maxPan = 8;
        this.targetPosition.x = THREE.MathUtils.clamp(this.targetPosition.x, -maxPan, maxPan);
        this.lookAtTarget.x = THREE.MathUtils.clamp(this.lookAtTarget.x, -maxPan, maxPan);
        this.targetPosition.z = THREE.MathUtils.clamp(
            this.targetPosition.z,
            GAME_CONFIG.CAMERA.POSITION.z - maxPan,
            GAME_CONFIG.CAMERA.POSITION.z + maxPan
        );
        this.lookAtTarget.z = THREE.MathUtils.clamp(this.lookAtTarget.z, -maxPan, maxPan);

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    onMouseUp(event) {
        if (event.button === 2 || event.button === 1) {
            this.isPanning = false;
        }
    }

    update(deltaTime) {
        // Smooth camera movement
        this.camera.position.lerp(this.targetPosition, this.smoothness);
        this.camera.lookAt(this.lookAtTarget);
    }

    reset() {
        this.targetPosition.set(
            GAME_CONFIG.CAMERA.POSITION.x,
            GAME_CONFIG.CAMERA.POSITION.y,
            GAME_CONFIG.CAMERA.POSITION.z
        );
        this.lookAtTarget.set(
            GAME_CONFIG.CAMERA.LOOK_AT.x,
            GAME_CONFIG.CAMERA.LOOK_AT.y,
            GAME_CONFIG.CAMERA.LOOK_AT.z
        );
    }

    dispose() {
        this.domElement.removeEventListener('wheel', this.boundOnWheel);
        this.domElement.removeEventListener('mousedown', this.boundOnMouseDown);
        this.domElement.removeEventListener('contextmenu', this.boundOnContextMenu);
        document.removeEventListener('mousemove', this.boundOnMouseMove);
        document.removeEventListener('mouseup', this.boundOnMouseUp);
    }
}
