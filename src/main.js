/**
 * Entry Point - Initialize and start the game
 */
import { Game } from './Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌻 Plants vs Zombies 3D - Starting...');

    const game = new Game();

    try {
        await game.initialize();
        console.log('✅ Game initialized');

        // Start the game loop
        game.gameLoop();
        console.log('🎮 Game loop started');

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            game.dispose();
        });

        // Expose game for debugging
        window.game = game;

    } catch (error) {
        console.error('❌ Failed to start game:', error);

        // Show error to user
        const loadingText = document.querySelector('.loading-content p');
        if (loadingText) {
            loadingText.textContent = 'Failed to load game. Please refresh.';
            loadingText.style.color = '#ff4444';
        }
    }
});
