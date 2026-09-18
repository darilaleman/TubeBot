import { GamePlatform, GameResult } from './GamePlatform';
export class CubaPlayPlatform implements GamePlatform {
    async initialize() {}
    async getPlayer() { return { id: 'cp-user' }; }
    async startGame() { return { sessionId: 'secure' }; }
    async submitResult(r: GameResult) { return { success: true }; }
    exitGame() {}
}