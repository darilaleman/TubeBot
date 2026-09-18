/// <reference types="vite/client" />

// Vite importa todos los archivos de la carpeta como URLs
const channelModules = import.meta.glob('/public/assets/channels/*.{png,jpg,webp}', { eager: true });

export const CHANNEL_ASSETS: Record<string, string> = {};

Object.entries(channelModules).forEach(([path, mod]) => {
    // Extrae el nombre del archivo sin extensión para usarlo como key
    const filename = path.split('/').pop() || '';
    const key = filename.replace(/\.[^/.]+$/, ''); 
    CHANNEL_ASSETS[key] = (mod as any).default;
});