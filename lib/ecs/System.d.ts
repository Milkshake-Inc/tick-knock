import { Engine } from './Engine';
import { Entity } from './Entity';
import { Signal } from '../utils/Signal';
/**
 * Systems are logic bricks in your application.
 * If you want to manipulate entities and their components - it is the right place for that.
 */
export declare abstract class System {
    signalOnAddedToEngine: Signal<(engine: Engine) => void>;
    signalOnRemovedFromEngine: Signal<(engine: Engine) => void>;
    signalBeforeUpdate: Signal<(deltaTime: number) => void>;
    private _priority;
    private _engine?;
    /**
     * Gets an {@link Engine} instance that system attached to
     * @returns {Engine}
     * @throws An error if system is not attached to the engine
     */
    get engine(): Engine;
    /**
     * Gets an {@link Entity} instance that is shared across all systems and can be used as a config.
     * @return {Entity}
     */
    protected get sharedConfig(): Entity;
    /**
     * Gets a priority of the system
     */
    get priority(): number;
    /**
     * All logic aimed at making changes in entities and their components must be placed in this method.
     * @param dt - The time in seconds it took from previous update call.
     */
    update(dt: number, frameDelta: number): void;
    /**
     * Called multiple times per frame. Useful for determinisitic systems such as physics that need to run the same regardless of framerate.
     *
     * @param dt      Fixed Delta time in seconds
     */
    updateFixed(dt: number): void;
    /**
     * Called once per frame, after update. Useful for updating cameras before updateRender is called.
     *
     * @param dt Delta time in seconds
     */
    updateLate(dt: number): void;
    /**
     * Called once per frame, after updateLate and update. This is the last thing called in the frame, making it useful for any rendering.
     *
     * @param dt Delta time in seconds
     */
    updateRender(dt: number): void;
    /**
     * This method will be called after the system will be added to the Engine.
     */
    onAddedToEngine(): void;
    /**
     * Callback that will be invoked after removing system from engine
     */
    onRemovedFromEngine(): void;
    /**
     * Dispatches a message, that can be caught via {@link Engine#subscribe}.
     * It's the best way to send a message outside. This mechanism allows you not to invent the signals/dispatchers
     * mechanism for your systems, to report an event. For example, you can dispatch that the game round has been
     * completed.
     *
     * @param {T} message
     * @throws An error if system is not attached to the engine
     * @example
     * ```ts
     * class RoundCompleted {
     *   public constructor(
     *      public readonly win:boolean
     *   ) {}
     * }
     *
     * const engine = new Engine();
     * engine.subscribe(RoundCompleted, (message:RoundCompleted) => {
     *   if (message.win) {
     *     this.showWinDialog();
     *   } else {
     *     this.showLoseDialog();
     *   }
     * })
     *
     * class RoundCompletionSystem extends System {
     *   public update(dt:number) {
     *     if (heroesQuery.isEmpty) {
     *       this.dispatch(new RoundCompleted(false));
     *     } else if (enemiesQuery.isEmpty) {
     *       this.dispatch(new RoundCompleted(true));
     *     }
     *   }
     * }
     * ```
     */
    dispatch<T>(message: T): void;
}
