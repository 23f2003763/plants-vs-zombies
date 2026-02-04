/**
 * UI Manager - Handles all game UI screens and HUD
 */
import { GAME_CONFIG, GAME_STATES } from '../Constants.js';

export class UIManager {
    constructor(game) {
        this.game = game;

        // UI Elements
        this.elements = {
            // Screens
            mainMenu: document.getElementById('main-menu'),
            settingsMenu: document.getElementById('settings-menu'),
            gameHud: document.getElementById('game-hud'),
            pauseMenu: document.getElementById('pause-menu'),
            winScreen: document.getElementById('win-screen'),
            loseScreen: document.getElementById('lose-screen'),
            loadingScreen: document.getElementById('loading-screen'),

            // HUD Elements
            sunCounter: document.getElementById('sun-counter'),
            sunAmount: document.getElementById('sun-amount'),
            plantBar: document.getElementById('plant-bar'),
            waveText: document.getElementById('wave-text'),
            waveProgressFill: document.getElementById('wave-progress-fill'),
            zombiesRemaining: document.getElementById('zombies-remaining'),
            pauseBtn: document.getElementById('pause-btn'),

            // Buttons
            playBtn: document.getElementById('play-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsBackBtn: document.getElementById('settings-back-btn'),
            resumeBtn: document.getElementById('resume-btn'),
            restartBtn: document.getElementById('restart-btn'),
            quitBtn: document.getElementById('quit-btn'),
            winRestartBtn: document.getElementById('win-restart-btn'),
            winMenuBtn: document.getElementById('win-menu-btn'),
            loseRestartBtn: document.getElementById('lose-restart-btn'),
            loseMenuBtn: document.getElementById('lose-menu-btn'),

            // Settings
            masterVolume: document.getElementById('master-volume'),
            musicVolume: document.getElementById('music-volume'),
            sfxVolume: document.getElementById('sfx-volume')
        };

        // Plant slots
        this.plantSlots = document.querySelectorAll('.plant-slot');
        this.selectedPlantSlot = null;
        this.cooldowns = new Map();

        // State
        this.currentScreen = 'loading';

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main menu
        this.elements.playBtn?.addEventListener('click', () => {
            this.game.startGame();
        });

        this.elements.settingsBtn?.addEventListener('click', () => {
            this.showScreen('settings');
        });

        this.elements.settingsBackBtn?.addEventListener('click', () => {
            this.showScreen('menu');
        });

        // Pause menu
        this.elements.pauseBtn?.addEventListener('click', () => {
            this.game.pauseGame();
        });

        this.elements.resumeBtn?.addEventListener('click', () => {
            this.game.resumeGame();
        });

        this.elements.restartBtn?.addEventListener('click', () => {
            this.game.restartGame();
        });

        this.elements.quitBtn?.addEventListener('click', () => {
            this.game.quitToMenu();
        });

        // Win screen
        this.elements.winRestartBtn?.addEventListener('click', () => {
            this.game.restartGame();
        });

        this.elements.winMenuBtn?.addEventListener('click', () => {
            this.game.quitToMenu();
        });

        // Lose screen
        this.elements.loseRestartBtn?.addEventListener('click', () => {
            this.game.restartGame();
        });

        this.elements.loseMenuBtn?.addEventListener('click', () => {
            this.game.quitToMenu();
        });

        // Plant selection
        this.plantSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                this.selectPlant(slot);
            });
        });

        // Volume controls
        this.elements.masterVolume?.addEventListener('input', (e) => {
            if (this.game.audioManager) {
                this.game.audioManager.setMasterVolume(e.target.value / 100);
            }
        });

        this.elements.musicVolume?.addEventListener('input', (e) => {
            if (this.game.audioManager) {
                this.game.audioManager.setMusicVolume(e.target.value / 100);
            }
        });

        this.elements.sfxVolume?.addEventListener('input', (e) => {
            if (this.game.audioManager) {
                this.game.audioManager.setSfxVolume(e.target.value / 100);
            }
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.game.state === GAME_STATES.PLAYING) {
                    this.game.pauseGame();
                } else if (this.game.state === GAME_STATES.PAUSED) {
                    this.game.resumeGame();
                }
            }

            // Number keys for plant selection
            if (this.game.state === GAME_STATES.PLAYING) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 4) {
                    const slot = this.plantSlots[num - 1];
                    if (slot) this.selectPlant(slot);
                }
            }
        });
    }

    selectPlant(slot) {
        const plantType = slot.dataset.plant;
        const cost = parseInt(slot.dataset.cost);

        // Check if on cooldown
        if (slot.classList.contains('disabled')) return;

        // Check if can afford
        if (!this.game.sunSystem?.canAfford(cost)) {
            this.flashInsufficientFunds(slot);
            return;
        }

        // Deselect previous
        if (this.selectedPlantSlot) {
            this.selectedPlantSlot.classList.remove('selected');
        }

        // Select new (or deselect if same)
        if (this.selectedPlantSlot === slot) {
            this.selectedPlantSlot = null;
            this.game.setSelectedPlant(null);
        } else {
            this.selectedPlantSlot = slot;
            slot.classList.add('selected');
            this.game.setSelectedPlant(plantType);
        }
    }

    flashInsufficientFunds(slot) {
        slot.classList.add('flash-red');
        setTimeout(() => {
            slot.classList.remove('flash-red');
        }, 200);
    }

    deselectPlant() {
        if (this.selectedPlantSlot) {
            this.selectedPlantSlot.classList.remove('selected');
            this.selectedPlantSlot = null;
        }
    }

    startCooldown(plantType, duration) {
        const slot = document.querySelector(`[data-plant="${plantType}"]`);
        if (!slot) return;

        slot.classList.add('disabled', 'on-cooldown');
        const overlay = slot.querySelector('.cooldown-overlay');

        if (overlay) {
            overlay.style.height = '100%';
        }

        const startTime = Date.now();
        this.cooldowns.set(plantType, { startTime, duration, slot, overlay });
    }

    updateCooldowns() {
        for (const [plantType, data] of this.cooldowns) {
            const elapsed = Date.now() - data.startTime;
            const progress = Math.min(elapsed / data.duration, 1);

            if (data.overlay) {
                data.overlay.style.height = `${(1 - progress) * 100}%`;
            }

            if (progress >= 1) {
                data.slot.classList.remove('disabled', 'on-cooldown');
                this.cooldowns.delete(plantType);
            }
        }
    }

    updateSunDisplay(amount) {
        if (this.elements.sunAmount) {
            this.elements.sunAmount.textContent = amount;

            // Flash animation
            this.elements.sunAmount.classList.add('flash');
            setTimeout(() => {
                this.elements.sunAmount.classList.remove('flash');
            }, 200);
        }

        // Update plant affordability
        this.updatePlantAffordability(amount);
    }

    updatePlantAffordability(sunAmount) {
        this.plantSlots.forEach(slot => {
            const cost = parseInt(slot.dataset.cost);
            const isOnCooldown = slot.classList.contains('disabled');

            if (!isOnCooldown) {
                if (sunAmount < cost) {
                    slot.style.opacity = '0.6';
                } else {
                    slot.style.opacity = '1';
                }
            }
        });
    }

    updateWaveDisplay(waveNumber, progress, zombiesRemaining = 0) {
        if (this.elements.waveText) {
            this.elements.waveText.textContent = `Wave ${waveNumber}`;
        }

        if (this.elements.waveProgressFill) {
            this.elements.waveProgressFill.style.width = `${progress * 100}%`;
        }

        if (this.elements.zombiesRemaining) {
            if (zombiesRemaining > 0) {
                this.elements.zombiesRemaining.textContent = `🧟 ${zombiesRemaining} zombies`;
            } else {
                this.elements.zombiesRemaining.textContent = '';
            }
        }
    }

    showScreen(screen) {
        // Hide all screens
        this.elements.mainMenu?.classList.add('hidden');
        this.elements.settingsMenu?.classList.add('hidden');
        this.elements.gameHud?.classList.add('hidden');
        this.elements.pauseMenu?.classList.add('hidden');
        this.elements.winScreen?.classList.add('hidden');
        this.elements.loseScreen?.classList.add('hidden');
        this.elements.loadingScreen?.classList.add('hidden');

        // Show requested screen
        switch (screen) {
            case 'loading':
                this.elements.loadingScreen?.classList.remove('hidden');
                break;
            case 'menu':
                this.elements.mainMenu?.classList.remove('hidden');
                break;
            case 'settings':
                this.elements.settingsMenu?.classList.remove('hidden');
                break;
            case 'game':
                this.elements.gameHud?.classList.remove('hidden');
                break;
            case 'pause':
                this.elements.gameHud?.classList.remove('hidden');
                this.elements.pauseMenu?.classList.remove('hidden');
                break;
            case 'win':
                this.elements.winScreen?.classList.remove('hidden');
                break;
            case 'lose':
                this.elements.loseScreen?.classList.remove('hidden');
                break;
        }

        this.currentScreen = screen;
    }

    update(deltaTime) {
        this.updateCooldowns();
    }

    reset() {
        this.deselectPlant();
        this.cooldowns.clear();

        // Reset cooldown overlays
        this.plantSlots.forEach(slot => {
            slot.classList.remove('disabled', 'on-cooldown');
            const overlay = slot.querySelector('.cooldown-overlay');
            if (overlay) {
                overlay.style.height = '0%';
            }
        });
    }
}
