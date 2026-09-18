import Phaser from 'phaser';
import { SPRITE_SCALE } from '../config/GameConfig';

type PositionableSprite = Phaser.GameObjects.Image | Phaser.GameObjects.Arc;

interface Segment {
    x: number;
    y: number;
    sprite: PositionableSprite;
    maskShape?: Phaser.GameObjects.Graphics;
}

export class TubeBot {
    public gridX: number;
    public gridY: number;

    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private size: number;
    private dirX = 1;
    private dirY = 0;
    private segments: Segment[] = [];
    private pendingGrowthTexture: string | null = null;

    constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, x: number, y: number, size: number) {
        this.scene = scene;
        this.container = container;
        this.size = size;
        this.gridX = x;
        this.gridY = y;
        this.segments.push(this.createHeadSprite(x, y));
    }

    private cellCenter(x: number, y: number) {
        return {
            px: x * this.size + this.size / 2,
            py: y * this.size + this.size / 2
        };
    }

    private applyCircleMask(sprite: Phaser.GameObjects.Image, px: number, py: number, diameter: number): Phaser.GameObjects.Graphics {
        const maskShape = this.scene.make.graphics({}, false);
        maskShape.fillStyle(0xffffff);
        maskShape.fillCircle(0, 0, diameter / 2);

        // ✅ La máscara NO está en el contenedor, así que su posición debe ser
        // en coordenadas de MUNDO (sumando la posición del contenedor).
        maskShape.setPosition(this.container.x + px, this.container.y + py);

        sprite.setMask(maskShape.createGeometryMask());
        return maskShape;
    }

    private createHeadSprite(x: number, y: number): Segment {
        const { px, py } = this.cellCenter(x, y);
        const d = this.size * SPRITE_SCALE;

        let sprite: PositionableSprite;
        let maskShape: Phaser.GameObjects.Graphics | undefined;

        if (this.scene.textures.exists('bot_head')) {
            const img = this.scene.add.image(px, py, 'bot_head').setDisplaySize(d, d).setDepth(60);
            maskShape = this.applyCircleMask(img, px, py, d);
            sprite = img;
        } else {
            sprite = this.scene.add.circle(px, py, d / 2, 0x00e676).setDepth(60);
        }

        // ✅ Solo añadimos el sprite al contenedor. La máscara va aparte.
        this.container.add(sprite);
        return { x, y, sprite, maskShape };
    }

    private createBodySprite(x: number, y: number, textureKey?: string): Segment {
        const { px, py } = this.cellCenter(x, y);
        const d = this.size * SPRITE_SCALE;

        let sprite: PositionableSprite;
        let maskShape: Phaser.GameObjects.Graphics | undefined;

        if (textureKey && this.scene.textures.exists(textureKey)) {
            const img = this.scene.add.image(px, py, textureKey).setDisplaySize(d, d).setDepth(50);
            maskShape = this.applyCircleMask(img, px, py, d);
            sprite = img;
        } else if (this.scene.textures.exists('bot_body')) {
            const img = this.scene.add.image(px, py, 'bot_body').setDisplaySize(d, d).setDepth(40);
            maskShape = this.applyCircleMask(img, px, py, d);
            sprite = img;
        } else {
            sprite = this.scene.add.circle(px, py, d / 2 * 0.7, 0x0288d1).setDepth(30);
        }

        this.container.add(sprite);
        return { x, y, sprite, maskShape };
    }

    growAfterNextMove(textureKey: string) {
        this.pendingGrowthTexture = textureKey;
    }

    changeDirection(dx: number, dy: number) {
        if (this.segments.length > 1 && dx === -this.dirX && dy === -this.dirY) return;
        this.dirX = dx;
        this.dirY = dy;
    }

    private moveSegmentTo(seg: Segment, x: number, y: number) {
        seg.x = x;
        seg.y = y;
        const { px, py } = this.cellCenter(x, y);
        seg.sprite.setPosition(px, py);
        // ✅ La máscara está fuera del contenedor → coordenadas de mundo.
        seg.maskShape?.setPosition(this.container.x + px, this.container.y + py);
    }

    move() {
        const tail = this.segments[this.segments.length - 1];
        const tailX = tail.x;
        const tailY = tail.y;

        for (let i = this.segments.length - 1; i > 0; i--) {
            const ahead = this.segments[i - 1];
            this.moveSegmentTo(this.segments[i], ahead.x, ahead.y);
        }

        this.gridX += this.dirX;
        this.gridY += this.dirY;
        this.moveSegmentTo(this.segments[0], this.gridX, this.gridY);

        if (this.pendingGrowthTexture !== null) {
            this.segments.push(this.createBodySprite(tailX, tailY, this.pendingGrowthTexture));
            this.pendingGrowthTexture = null;
        }

        return { x: this.gridX, y: this.gridY };
    }

    hitsSelf(x: number, y: number) {
        return this.segments.some((s, i) => i > 0 && s.x === x && s.y === y);
    }

    occupies(x: number, y: number) {
        return this.segments.some(s => s.x === x && s.y === y);
    }

    destroy() {
        this.segments.forEach(s => {
            s.sprite.destroy();
            s.maskShape?.destroy();
        });
        this.segments = [];
    }
}