"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
var Signal_1 = require("../utils/Signal");
/**
 * Systems are logic bricks in your application.
 * If you want to manipulate entities and their components - it is the right place for that.
 */
var System = /** @class */ (function () {
    function System() {
        this.signalOnAddedToEngine = new Signal_1.Signal();
        this.signalOnRemovedFromEngine = new Signal_1.Signal();
        this.signalBeforeUpdate = new Signal_1.Signal();
        this._priority = 0;
    }
    Object.defineProperty(System.prototype, "engine", {
        /**
         * Gets an {@link Engine} instance that system attached to
         * @returns {Engine}
         * @throws An error if system is not attached to the engine
         */
        get: function () {
            if (this._engine === undefined)
                throw new Error("Property \"engine\" can't be accessed when system is not added to the engine");
            return this._engine;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(System.prototype, "sharedConfig", {
        /**
         * Gets an {@link Entity} instance that is shared across all systems and can be used as a config.
         * @return {Entity}
         */
        get: function () {
            if (this._engine === undefined)
                throw new Error("Property \"sharedConfig\" can't be accessed when system is not added to the engine");
            return this._engine.sharedConfig;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(System.prototype, "priority", {
        /**
         * Gets a priority of the system
         */
        get: function () {
            return this._priority;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * All logic aimed at making changes in entities and their components must be placed in this method.
     * @param dt - The time in seconds it took from previous update call.
     */
    System.prototype.update = function (dt, frameDelta) { };
    /**
     * Called multiple times per frame. Useful for determinisitic systems such as physics that need to run the same regardless of framerate.
     *
     * @param dt      Fixed Delta time in seconds
     */
    System.prototype.updateFixed = function (dt) { };
    /**
     * Called once per frame, after update. Useful for updating cameras before updateRender is called.
     *
     * @param dt Delta time in seconds
     */
    System.prototype.updateLate = function (dt) { };
    /**
     * Called once per frame, after updateLate and update. This is the last thing called in the frame, making it useful for any rendering.
     *
     * @param dt Delta time in seconds
     */
    System.prototype.updateRender = function (dt) { };
    /**
     * This method will be called after the system will be added to the Engine.
     */
    System.prototype.onAddedToEngine = function () { };
    /**
     * Callback that will be invoked after removing system from engine
     */
    System.prototype.onRemovedFromEngine = function () { };
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
    System.prototype.dispatch = function (message) {
        if (this._engine === undefined) {
            throw new Error("Dispatching a message can't be done while system is not attached to the engine");
        }
        this.engine.dispatch(message);
    };
    /**
     * @internal
     */
    System.prototype.setEngine = function (engine) {
        if (!engine) {
            this.signalOnRemovedFromEngine.emit(this._engine);
        }
        this._engine = engine;
        if (engine) {
            this.signalOnAddedToEngine.emit(this._engine);
        }
    };
    /**
     * @internal
     */
    System.prototype.setPriority = function (priority) {
        this._priority = priority;
    };
    return System;
}());
exports.System = System;
