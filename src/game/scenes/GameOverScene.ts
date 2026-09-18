import { Scene } from 'phaser';

export class GameOverScene extends Scene {
    constructor() { super('GameOverScene'); }

    create(data: { score: number }) {
        const { width, height } = this.cameras.main;

        // 1. Fondo oscuro semitransparente sobre el juego anterior
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setDepth(10);

        // 2. Panel central
        const panelW = width * 0.85;
        const panelH = height * 0.5;
        const panel = this.add.rectangle(width / 2, height / 2, panelW, panelH, 0x1a1a1a)
            .setStrokeStyle(4, 0xff0000)
            .setDepth(11);

        // 3. Texto Game Over
        this.add.text(width / 2, height / 2 - 80, 'GAME OVER', {
            fontSize: '40px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(12);

        // 4. Score Final
        this.add.text(width / 2, height / 2, `Score: ${data.score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(12);

        // 5. Botón Retry
        const btn = this.add.text(width / 2, height / 2 + 80, '🔄 TRY AGAIN', {
            fontSize: '24px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5).setInteractive().setDepth(13);

        btn.on('pointerdown', () => this.scene.start('GameScene'));
    }
}