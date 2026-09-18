# bot.ps1 - Generador de proyecto TubeBot Snake (Versión Final)

Write-Host "🚀 Iniciando creación de proyecto..." -ForegroundColor Cyan

# Función segura para escribir archivos
function New-File {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path -Parent
    # Solo crear directorio si la ruta tiene padre y no es vacío
    if ($dir -and $dir -ne "") { 
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null } 
    }
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

# 1. Carpetas
$folders = @("src/game/scenes", "src/game/objects", "src/game/config", "src/cubaplay", "public/images")
foreach ($f in $folders) {
    New-Item -ItemType Directory -Force -Path $f | Out-Null
}

# 2. package.json
New-File "package.json" '{
  "name": "tubebot-snake",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "phaser": "^3.60.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.3.0"
  }
}'

# 3. tsconfig.json
New-File "tsconfig.json" '{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["src"]
}'

# 4. vite.config.ts
New-File "vite.config.ts" "import { defineConfig } from 'vite'
export default defineConfig({
  base: './',
  build: { outDir: 'dist' }
})"

# 5. index.html
New-File "index.html" '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TubeBot Snake</title>
    <link rel="stylesheet" href="/src/styles.css" />
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
</body>
</html>'

# 6. styles.css
New-File "src/styles.css" "body { margin: 0; overflow: hidden; background: #1a1a1a; touch-action: none; }
#app { width: 100vw; height: 100vh; }"

# 7. GamePlatform.ts
New-File "src/cubaplay/GamePlatform.ts" "export interface GameResult {
    gameId: string; gameVersion: string; score: number; durationMs: number;
    statistics?: Record<string, any>;
}
export interface GamePlatform {
    initialize(): Promise<void>;
    getPlayer(): Promise<{id: string}>;
    startGame(): Promise<{sessionId: string}>;
    submitResult(result: GameResult): Promise<any>;
    exitGame(): void;
}"

# 8. WebTestPlatform.ts
New-File "src/cubaplay/WebTestPlatform.ts" "import { GamePlatform, GameResult } from './GamePlatform';
export class WebTestPlatform implements GamePlatform {
    async initialize() { console.log('Init'); }
    async getPlayer() { return { id: 'test-user' }; }
    async startGame() { return { sessionId: 'test-123' }; }
    async submitResult(r: GameResult) { 
        console.log('Score:', r.score); 
        alert('Game Over! Score: ' + r.score); 
        return { success: true }; 
    }
    exitGame() {}
}"

# 9. CubaPlayPlatform.ts (Stub)
New-File "src/cubaplay/CubaPlayPlatform.ts" "import { GamePlatform, GameResult } from './GamePlatform';
export class CubaPlayPlatform implements GamePlatform {
    async initialize() {}
    async getPlayer() { return { id: 'cp-user' }; }
    async startGame() { return { sessionId: 'secure' }; }
    async submitResult(r: GameResult) { return { success: true }; }
    exitGame() {}
}"

# 10. GameConfig.ts
New-File "src/game/config/GameConfig.ts" "export const GRID_SIZE = 20;
export const MOVE_DELAY = 150;"

# 11. TubeBot.ts
New-File "src/game/objects/TubeBot.ts" "import Phaser from 'phaser';
export class TubeBot {
    private scene: Phaser.Scene;
    private segments: Phaser.GameObjects.Rectangle[] = [];
    private dir = { x: 1, y: 0 };
    private nextDir = { x: 1, y: 0 };
    private gs: number;

