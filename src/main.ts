import Phaser from 'phaser';
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
platform.initialize();