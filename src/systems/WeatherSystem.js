/**
 * Weather System - Handles environmental effects
 */
import * as THREE from 'three';

export class WeatherSystem {
    constructor(scene, lightSystem) {
        this.scene = scene;
        this.lightSystem = lightSystem; // Access to lights if available, or we manage our own

        this.particles = null;
        this.weatherType = 'sunny';
        this.particleSystem = null;
    }

    setWeather(type) {
        if (this.weatherType === type) return;
        this.weatherType = type;

        console.log(`Setting weather to: ${type}`);

        // Clear existing particles
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
            this.particleSystem.geometry.dispose();
            this.particleSystem.material.dispose();
            this.particleSystem = null;
            this.particles = null;
        }

        // Setup new weather
        switch (type) {
            case 'sunny':
                this.setupSunny();
                break;
            case 'night':
                this.setupNight();
                break;
            case 'rain':
                this.setupRain();
                break;
            case 'snow':
                this.setupSnow();
                break;
        }
    }

    setupSunny() {
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 50);
        // Reset lights to bright
        const ambientLight = this.scene.getObjectByName('AmbientLight');
        if (ambientLight) ambientLight.intensity = 0.6;
        const dirLight = this.scene.getObjectByName('DirectionalLight');
        if (dirLight) dirLight.intensity = 0.8;
    }

    setupNight() {
        this.scene.background = new THREE.Color(0x000033); // Dark blue/black
        this.scene.fog = new THREE.Fog(0x000033, 10, 40);
        // Dim lights
        const ambientLight = this.scene.getObjectByName('AmbientLight');
        if (ambientLight) ambientLight.intensity = 0.2;
        const dirLight = this.scene.getObjectByName('DirectionalLight');
        if (dirLight) dirLight.intensity = 0.1;
    }

    setupRain() {
        this.scene.background = new THREE.Color(0x405060); // Dark grey
        this.scene.fog = new THREE.Fog(0x405060, 10, 40);

        // Rain particles
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30; // x
            positions[i * 3 + 1] = Math.random() * 20;     // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z

            velocities.push({
                y: -15 - Math.random() * 5,
                x: (Math.random() - 0.5) * 0.5
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xAAAAFF,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.userData = { velocities: velocities };
        this.scene.add(this.particleSystem);

        // Dim lights slightly
        const ambientLight = this.scene.getObjectByName('AmbientLight');
        if (ambientLight) ambientLight.intensity = 0.4;
    }

    setupSnow() {
        this.scene.background = new THREE.Color(0xDDEEFF); // Hazy white/blue
        this.scene.fog = new THREE.Fog(0xDDEEFF, 5, 30);

        // Snow particles
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            velocities.push({
                y: -1 - Math.random() * 1.5,
                x: (Math.random() - 0.5) * 1,
                z: (Math.random() - 0.5) * 1
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.15,
            transparent: true,
            opacity: 0.8
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.userData = { velocities: velocities };
        this.scene.add(this.particleSystem);
    }

    update(deltaTime) {
        if (!this.particleSystem) return;

        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.userData.velocities;

        for (let i = 0; i < velocities.length; i++) {
            // Update position
            positions[i * 3] += velocities[i].x * deltaTime;
            positions[i * 3 + 1] += velocities[i].y * deltaTime;

            if (this.weatherType === 'snow') {
                positions[i * 3 + 2] += velocities[i].z * deltaTime;
            }

            // Reset if below ground
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 20;
                positions[i * 3] = (Math.random() - 0.5) * 30; // Random x reset
                if (this.weatherType === 'snow') {
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
                }
            }
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
}
