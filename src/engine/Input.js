/**
 * Input System - Mouse and Keyboard handling
 */
import * as THREE from 'three';

export class Input {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        // Mouse state
        this.mouse = new THREE.Vector2();
        this.mouseNormalized = new THREE.Vector2();
        this.mouseDown = false;
        this.mouseButton = -1;
        this.clickPosition = new THREE.Vector2();
        this.hasClick = false;

        // Keyboard state
        this.keys = new Map();
        this.keysPressed = new Set();
        this.keysReleased = new Set();

        // Raycasting
        this.raycaster = new THREE.Raycaster();
        this.raycastPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));

        // Prevent default context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;

        // Normalized coordinates (-1 to 1)
        this.mouseNormalized.x = (this.mouse.x / rect.width) * 2 - 1;
        this.mouseNormalized.y = -(this.mouse.y / rect.height) * 2 + 1;
    }

    onMouseDown(event) {
        this.mouseDown = true;
        this.mouseButton = event.button;

        if (event.button === 0) { // Left click
            this.clickPosition.copy(this.mouseNormalized);
            this.hasClick = true;
        }
    }

    onMouseUp(event) {
        this.mouseDown = false;
        this.mouseButton = -1;
    }

    onKeyDown(event) {
        const key = event.code;
        if (!this.keys.get(key)) {
            this.keysPressed.add(key);
        }
        this.keys.set(key, true);
    }

    onKeyUp(event) {
        const key = event.code;
        this.keys.set(key, false);
        this.keysReleased.add(key);
    }

    // Check if key is currently held
    isKeyDown(keyCode) {
        return this.keys.get(keyCode) === true;
    }

    // Check if key was just pressed this frame
    isKeyPressed(keyCode) {
        return this.keysPressed.has(keyCode);
    }

    // Check if key was just released this frame
    isKeyReleased(keyCode) {
        return this.keysReleased.has(keyCode);
    }

    // Get world position from mouse
    getWorldPosition() {
        this.raycaster.setFromCamera(this.mouseNormalized, this.camera);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.raycastPlane, intersection);
        return intersection;
    }

    // Raycast to objects
    raycast(objects) {
        this.raycaster.setFromCamera(this.mouseNormalized, this.camera);
        return this.raycaster.intersectObjects(objects, true);
    }

    // Check for left click this frame
    consumeClick() {
        if (this.hasClick) {
            this.hasClick = false;
            return true;
        }
        return false;
    }

    // Clear per-frame states
    update() {
        this.keysPressed.clear();
        this.keysReleased.clear();
    }

    isLeftMouseDown() {
        return this.mouseDown && this.mouseButton === 0;
    }

    isRightMouseDown() {
        return this.mouseDown && this.mouseButton === 2;
    }

    dispose() {
        this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        window.removeEventListener('keyup', this.onKeyUp.bind(this));
    }
}
