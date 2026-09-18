import { Scene } from 'phaser';
import { TubeBot } from '../objects/TubeBot';
import { YouTubeChannel } from '../objects/YouTubeChannel';
import { COLS, MOVE_DELAY } from '../config/GameConfig';
import { platform } from '../../main';

interface ChannelInfo { key: string; path: string; }

export class GameScene extends Scene {
    private bot!: TubeBot;
    private channel!: YouTubeChannel;
    private scoreText!: Phaser.GameObjects.Text;
    private channelKeys: string[] = [];
    private gridSize = 0;
    private score = 0;
    private isGameOver = false;
    private gw = 0;
    private gh = 0;
    private startTime = 0;

    private gameContainer!: Phaser.GameObjects.Container;
    private uiContainer!: Phaser.GameObjects.Container;

    constructor() { super('GameScene'); }

    preload() {
        this.load.image('bot_head', 'assets/cubaplay_bot.png');
        const channels: ChannelInfo[] = [
            { key: 'ch_neuronita', path: 'assets/channels/cubanos.png' },
            { key: 'ch_dany_balo', path: 'assets/channels/eliecer.png' },
            { key: 'ch_alejandro', path: 'assets/channels/pichy.png' },
            { key: 'ch_lachicadelos', path: 'assets/channels/jamaliche.png' },
        ];
        channels.forEach(c => this.load.image(c.key, c.path));
        this.channelKeys = channels.map(c => c.key);

        this.load.audio('sfx_eat', 'assets/audio/eat.mp3');
        this.load.audio('sfx_crash', 'assets/audio/crash.mp3');
    }

    create() {
        this.isGameOver = false;
        this.score = 0;
        this.startTime = Date.now();

        const { width, height } = this.cameras.main;
        const isLandscape = width > height;

        let gameW: number, gameH: number, uiW: number, uiH: number, uiX: number, uiY: number;

        if (isLandscape) {
            gameW = width * 0.8;
            gameH = height;
            uiW = width * 0.2;
            uiH = height;
            uiX = gameW;
            uiY = 0;
        } else {
            gameW = width;
            gameH = height * 0.8;
            uiW = width;
            uiH = height * 0.2;
            uiX = 0;
            uiY = gameH;
        }

        this.gameContainer = this.add.container(0, 0).setSize(gameW, gameH);
        this.uiContainer = this.add.container(uiX, uiY).setSize(uiW, uiH);

        // --- BORDE Y MARGEN VISUAL ---
        
        // 1. Borde exterior (Marco)
        this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH)
            .setStrokeStyle(4, 0x555555) // Borde gris claro de 4px
            .setDepth(-5);

        // 2. Fondo del área de juego (ligeramente más pequeño para crear margen interno)
        const padding = 4; // Margen interno en píxeles
        this.add.rectangle(gameW / 2, gameH / 2, gameW - padding * 2, gameH - padding * 2, 0x222222)
            .setDepth(-10);

        // Fondo del área UI
        this.add.rectangle(uiX + uiW / 2, uiY + uiH / 2, uiW, uiH, 0x111111).setDepth(-10);

        // --- LÓGICA DEL JUEGO ---

        this.gridSize = Math.floor((gameW - padding * 2) / COLS); // Ajustamos grid al área útil
        this.gw = Math.floor((gameW - padding * 2) / this.gridSize);
        this.gh = Math.floor((gameH - padding * 2) / this.gridSize);

        // Centramos el bot considerando el padding
        const startX = Math.floor(this.gw / 2);
        const startY = Math.floor(this.gh / 2);

        this.bot = new TubeBot(this, startX, startY, this.gridSize);
        this.spawnChannel();

        this.createUI(isLandscape);
        this.setupControls();

        this.time.addEvent({
            delay: MOVE_DELAY,
            callback: this.tick,
            callbackScope: this,
            loop: true
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.bot.destroy();
            this.channel?.destroy();
        });
    }

    private createUI(isLandscape: boolean) {
        const { width, height } = this.uiContainer;

        this.scoreText = this.add.text(width / 2, 10, 'Youtubers: 0', {
            fontSize: '18px', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.uiContainer.add(this.scoreText);

        const btnSize = Math.min(width, height) * 0.15;
        const centerX = width / 2;
        const centerY = height / 2;
        const spacing = btnSize * 1.2;

        const createBtn = (x: number, y: number, label: string, dx: number, dy: number) => {
            const circle = this.add.circle(x, y, btnSize, 0x444444).setInteractive();
            const text = this.add.text(x, y, label, { fontSize: `${btnSize}px`, color: '#fff' }).setOrigin(0.5);

            circle.on('pointerdown', () => {
                if (!this.isGameOver) this.bot.changeDirection(dx, dy);
                circle.setFillStyle(0x666666);
            });
            circle.on('pointerup', () => circle.setFillStyle(0x444444));

            this.uiContainer.add([circle, text]);
        };

        createBtn(centerX, centerY - spacing, '▲', 0, -1);
        createBtn(centerX, centerY + spacing, '▼', 0, 1);
        createBtn(centerX - spacing, centerY, '◀', -1, 0);
        createBtn(centerX + spacing, centerY, '▶', 1, 0);
    }

    private tick() {
        if (this.isGameOver) return;
        const pos = this.bot.move();

        if (this.checkCollision(pos.x, pos.y)) {
            this.sound.play('sfx_crash', { volume: 0.7 });
            this.gameOver();
            return;
        }

        if (pos.x === this.channel.gridX && pos.y === this.channel.gridY) {
            this.sound.play('sfx_eat', { volume: 0.6 });
            this.bot.growAfterNextMove(this.channel.textureKey);
            this.score++;
            this.scoreText.setText('Youtubers: ' + this.score);
            this.spawnChannel();
        }
    }

    private checkCollision(x: number, y: number) {
        if (x < 0 || x >= this.gw || y < 0 || y >= this.gh) return true;
        return this.bot.hitsSelf(x, y);
    }

    private spawnChannel() {
        if (this.channel) this.channel.destroy();
        let x = 0, y = 0, attempts = 0;
        do {
            x = Math.floor(Math.random() * this.gw);
            y = Math.floor(Math.random() * this.gh);
            attempts++;
        } while (this.bot.occupies(x, y) && attempts < 500);

        const key = this.channelKeys.length ? this.channelKeys[Math.floor(Math.random() * this.channelKeys.length)] : undefined;
        this.channel = new YouTubeChannel(this, x, y, this.gridSize, key);
    }

    private setupControls() {
        const onKey = (e: KeyboardEvent) => {
            if (this.isGameOver) return;
            if (e.code === 'ArrowUp') this.bot.changeDirection(0, -1);
            if (e.code === 'ArrowDown') this.bot.changeDirection(0, 1);
            if (e.code === 'ArrowLeft') this.bot.changeDirection(-1, 0);
            if (e.code === 'ArrowRight') this.bot.changeDirection(1, 0);
        };
        this.input.keyboard!.on('keydown', onKey);
    }

    private async gameOver() {
        this.isGameOver = true;
        try {
            await platform.submitResult({
                gameId: 'cubaplay-youtubers',
                gameVersion: '1.0.0',
                score: this.score,
                durationMs: Date.now() - this.startTime,
                statistics: { captured: this.score }
            });
        } catch (e) { console.warn(e); }
        this.scene.start('GameOverScene', { score: this.score });
    }
}