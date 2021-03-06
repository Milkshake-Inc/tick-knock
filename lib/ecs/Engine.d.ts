import { Entity } from './Entity';
import { System } from './System';
import { Class } from '../utils/Class';
import { Query } from './Query';
import { Signal } from '../utils/Signal';
/**
 * Engine represents game state, and provides entities update loop on top of systems.
 */
export declare class Engine {
    /**
     * Signal dispatches when new entity were added to engine
     */
    onEntityAdded: Signal<(entity: Entity) => void>;
    /**
     * Signal dispatches when entity was removed from engine
     */
    onEntityRemoved: Signal<(entity: Entity) => void>;
    private _entityMap;
    private _entities;
    private _systems;
    private _queries;
    private _subscriptions;
    private _sharedConfig;
    /**
     * Gets a list of entities added to engine
     */
    get entities(): ReadonlyArray<Entity>;
    /**
     * Gets a list of systems added to engine
     */
    get systems(): ReadonlyArray<System>;
    /**
     * Gets a list of queries added to engine
     */
    get queries(): ReadonlyArray<Query>;
    constructor();
    /**
     * Gets a shared config entity, that's accessible from every system added to engine
     *
     * @return {Entity}
     */
    get sharedConfig(): Entity;
    /**
     * Adds an entity to engine.
     * If entity is already added to engine - it does nothing.
     *
     * @param entity Entity to add to engine
     * @see onEntityAdded
     */
    addEntity(entity: Entity): Engine;
    addEntities(...entity: Entity[]): Engine;
    /**
     * Remove entity from engine
     * If engine not contains entity - it does nothing.
     *
     * @param entity Entity to remove from engine
     * @see onEntityRemoved
     */
    removeEntity(entity: Entity): Engine;
    removeEntities(...entity: Entity[]): Engine;
    /**
     * Removes a system from engine
     * Avoid remove the system during update cycle, do it only if your sure what your are doing.
     * Note: {@link IterativeSystem} has aware guard during update loop, if system removed - updating is being stopped.
     *
     * @param system System to remove
     */
    removeSystem(system: System): Engine;
    /**
     * Gets an entity by its id
     *
     * @param {number} id Entity identifier
     * @return {Entity | undefined} corresponding entity or undefined if it's not found.
     */
    getEntityById(id: number): Entity | undefined;
    /**
     * Gets a system of the specific class
     *
     * @param systemClass Class of the system that should be found
     */
    getSystem<T extends System>(systemClass: Class<T>): T | undefined;
    /**
     * Remove all systems
     */
    removeAllSystems(): void;
    /**
     * Remove all queries.
     * After remove all queries will be cleared.
     */
    removeAllQueries(): void;
    /**
     * Remove all entities.
     * onEntityRemoved will be fired for every entity.
     */
    removeAllEntities(): void;
    /**
     * Removes all entities, queries and systems.
     * All entities will be removed silently, {@link onEntityRemoved} event will not be fired.
     * Queries will be cleared.
     */
    clear(): void;
    /**
     * Updates the engine. This cause updating all the systems in the engine in the order of priority they've been added.
     *
     * @param dt Delta time in seconds
     */
    update(dt: number, frameDelta: number): void;
    /**
     * Adds a query to engine. It matches all available in engine entities with query.
     *
     * When any entity will be added, removed, their components will be modified - this query will be updated,
     * until not being removed from engine.
     *
     * @param query Entity match query
     */
    addQuery(query: Query): Engine;
    /**
     * Adds a system to engine, and set it's priority inside of engine update loop.
     *
     * @param system System to add to the engine
     * @param priority Value indicating the priority of updating system in update loop. Lower priority
     *  means sooner update.
     */
    addSystem(system: System, priority?: number): Engine;
    /**
     * Removes a query and clear it.
     *
     * @param query Entity match query
     */
    removeQuery(query: Query): this | undefined;
    /**
     * Subscribe to any message of the {@link messageType}.
     * Those messages can be dispatched from any system attached to the engine
     *
     * @param {Class<T> | T} messageType - Message type (can be class or any instance, for example string or number)
     * @param {(value: T) => void} handler - Handler for the message
     */
    subscribe<T>(messageType: Class<T> | T, handler: (value: T) => void): void;
    /**
     * Unsubscribe from messages of specific type
     *
     * @param {Class<T>} messageType - Message type
     * @param {(value: T) => void} handler - Specific handler that must be unsubscribed, if not defined then all handlers
     *  related to this message type will be unsubscribed.
     */
    unsubscribe<T>(messageType: Class<T> | T, handler?: (value: T) => void): void;
    /**
     * Unsubscribe from all type of messages
     */
    unsubscribeAll(): void;
    private connectEntity;
    private disconnectEntity;
    private connectQuery;
    private disconnectQuery;
    private removeAllEntitiesInternal;
    private onComponentAdded;
    private onInvalidationRequested;
    private onComponentRemoved;
    /**
     * Updates the engine. Called multiple times per frame. Useful for determinisitic systems such as physics that need to run the same regardless of framerate.
     *
     * @param dt      Fixed Delta time in seconds
     */
    updateFixed(dt: number): void;
    /**
     * Updates the engine. Called once per frame, after update. Useful for updating cameras before updateRender is called.
     *
     * @param dt Delta time in seconds
     */
    updateLate(dt: number): void;
    /**
     * Updates the engine. Called once per frame, after updateLate and update. This is the last thing called in the frame, making it useful for any rendering.
     *
     * @param dt Delta time in seconds
     */
    updateRender(dt: number): void;
    hasSystem<T extends System>(systemClass: Class<T>): boolean;
}
