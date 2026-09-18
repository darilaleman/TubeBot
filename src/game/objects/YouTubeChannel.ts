import Phaser from 'phaser';
import { SPRITE_SCALE } from '../config/GameConfig';

export class YouTubeChannel {
    public gridX: number;
    public gridY: number;
    public readonly textureKey: string;

    private sprite: Phaser.GameObjects.GameObject;
    private maskShape?: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number, textureKey?: string) {
        this.gridX = x;
        this.gridY = y;
        this.textureKey = textureKey ?? '';

        const px = x * size + size / 2;
        const py = y * size + size / 2;
        const d = size * SPRITE_SCALE;

        if (textureKey && scene.textures.exists(textureKey)) {
            const image = scene.add.image(px, py, textureKey).setDisplaySize(d, d).setDepth(45);

            // La máscara nunca se añade a un Container ni a la escena;
            // se crea "suelta" (add=false), solo como plantilla de recorte.
            const maskShape = scene.make.graphics({}, false);
            maskShape.fillStyle(0xffffff);
            maskShape.fillCircle(0, 0, d / 2);
            maskShape.setPosition(px, py);
            image.setMask(maskShape.createGeometryMask());

            this.sprite = image;
            this.maskShape = maskShape;
        } else {
            this.sprite = scene.add.circle(px, py, d / 2 * 0.9, 0xff0000).setDepth(45);
        }
    }

    destroy() {
        this.sprite.destroy();
        this.maskShape?.destroy();
    }
}