/**
 * Time System - Fixed timestep implementation
 */
import { GAME_CONFIG } from '../Constants.js';

export class Time {
    constructor() {
        this.lastTime = performance.now();
        this.deltaTime = 0;
        this.fixedDeltaTime = GAME_CONFIG.TIME.FIXED_TIMESTEP;
        this.accumulator = 0;
        this.timeScale = 1;
        this.elapsedTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.fpsUpdateInterval = 500;
        this.lastFpsUpdate = 0;
        this.framesSinceLastFpsUpdate = 0;
    }

    tick() {
        const currentTime = performance.now();
        let rawDelta = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Clamp delta to prevent spiral of death
        rawDelta = Math.min(rawDelta, GAME_CONFIG.TIME.MAX_DELTA);

        this.deltaTime = rawDelta * this.timeScale;
        this.accumulator += this.deltaTime;
        this.elapsedTime += this.deltaTime;
        this.frameCount++;

        // FPS calculation
        this.framesSinceLastFpsUpdate++;
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.framesSinceLastFpsUpdate * 1000) / (currentTime - this.lastFpsUpdate));
            this.lastFpsUpdate = currentTime;
            this.framesSinceLastFpsUpdate = 0;
        }

        return this.deltaTime;
    }

    shouldUpdateFixed() {
        if (this.accumulator >= this.fixedDeltaTime) {
            this.accumulator -= this.fixedDeltaTime;
            return true;
        }
        return false;
    }

    getFixedDeltaTime() {
        return this.fixedDeltaTime * this.timeScale;
    }

    setTimeScale(scale) {
        this.timeScale = Math.max(0, Math.min(scale, 3));
    }

    pause() {
        this.timeScale = 0;
    }

    resume() {
        this.timeScale = 1;
    }

    reset() {
        this.lastTime = performance.now();
        this.deltaTime = 0;
        this.accumulator = 0;
        this.elapsedTime = 0;
        this.frameCount = 0;
    }

    getFPS() {
        return this.fps;
    }

    getElapsed() {
        return this.elapsedTime;
    }
}
