/**
 * Camera Controller - Isometric view with pan and zoom
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
        this.panSpeed = 0.01;
        this.zoomSpeed = 0.5;

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
        this.smoothness = 0.1;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.domElement.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('mouseleave', this.onMouseUp.bind(this));
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
        if (event.button === 2 || event.button === 1) { // Right or middle click
            this.isPanning = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    onMouseMove(event) {
        if (!this.isPanning) return;

        const deltaX = (event.clientX - this.lastMouseX) * this.panSpeed;
        const deltaY = (event.clientY - this.lastMouseY) * this.panSpeed;

        // Pan camera
        this.targetPosition.x -= deltaX;
        this.lookAtTarget.x -= deltaX;
        this.targetPosition.z += deltaY;
        this.lookAtTarget.z += deltaY;

        // Clamp to bounds
        const maxPan = 5;
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

    onMouseUp() {
        this.isPanning = false;
    }

    update(deltaTime) {
        // Smooth camera movement
        this.camera.position.lerp(this.targetPosition, this.smoothness);

        // Update look at
        const currentLookAt = new THREE.Vector3();
        this.camera.getWorldDirection(currentLookAt);
        currentLookAt.add(this.camera.position);
        currentLookAt.lerp(this.lookAtTarget, this.smoothness);
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
        this.domElement.removeEventListener('wheel', this.onWheel.bind(this));
        this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.removeEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.removeEventListener('mouseleave', this.onMouseUp.bind(this));
    }
}
