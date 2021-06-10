import {Engine} from './Engine';
import {Entity} from './Entity';
import {Signal} from '../utils/Signal';

/**
 * Systems are logic bricks in your application.
 * If you want to manipulate entities and their components - it is the right place for that.
 */
export abstract class System {
  public signalOnAddedToEngine: Signal<(engine: Engine) => void> = new Signal();
  public signalOnRemovedFromEngine: Signal<(engine: Engine) => void> = new Signal();
  public signalBeforeUpdate: Signal<(deltaTime: number) => void> = new Signal();

  private _priority: number = 0;
  private _engine?: Engine;

  /**
   * Gets an {@link Engine} instance that system attached to
   * @returns {Engine}
   * @throws An error if system is not attached to the engine
   */
  public get engine(): Engine {
    if (this._engine === undefined) throw new Error(`Property "engine" can't be accessed when system is not added to the engine`);
    return this._engine;
  }

  /**
   * Gets an {@link Entity} instance that is shared across all systems and can be used as a config.
   * @return {Entity}
   */
  protected get sharedConfig(): Entity {
    if (this._engine === undefined) throw new Error(`Property "sharedConfig" can't be accessed when system is not added to the engine`);
    return this._engine.sharedConfig;
  }

  /**
   * Gets a priority of the system
   */
  public get priority(): number {
    return this._priority;
  }

  /**
   * All logic aimed at making changes in entities and their components must be placed in this method.
   * @param dt - The time in seconds it took from previous update call.
   */
  public update(dt: number, frameDelta: number) {}

  /**
   * Called multiple times per frame. Useful for determinisitic systems such as physics that need to run the same regardless of framerate.
   *
   * @param dt      Fixed Delta time in seconds
   */
  public updateFixed(dt: number) {}

  /**
   * Called once per frame, after update. Useful for updating cameras before updateRender is called.
   *
   * @param dt Delta time in seconds
   */
  public updateLate(dt: number) {}

  /**
   * Called once per frame, after updateLate and update. This is the last thing called in the frame, making it useful for any rendering.
   *
   * @param dt Delta time in seconds
   */
  public updateRender(dt: number) {}

  /**
   * This method will be called after the system will be added to the Engine.
   */
  public onAddedToEngine() {}

  /**
   * Callback that will be invoked after removing system from engine
   */
  public onRemovedFromEngine() {}

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
  public dispatch<T>(message: T): void {
    if (this._engine === undefined) {
      throw new Error("Dispatching a message can't be done while system is not attached to the engine");
    }
    this.engine.dispatch(message);
  }

  /**
   * @internal
   */
  public setEngine(engine: Engine | undefined): void {
    if (!engine) {
      this.signalOnRemovedFromEngine.emit(this._engine as Engine);
    }

    this._engine = engine;

    if (engine) {
      this.signalOnAddedToEngine.emit(this._engine as Engine);
    }
  }

  /**
   * @internal
   */
  public setPriority(priority: number): void {
    this._priority = priority;
  }
}
