import { Scene } from 'phaser';

export class MenuScene extends Scene {
    constructor() { super('MenuScene'); }

    preload() {
        // Cargamos ambas imágenes por si acaso, o decidimos cuál cargar aquí.
        // Lo más eficiente es cargar solo la necesaria, pero Phaser permite cargar ambas.
        this.load.image('bg-h', 'assets/bg.png');       // Horizontal
        this.load.image('bg-v', 'assets/bg-vertical.png'); // Vertical
    }

    create() {
        this.scale.on('resize', (gameSize: { width: any; height: any; }) => {
    this.cameras.main.setSize(gameSize.width, gameSize.height);
    this.scene.restart(); // Reinicia la escena para recargar el fondo correcto
});
        const { width, height } = this.cameras.main;

        // 1. Detectar Orientación
        // Si el ancho es mayor que el alto, es Horizontal (Landscape)
        const isLandscape = width > height;
        const bgKey = isLandscape ? 'bg-h' : 'bg-v';

        // 2. Fondo completo adaptativo
        const bg = this.add.image(width / 2, height / 2, bgKey).setDepth(0);
        
        // Escalar para cubrir toda la pantalla sin deformar (Cover fit)
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // 3. Título Grande
        // Ajustamos un poco la posición Y según la orientación si quieres
        const titleY = isLandscape ? height / 2 - 200 : height / 2 - 350;
        
        this.add.text(width / 2, titleY, 'PULSO TRAIN', {
            fontSize: isLandscape ? '90px' : '55px', // Texto más pequeño en horizontal para que quepa
            color: '#83fa0c',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            lineSpacing: 10
        }).setOrigin(0.5).setDepth(2);

        // 4. Botón Start Estilizado
        const btnY = isLandscape ? height / 2 + 140 : height / 2 + 270;
        
        const btn = this.add.text(width / 2, btnY, '▶ COMENZAR', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#d32f2f',
            padding: { x: 40, y: 20 },
            stroke: '#000000',
            strokeThickness: 4
        })
        .setOrigin(0.5)
        .setDepth(3)
        .setInteractive({ useHandCursor: true });

        // Efectos de interacción
        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#ff0000' }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#d32f2f' }));

        // Animación de "Latido" (Pulse)
        this.tweens.add({
            targets: btn,
            scale: 1.1,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        btn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}