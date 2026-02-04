/**
 * Grid System - Manages the lawn grid and plant placement
 */
import * as THREE from 'three';
import { GAME_CONFIG, ENTITY_TYPES } from '../Constants.js';
import { Components } from '../engine/ECS.js';

export class GridSystem {
    constructor(world, scene, modelGenerator) {
        this.world = world;
        this.scene = scene;
        this.modelGenerator = modelGenerator;

        // Grid state
        this.grid = [];
        this.tiles = [];

        // Placement preview
        this.placementPreview = null;
        this.selectedPlant = null;
        this.previewValid = false;

        this.initializeGrid();
    }

    initializeGrid() {
        const { ROWS, COLS, CELL_SIZE, OFFSET_X, OFFSET_Z } = GAME_CONFIG.GRID;

        // Create ground plane
        const groundGeom = new THREE.PlaneGeometry(COLS * CELL_SIZE + 2, ROWS * CELL_SIZE + 2);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.06;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create grid cells
        for (let row = 0; row < ROWS; row++) {
            this.grid[row] = [];
            this.tiles[row] = [];

            for (let col = 0; col < COLS; col++) {
                // Grid data
                this.grid[row][col] = {
                    occupied: false,
                    entity: null
                };

                // Create tile mesh
                const tile = this.modelGenerator.createGrassTile(row, col);
                const worldPos = this.gridToWorld(row, col);
                tile.position.set(worldPos.x, 0, worldPos.z);
                this.scene.add(tile);
                this.tiles[row][col] = tile;
            }
        }

        // Create placement preview
        this.placementPreview = this.modelGenerator.createPlacementPreview();
        this.placementPreview.visible = false;
        this.scene.add(this.placementPreview);
    }

    gridToWorld(row, col) {
        const { CELL_SIZE, OFFSET_X, OFFSET_Z } = GAME_CONFIG.GRID;
        return new THREE.Vector3(
            OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
            0,
            OFFSET_Z + row * CELL_SIZE + CELL_SIZE / 2
        );
    }

    worldToGrid(worldPos) {
        const { CELL_SIZE, OFFSET_X, OFFSET_Z } = GAME_CONFIG.GRID;
        const col = Math.floor((worldPos.x - OFFSET_X) / CELL_SIZE);
        const row = Math.floor((worldPos.z - OFFSET_Z) / CELL_SIZE);
        return { row, col };
    }

    isValidCell(row, col) {
        const { ROWS, COLS } = GAME_CONFIG.GRID;
        return row >= 0 && row < ROWS && col >= 0 && col < COLS;
    }

    isCellEmpty(row, col) {
        if (!this.isValidCell(row, col)) return false;
        return !this.grid[row][col].occupied;
    }

    setSelectedPlant(plantType) {
        this.selectedPlant = plantType;
        if (!plantType) {
            this.placementPreview.visible = false;
        }
    }

    updatePreview(worldPos) {
        if (!this.selectedPlant) {
            this.placementPreview.visible = false;
            return;
        }

        const { row, col } = this.worldToGrid(worldPos);

        if (this.isValidCell(row, col)) {
            const gridPos = this.gridToWorld(row, col);
            this.placementPreview.position.set(gridPos.x, 0.06, gridPos.z);
            this.placementPreview.visible = true;

            // Update color based on validity
            const isEmpty = this.isCellEmpty(row, col);
            this.previewValid = isEmpty;
            this.placementPreview.material.color.setHex(isEmpty ? 0x00FF00 : 0xFF0000);
        } else {
            this.placementPreview.visible = false;
            this.previewValid = false;
        }
    }

    placePlant(row, col, entity) {
        if (!this.isValidCell(row, col) || !this.isCellEmpty(row, col)) {
            return false;
        }

        this.grid[row][col].occupied = true;
        this.grid[row][col].entity = entity;

        // Position the plant
        const worldPos = this.gridToWorld(row, col);
        if (entity.mesh) {
            entity.mesh.position.set(worldPos.x, 0, worldPos.z);
        }

        return true;
    }

    removePlant(row, col) {
        if (!this.isValidCell(row, col)) return null;

        const entity = this.grid[row][col].entity;
        this.grid[row][col].occupied = false;
        this.grid[row][col].entity = null;

        return entity;
    }

    getPlantAt(row, col) {
        if (!this.isValidCell(row, col)) return null;
        return this.grid[row][col].entity;
    }

    getPlantsInRow(row) {
        const plants = [];
        if (row < 0 || row >= GAME_CONFIG.GRID.ROWS) return plants;

        for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
            if (this.grid[row][col].occupied && this.grid[row][col].entity) {
                plants.push({
                    col,
                    entity: this.grid[row][col].entity
                });
            }
        }
        return plants;
    }

    getPlantColumn(entity) {
        for (let row = 0; row < GAME_CONFIG.GRID.ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
                if (this.grid[row][col].entity === entity) {
                    return col;
                }
            }
        }
        return -1;
    }

    getPlantRow(entity) {
        for (let row = 0; row < GAME_CONFIG.GRID.ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
                if (this.grid[row][col].entity === entity) {
                    return row;
                }
            }
        }
        return -1;
    }

    getRowForZ(z) {
        const { CELL_SIZE, OFFSET_Z } = GAME_CONFIG.GRID;
        const row = Math.floor((z - OFFSET_Z) / CELL_SIZE);
        return Math.max(0, Math.min(row, GAME_CONFIG.GRID.ROWS - 1));
    }

    clear() {
        for (let row = 0; row < GAME_CONFIG.GRID.ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
                this.grid[row][col].occupied = false;
                this.grid[row][col].entity = null;
            }
        }
    }
}