    constructor(scene: Phaser.Scene, x: number, y: number, gs: number) {
        this.scene = scene; this.gs = gs;
        this.addSeg(x, y, 0xff0000);
        this.addSeg(x-1, y, 0x00ff00);
        this.addSeg(x-2, y, 0x00ff00);
    }
    private addSeg(x: number, y: number, c: number) {
        const s = this.scene.add.rectangle(x*this.gs+this.gs/2, y*this.gs+this.gs/2, this.gs-2, this.gs-2, c);
        this.segments.push(s);
    }
    public changeDirection(x: number, y: number) {
        if (this.dir.x !== -x || this.dir.y !== -y) this.nextDir = {x, y};
    }
    public move() {
        this.dir = this.nextDir;
        const h = this.segments[0];
        const gx = Math.floor(h.x/this.gs), gy = Math.floor(h.y/this.gs);
        for(let i=this.segments.length-1; i>0; i--) {
            this.segments[i].x = this.segments[i-1].x;
            this.segments[i].y = this.segments[i-1].y;
        }
        h.x = (gx+this.dir.x)*this.gs+this.gs/2;
        h.y = (gy+this.dir.y)*this.gs+this.gs/2;
        return { x: gx+this.dir.x, y: gy+this.dir.y };
    }
    public grow() {
        const t = this.segments[this.segments.length-1];
        this.addSeg(Math.floor(t.x/this.gs), Math.floor(t.y/this.gs), 0x00ff00);
    }
    public removeTail() {
        if(this.segments.length > 3) { const t = this.segments.pop(); t?.destroy(); }
    }
    public hitsSelf(x: number, y: number) {
        for(let i=1; i<this.segments.length; i++) {
            const s = this.segments[i];
            if(Math.floor(s.x/this.gs)===x && Math.floor(s.y/this.gs)===y) return true;
        }
        return false;
    }
}"

# 12. YouTubeChannel.ts
New-File "src/game/objects/YouTubeChannel.ts" "import Phaser from 'phaser';
export class YouTubeChannel {
    public gridX: number; public gridY: number;
    constructor(scene: Phaser.Scene, x: number, y: number, gs: number) {
        this.gridX = x; this.gridY = y;
        scene.add.rectangle(x*gs+gs/2, y*gs+gs/2, gs-4, gs-4, 0xff0000);
        scene.add.rectangle(x*gs+gs/2, y*gs+gs/2, gs/3, gs/3, 0xffffff);
    }
}"

# 13. Obstacle.ts
New-File "src/game/objects/Obstacle.ts" "import Phaser from 'phaser';
export class Obstacle {
    public gridX: number; public gridY: number;
    constructor(scene: Phaser.Scene, x: number, y: number, gs: number) {
        this.gridX = x; this.gridY = y;
        scene.add.rectangle(x*gs+gs/2, y*gs+gs/2, gs-2, gs-2, 0x555555);
    }
}"

# 14. BootScene.ts
New-File "src/game/scenes/BootScene.ts" "import { Scene } from 'phaser';
export class BootScene extends Scene {
    constructor() { super('BootScene'); }
    create() { this.scene.start('MenuScene'); }
}"

# 15. MenuScene.ts
New-File "src/game/scenes/MenuScene.ts" "import { Scene } from 'phaser';
export class MenuScene extends Scene {
    constructor() { super('MenuScene'); }
    create() {
        const {width, height} = this.cameras.main;
        this.add.text(width/2, height/3, 'TUBEBOT SNAKE', {fontSize:'32px', color:'#fff'}).setOrigin(0.5);
        const btn = this.add.text(width/2, height/2, 'START', {fontSize:'24px', color:'#0f0', backgroundColor:'#000', padding:{x:20,y:10}}).setOrigin(0.5).setInteractive();
        btn.on('pointerdown', () => this.scene.start('GameScene'));
    }
}"

# 16. GameOverScene.ts
New-File "src/game/scenes/GameOverScene.ts" "import { Scene } from 'phaser';
export class GameOverScene extends Scene {
    constructor() { super('GameOverScene'); }
    create(data: {score: number}) {
        const {width, height} = this.cameras.main;
        this.add.text(width/2, height/3, 'GAME OVER', {fontSize:'32px', color:'#f00'}).setOrigin(0.5);
        this.add.text(width/2, height/2, 'Score: '+data.score, {fontSize:'24px', color:'#fff'}).setOrigin(0.5);
        const btn = this.add.text(width/2, height*0.7, 'RETRY', {fontSize:'24px', color:'#0f0', backgroundColor:'#000', padding:{x:20,y:10}}).setOrigin(0.5).setInteractive();
        btn.on('pointerdown', () => this.scene.start('GameScene'));
    }
}"

# 17. GameScene.ts
New-File "src/game/scenes/GameScene.ts" "import { Scene } from 'phaser';
import { TubeBot } from '../objects/TubeBot';
import { YouTubeChannel } from '../objects/YouTubeChannel';
import { Obstacle } from '../objects/Obstacle';
import { GRID_SIZE, MOVE_DELAY } from '../config/GameConfig';
import { platform } from '../../main';

