import {IGameSettings} from "../data/_types/IGameSettings";
import {IGameState} from "../data/_types/IGameState";

/**
 * Starts the game loop
 * @param gameState The game state to be updated
 * @param settings The game settings to be used
 * @returns A function that can be invoked to stop the game loop
 */
export function startGameLoop(
    gameState: IGameState,
    settings: IGameSettings
): () => void {
    const loop = (delta: number) => {
       
    };

    // Starts the loop
    let running = true;
    let prevTime = Date.now();
    const callLoop = () => {
        const newTime = Date.now();
        loop((newTime - prevTime) / 1000);
        prevTime = newTime;
        if (running) requestAnimationFrame(callLoop);
    };
    callLoop();

    return () => (running = false);
}
