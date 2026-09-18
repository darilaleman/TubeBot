// Número de columnas en pantalla.
// MENOS columnas = celdas más grandes = sprites más grandes.
//   9  → muy grandes
//  10  → grandes (recomendado para móvil)
//  12  → medianos
//  14  → pequeños
export const COLS = 15;

// Cuánto ocupa el sprite dentro de la celda.
// 1.0 = exacto (queda un hueco entre segmentos).
// 1.15 = ligero solape (se ve continuo).
export const SPRITE_SCALE = 1.15;

// Milisegundos entre cada paso. Menos = más rápido.
export const MOVE_DELAY = 150;

export const SPEED_INCREASE = 10; // Cuántos ms se resta por cada nivel de velocidad