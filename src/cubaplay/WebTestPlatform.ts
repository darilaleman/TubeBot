import { GamePlatform, GameResult } from './GamePlatform';
export class WebTestPlatform implements GamePlatform {
    async initialize() { console.log('Init'); }
    async getPlayer() { return { id: 'test-user' }; }
    async startGame() { return { sessionId: 'test-123' }; }
    async submitResult(r: GameResult) { 
        return { success: true }; 
    }
    exitGame() {}
}