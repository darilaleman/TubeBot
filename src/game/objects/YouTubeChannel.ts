import Phaser from 'phaser';
import { SPRITE_SCALE } from '../config/GameConfig';

export class YouTubeChannel {
    public gridX: number;
    public gridY: number;
    public readonly textureKey: string;
    public sprite: Phaser.GameObjects.GameObject;
    private maskShape?: Phaser.GameObjects.Graphics;

    constructor(
        scene: Phaser.Scene,
        container: Phaser.GameObjects.Container,  // ✅ ahora recibe el contenedor
        x: number,
        y: number,
        size: number,
        textureKey?: string
    ) {
        this.gridX = x;
        this.gridY = y;
        this.textureKey = textureKey ?? '';

        const px = x * size + size / 2;
        const py = y * size + size / 2;
        const d = size * SPRITE_SCALE;
        // ✅ Coordenadas de mundo para la máscara (que no vive en el contenedor)
        const worldX = container.x + px;
        const worldY = container.y + py;

        if (textureKey && scene.textures.exists(textureKey)) {
            const image = scene.add.image(px, py, textureKey).setDisplaySize(d, d);
            const maskShape = scene.make.graphics({}, false);
            maskShape.fillStyle(0xffffff);
            maskShape.fillCircle(0, 0, d / 2);
            maskShape.setPosition(worldX, worldY);
            image.setMask(maskShape.createGeometryMask());
            this.sprite = image;
            this.maskShape = maskShape;
        } else {
            this.sprite = scene.add.circle(px, py, d / 2 * 0.9, 0xff0000);
        }

        // ✅ El propio canal se añade al contenedor (así el sprite comparte transformación
        //    con el resto de elementos del juego)
        container.add(this.sprite);
    }

    destroy() {
        this.sprite.destroy();
        this.maskShape?.destroy();
    }
}