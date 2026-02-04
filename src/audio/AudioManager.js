/**
 * Audio Manager - Web Audio API wrapper with procedural sound synthesis
 */
import { GAME_CONFIG } from '../Constants.js';

export class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        // Volume levels
        this.masterVolume = GAME_CONFIG.AUDIO.MASTER_VOLUME;
        this.musicVolume = GAME_CONFIG.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = GAME_CONFIG.AUDIO.SFX_VOLUME;

        // Sound buffers
        this.sounds = new Map();

        // Music
        this.currentMusic = null;
        this.musicSource = null;

        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();

            // Create gain nodes
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this.masterVolume;

            this.musicGain = this.context.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = this.musicVolume;

            this.sfxGain = this.context.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.sfxVolume;

            // Generate procedural sounds
            await this.generateSounds();

            this.initialized = true;
        } catch (e) {
            console.warn('Audio initialization failed:', e);
        }
    }

    async generateSounds() {
        // Shoot sound - short pop
        this.sounds.set('shoot', this.createShootSound());

        // Hit sound - impact
        this.sounds.set('hit', this.createHitSound());

        // Explosion sound
        this.sounds.set('explosion', this.createExplosionSound());

        // Zombie groan
        this.sounds.set('zombieGroan', this.createZombieGroan());

        // Zombie death
        this.sounds.set('zombieDeath', this.createZombieDeath());

        // Plant death
        this.sounds.set('plantDeath', this.createPlantDeath());

        // Sun collect
        this.sounds.set('sunCollect', this.createSunCollect());

        // Plant place
        this.sounds.set('plantPlace', this.createPlantPlace());

        // UI click
        this.sounds.set('click', this.createClickSound());

        // Generate background music buffer
        this.sounds.set('music', this.createBackgroundMusic());
    }

    createShootSound() {
        const duration = 0.1;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Short high frequency pop with quick decay
            data[i] = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-t * 40) * 0.5;
        }

        return buffer;
    }

    createHitSound() {
        const duration = 0.15;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Impact thud
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.4;
        }

        return buffer;
    }

    createExplosionSound() {
        const duration = 0.5;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Low rumble with noise
            const noise = Math.random() * 2 - 1;
            const bass = Math.sin(t * 60 * Math.PI * 2);
            data[i] = (noise * 0.5 + bass * 0.5) * Math.exp(-t * 6) * 0.8;
        }

        return buffer;
    }

    createZombieGroan() {
        const duration = 0.8;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Low growling sound with modulation
            const freq = 80 + Math.sin(t * 5) * 20;
            data[i] = Math.sin(t * freq * Math.PI * 2) *
                (1 + Math.sin(t * 10) * 0.3) *
                Math.exp(-t * 2) * 0.3;
        }

        return buffer;
    }

    createZombieDeath() {
        const duration = 0.6;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Descending groan
            const freq = 150 - t * 200;
            data[i] = Math.sin(t * Math.max(freq, 40) * Math.PI * 2) *
                Math.exp(-t * 4) * 0.4;
        }

        return buffer;
    }

    createPlantDeath() {
        const duration = 0.3;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Squish sound
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.3;
        }

        return buffer;
    }

    createSunCollect() {
        const duration = 0.4;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Bright ascending chime with harmonics
            const freq1 = 800 + t * 600;
            const freq2 = 1200 + t * 400;
            const chime1 = Math.sin(t * freq1 * Math.PI * 2) * Math.exp(-t * 8) * 0.4;
            const chime2 = Math.sin(t * freq2 * Math.PI * 2) * Math.exp(-t * 10) * 0.25;
            // Add a pleasant bell-like overtone
            const bell = Math.sin(t * 1600 * Math.PI * 2) * Math.exp(-t * 15) * 0.15;
            data[i] = (chime1 + chime2 + bell) * 0.6;
        }

        return buffer;
    }

    createPlantPlace() {
        const duration = 0.15;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            // Soft thud with pop
            const thud = Math.sin(t * 100 * Math.PI * 2) * Math.exp(-t * 30);
            const pop = Math.sin(t * 400 * Math.PI * 2) * Math.exp(-t * 50);
            data[i] = (thud * 0.5 + pop * 0.3) * 0.5;
        }

        return buffer;
    }

    createClickSound() {
        const duration = 0.05;
        const buffer = this.context.createBuffer(1, duration * this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / this.context.sampleRate;
            data[i] = Math.sin(t * 1000 * Math.PI * 2) * Math.exp(-t * 100) * 0.3;
        }

        return buffer;
    }

    createBackgroundMusic() {
        // Simple procedural ambient music
        const duration = 16; // 16 second loop
        const buffer = this.context.createBuffer(2, duration * this.context.sampleRate, this.context.sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        // Chord frequencies (C major variations)
        const chords = [
            [261.63, 329.63, 392.00], // C major
            [220.00, 277.18, 329.63], // A minor
            [246.94, 293.66, 369.99], // B dim
            [196.00, 246.94, 293.66], // G major
        ];

        for (let i = 0; i < leftData.length; i++) {
            const t = i / this.context.sampleRate;
            const chordIndex = Math.floor((t / 4) % 4);
            const chord = chords[chordIndex];

            let sample = 0;
            for (const freq of chord) {
                // Soft pad sound
                sample += Math.sin(t * freq * Math.PI * 2) * 0.1;
                sample += Math.sin(t * freq * 2 * Math.PI * 2) * 0.03; // Slight overtone
            }

            // Add subtle movement
            sample *= 0.8 + Math.sin(t * 0.5) * 0.2;

            // Fade at loop points
            const fadeTime = 0.5;
            let fade = 1;
            if (t < fadeTime) fade = t / fadeTime;
            if (t > duration - fadeTime) fade = (duration - t) / fadeTime;

            sample *= fade * 0.15; // Keep it quiet

            leftData[i] = sample;
            rightData[i] = sample * (0.9 + Math.sin(t * 0.3) * 0.1); // Slight stereo movement
        }

        return buffer;
    }

    playSound(name, volume = 1) {
        if (!this.initialized || !this.sounds.has(name)) return;

        // Resume context if suspended
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const buffer = this.sounds.get(name);
        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(this.sfxGain);

        source.start();
    }

    playMusic() {
        if (!this.initialized || !this.sounds.has('music')) return;

        // Stop current music if playing
        this.stopMusic();

        // Resume context if suspended
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const buffer = this.sounds.get('music');
        this.musicSource = this.context.createBufferSource();
        this.musicSource.buffer = buffer;
        this.musicSource.loop = true;
        this.musicSource.connect(this.musicGain);
        this.musicSource.start();
    }

    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop();
            } catch (e) {
                // Already stopped
            }
            this.musicSource = null;
        }
    }

    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    setSfxVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    suspend() {
        if (this.context && this.context.state === 'running') {
            this.context.suspend();
        }
    }

    dispose() {
        this.stopMusic();
        if (this.context) {
            this.context.close();
        }
    }
}
