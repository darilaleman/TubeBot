import Phaser from 'phaser';
export class Obstacle {
    public gridX: number; public gridY: number;
    constructor(scene: Phaser.Scene, x: number, y: number, gs: number) {
        this.gridX = x; this.gridY = y;
        scene.add.rectangle(x*gs+gs/2, y*gs+gs/2, gs-2, gs-2, 0x555555);
    }
}