export class GameScene extends Scene {
    private bot!: TubeBot;
    private channel!: YouTubeChannel;
    private obstacles: Obstacle[] = [];
    private score = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private isGameOver = false;
    private gw = 0; private gh = 0;
    private startTime = 0;

    constructor() { super('GameScene'); }

    create() {
        this.startTime = Date.now();
        const {width, height} = this.cameras.main;
        this.gw = Math.floor(width/GRID_SIZE); this.gh = Math.floor(height/GRID_SIZE);
        this.scoreText = this.add.text(10, 10, 'Channels: 0', {fontSize:'20px', color:'#fff'});
        
        this.bot = new TubeBot(this, Math.floor(this.gw/2), Math.floor(this.gh/2), GRID_SIZE);
        
        for(let i=0; i<5; i++) {
            let x, y;
            do { x=Math.floor(Math.random()*this.gw); y=Math.floor(Math.random()*this.gh); } 
            while(this.isOccupied(x,y));
            this.obstacles.push(new Obstacle(this, x, y, GRID_SIZE));
        }
        this.spawnChannel();

        this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
            if(this.isGameOver) return;
            if(e.code==='ArrowUp') this.bot.changeDirection(0,-1);
            if(e.code==='ArrowDown') this.bot.changeDirection(0,1);
            if(e.code==='ArrowLeft') this.bot.changeDirection(-1,0);
            if(e.code==='ArrowRight') this.bot.changeDirection(1,0);
        });

        let sp: Phaser.Input.Pointer|null = null;
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => sp = p);
        this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if(!sp || this.isGameOver) return;
            const dx = p.x-sp.x, dy = p.y-sp.y;
            if(Math.abs(dx)>Math.abs(dy)) this.bot.changeDirection(dx>0?1:-1, 0);
            else this.bot.changeDirection(0, dy>0?1:-1);
            sp = null;
        });

        this.time.addEvent({ delay: MOVE_DELAY, callback: this.update, callbackScope: this, loop: true });
    }

    private update() {
        if(this.isGameOver) return;
        const pos = this.bot.move();
        if(this.checkCollision(pos.x, pos.y)) { this.gameOver(); return; }
        if(pos.x===this.channel.gridX && pos.y===this.channel.gridY) {
            this.score++;
            this.scoreText.setText('Channels: '+this.score);
            this.bot.grow();
            this.spawnChannel();
        } else {
            this.bot.removeTail();
        }
    }

    private checkCollision(x: number, y: number) {
        if(x<0||x>=this.gw||y<0||y>=this.gh) return true;
        for(const o of this.obstacles) if(o.gridX===x&&o.gridY===y) return true;
        return this.bot.hitsSelf(x,y);
    }

    private spawnChannel() {
        let x, y;
        do { x=Math.floor(Math.random()*this.gw); y=Math.floor(Math.random()*this.gh); } 
        while(this.isOccupied(x,y));
        this.channel = new YouTubeChannel(this, x, y, GRID_SIZE);
    }

    private isOccupied(x: number, y: number) {
        if(this.bot.hitsSelf(x,y)) return true;
        for(const o of this.obstacles) if(o.gridX===x&&o.gridY===y) return true;
        return false;
    }

    private async gameOver() {
        this.isGameOver = true;
        await platform.submitResult({
            gameId: 'tubebot-snake', gameVersion: '1.0.0', score: this.score,
            durationMs: Date.now()-this.startTime, statistics: {collected: this.score}
        });
        this.scene.start('GameOverScene', {score: this.score});
    }
}"

# 18. main.ts
New-File "src/main.ts" "import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { WebTestPlatform } from './cubaplay/WebTestPlatform';

export const platform = new WebTestPlatform();

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, parent: 'app', width: window.innerWidth, height: window.innerHeight,
    backgroundColor: '#1a1a1a',
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
window.addEventListener('resize', () => location.reload());
platform.initialize();"

Write-Host "✅ Proyecto generado correctamente." -ForegroundColor Green
Write-Host "👉 Ejecuta 'npm install' y luego 'npm run dev'." -ForegroundColor Yellow