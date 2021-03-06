"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
var tslib_1 = require("tslib");
var Entity_1 = require("./Entity");
var Subscription_1 = require("./Subscription");
var Signal_1 = require("../utils/Signal");
/**
 * Engine represents game state, and provides entities update loop on top of systems.
 */
var Engine = /** @class */ (function () {
    function Engine() {
        var _this = this;
        /**
         * Signal dispatches when new entity were added to engine
         */
        this.onEntityAdded = new Signal_1.Signal();
        /**
         * Signal dispatches when entity was removed from engine
         */
        this.onEntityRemoved = new Signal_1.Signal();
        this._entityMap = new Map();
        this._entities = [];
        this._systems = [];
        this._queries = [];
        this._subscriptions = [];
        this._sharedConfig = new Entity_1.Entity();
        this.onComponentAdded = function (entity, component, componentClass) {
            _this._queries.forEach(function (value) { return value.entityComponentAdded(entity, component, componentClass); });
        };
        this.onInvalidationRequested = function (entity) {
            _this._queries.forEach(function (value) { return value.validateEntity(entity); });
        };
        this.onComponentRemoved = function (entity, component, componentClass) {
            _this._queries.forEach(function (value) { return value.entityComponentRemoved(entity, component, componentClass); });
        };
        this.connectEntity(this._sharedConfig);
    }
    Object.defineProperty(Engine.prototype, "entities", {
        /**
         * Gets a list of entities added to engine
         */
        get: function () {
            return Array.from(this._entities);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "systems", {
        /**
         * Gets a list of systems added to engine
         */
        get: function () {
            return this._systems;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "queries", {
        /**
         * Gets a list of queries added to engine
         */
        get: function () {
            return this._queries;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "subscriptions", {
        /**
         * @internal
         */
        get: function () {
            return this._subscriptions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "sharedConfig", {
        /**
         * Gets a shared config entity, that's accessible from every system added to engine
         *
         * @return {Entity}
         */
        get: function () {
            return this._sharedConfig;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Adds an entity to engine.
     * If entity is already added to engine - it does nothing.
     *
     * @param entity Entity to add to engine
     * @see onEntityAdded
     */
    Engine.prototype.addEntity = function (entity) {
        if (this._entityMap.has(entity.id))
            return this;
        this._entities.push(entity);
        this._entityMap.set(entity.id, entity);
        this.onEntityAdded.emit(entity);
        this.connectEntity(entity);
        return this;
    };
    Engine.prototype.addEntities = function () {
        var _this = this;
        var entity = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entity[_i] = arguments[_i];
        }
        entity.forEach(function (entity) { return _this.addEntity(entity); });
        return this;
    };
    /**
     * Remove entity from engine
     * If engine not contains entity - it does nothing.
     *
     * @param entity Entity to remove from engine
     * @see onEntityRemoved
     */
    Engine.prototype.removeEntity = function (entity) {
        if (!this._entityMap.has(entity.id))
            return this;
        var index = this._entities.indexOf(entity);
        this._entities.splice(index, 1);
        this._entityMap.delete(entity.id);
        this.onEntityRemoved.emit(entity);
        this.disconnectEntity(entity);
        return this;
    };
    Engine.prototype.removeEntities = function () {
        var _this = this;
        var entity = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entity[_i] = arguments[_i];
        }
        entity.forEach(function (entity) { return _this.removeEntity(entity); });
        return this;
    };
    /**
     * Removes a system from engine
     * Avoid remove the system during update cycle, do it only if your sure what your are doing.
     * Note: {@link IterativeSystem} has aware guard during update loop, if system removed - updating is being stopped.
     *
     * @param system System to remove
     */
    Engine.prototype.removeSystem = function (system) {
        var index = this._systems.indexOf(system);
        if (index === -1)
            return this;
        this._systems.splice(index, 1);
        system.onRemovedFromEngine();
        system.setEngine(undefined);
        return this;
    };
    /**
     * Gets an entity by its id
     *
     * @param {number} id Entity identifier
     * @return {Entity | undefined} corresponding entity or undefined if it's not found.
     */
    Engine.prototype.getEntityById = function (id) {
        return this._entityMap.get(id);
    };
    /**
     * Gets a system of the specific class
     *
     * @param systemClass Class of the system that should be found
     */
    Engine.prototype.getSystem = function (systemClass) {
        return this._systems.find(function (value) { return value instanceof systemClass; });
    };
    /**
     * Remove all systems
     */
    Engine.prototype.removeAllSystems = function () {
        var e_1, _a;
        var systems = this._systems;
        this._systems = [];
        try {
            for (var systems_1 = tslib_1.__values(systems), systems_1_1 = systems_1.next(); !systems_1_1.done; systems_1_1 = systems_1.next()) {
                var system = systems_1_1.value;
                system.onRemovedFromEngine();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (systems_1_1 && !systems_1_1.done && (_a = systems_1.return)) _a.call(systems_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Remove all queries.
     * After remove all queries will be cleared.
     */
    Engine.prototype.removeAllQueries = function () {
        var e_2, _a;
        var queries = this._queries;
        this._queries = [];
        try {
            for (var queries_1 = tslib_1.__values(queries), queries_1_1 = queries_1.next(); !queries_1_1.done; queries_1_1 = queries_1.next()) {
                var query = queries_1_1.value;
                this.disconnectQuery(query);
                query.clear();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (queries_1_1 && !queries_1_1.done && (_a = queries_1.return)) _a.call(queries_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    /**
     * Remove all entities.
     * onEntityRemoved will be fired for every entity.
     */
    Engine.prototype.removeAllEntities = function () {
        this.removeAllEntitiesInternal(false);
    };
    /**
     * Removes all entities, queries and systems.
     * All entities will be removed silently, {@link onEntityRemoved} event will not be fired.
     * Queries will be cleared.
     */
    Engine.prototype.clear = function () {
        this.removeAllEntitiesInternal(true);
        this.removeAllSystems();
        this.removeAllQueries();
    };
    /**
     * Updates the engine. This cause updating all the systems in the engine in the order of priority they've been added.
     *
     * @param dt Delta time in seconds
     */
    Engine.prototype.update = function (dt, frameDelta) {
        var e_3, _a;
        try {
            for (var _b = tslib_1.__values(this._systems), _c = _b.next(); !_c.done; _c = _b.next()) {
                var system = _c.value;
                system.signalBeforeUpdate.emit(dt);
                system.update(dt, frameDelta);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    /**
     * Adds a query to engine. It matches all available in engine entities with query.
     *
     * When any entity will be added, removed, their components will be modified - this query will be updated,
     * until not being removed from engine.
     *
     * @param query Entity match query
     */
    Engine.prototype.addQuery = function (query) {
        this.connectQuery(query);
        query.matchEntities(this.entities);
        this._queries[this._queries.length] = query;
        return this;
    };
    /**
     * Adds a system to engine, and set it's priority inside of engine update loop.
     *
     * @param system System to add to the engine
     * @param priority Value indicating the priority of updating system in update loop. Lower priority
     *  means sooner update.
     */
    Engine.prototype.addSystem = function (system, priority) {
        if (priority === void 0) { priority = 0; }
        system.setPriority(priority);
        if (this._systems.length === 0) {
            this._systems[0] = system;
        }
        else {
            var index = this._systems.findIndex(function (value) { return value.priority > priority; });
            if (index === -1) {
                this._systems[this._systems.length] = system;
            }
            else {
                this._systems.splice(index, 0, system);
            }
        }
        system.setEngine(this);
        system.onAddedToEngine();
        return this;
    };
    /**
     * Removes a query and clear it.
     *
     * @param query Entity match query
     */
    Engine.prototype.removeQuery = function (query) {
        var index = this._queries.indexOf(query);
        if (index == -1)
            return undefined;
        this._queries.splice(index, 1);
        this.disconnectQuery(query);
        query.clear();
        return this;
    };
    /**
     * Subscribe to any message of the {@link messageType}.
     * Those messages can be dispatched from any system attached to the engine
     *
     * @param {Class<T> | T} messageType - Message type (can be class or any instance, for example string or number)
     * @param {(value: T) => void} handler - Handler for the message
     */
    Engine.prototype.subscribe = function (messageType, handler) {
        this.addSubscription(messageType, handler);
    };
    /**
     * Unsubscribe from messages of specific type
     *
     * @param {Class<T>} messageType - Message type
     * @param {(value: T) => void} handler - Specific handler that must be unsubscribed, if not defined then all handlers
     *  related to this message type will be unsubscribed.
     */
    Engine.prototype.unsubscribe = function (messageType, handler) {
        this.removeSubscription(messageType, handler);
    };
    /**
     * Unsubscribe from all type of messages
     */
    Engine.prototype.unsubscribeAll = function () {
        this._subscriptions.length = 0;
    };
    /**
     * @internal
     */
    Engine.prototype.addSubscription = function (messageType, handler) {
        var e_4, _a;
        try {
            for (var _b = tslib_1.__values(this._subscriptions), _c = _b.next(); !_c.done; _c = _b.next()) {
                var subscription_1 = _c.value;
                if (subscription_1.equals(messageType, handler))
                    return subscription_1;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var subscription = new Subscription_1.Subscription(messageType, handler);
        this._subscriptions.push(subscription);
        return subscription;
    };
    /**
     * @internal
     */
    Engine.prototype.removeSubscription = function (messageType, handler) {
        var i = this._subscriptions.length;
        while (--i >= 0) {
            var subscription = this._subscriptions[i];
            if (subscription.equals(messageType, handler)) {
                this._subscriptions.splice(i, 1);
                if (handler !== undefined)
                    return;
            }
        }
    };
    /**
     * @internal
     */
    Engine.prototype.dispatch = function (message) {
        var e_5, _a;
        try {
            for (var _b = tslib_1.__values(this._subscriptions), _c = _b.next(); !_c.done; _c = _b.next()) {
                var subscription = _c.value;
                if ((typeof subscription.messageType === 'function' && message instanceof subscription.messageType) || message === subscription.messageType) {
                    subscription.handler(message);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    Engine.prototype.connectEntity = function (entity) {
        entity.onComponentAdded.connect(this.onComponentAdded, Number.POSITIVE_INFINITY);
        entity.onComponentRemoved.connect(this.onComponentRemoved, Number.POSITIVE_INFINITY);
        entity.onInvalidationRequested.connect(this.onInvalidationRequested, Number.NEGATIVE_INFINITY);
    };
    Engine.prototype.disconnectEntity = function (entity) {
        entity.onComponentAdded.disconnect(this.onComponentAdded);
        entity.onComponentRemoved.disconnect(this.onComponentRemoved);
        entity.onInvalidationRequested.disconnect(this.onInvalidationRequested);
    };
    Engine.prototype.connectQuery = function (query) {
        this.onEntityAdded.connect(query.entityAdded);
        this.onEntityRemoved.connect(query.entityRemoved);
    };
    Engine.prototype.disconnectQuery = function (query) {
        this.onEntityAdded.disconnect(query.entityAdded);
        this.onEntityRemoved.disconnect(query.entityRemoved);
    };
    Engine.prototype.removeAllEntitiesInternal = function (silently) {
        var e_6, _a;
        var entities = this._entities;
        this._entities = [];
        this._entityMap.clear();
        try {
            for (var entities_1 = tslib_1.__values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                var entity = entities_1_1.value;
                if (!silently) {
                    this.onEntityRemoved.emit(entity);
                }
                this.disconnectEntity(entity);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    /**
     * Updates the engine. Called multiple times per frame. Useful for determinisitic systems such as physics that need to run the same regardless of framerate.
     *
     * @param dt      Fixed Delta time in seconds
     */
    Engine.prototype.updateFixed = function (dt) {
        var e_7, _a;
        try {
            for (var _b = tslib_1.__values(this._systems), _c = _b.next(); !_c.done; _c = _b.next()) {
                var system = _c.value;
                system.updateFixed(dt);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    /**
     * Updates the engine. Called once per frame, after update. Useful for updating cameras before updateRender is called.
     *
     * @param dt Delta time in seconds
     */
    Engine.prototype.updateLate = function (dt) {
        var e_8, _a;
        try {
            for (var _b = tslib_1.__values(this._systems), _c = _b.next(); !_c.done; _c = _b.next()) {
                var system = _c.value;
                system.updateLate(dt);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
    };
    /**
     * Updates the engine. Called once per frame, after updateLate and update. This is the last thing called in the frame, making it useful for any rendering.
     *
     * @param dt Delta time in seconds
     */
    Engine.prototype.updateRender = function (dt) {
        var e_9, _a;
        try {
            for (var _b = tslib_1.__values(this._systems), _c = _b.next(); !_c.done; _c = _b.next()) {
                var system = _c.value;
                system.updateRender(dt);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
    };
    Engine.prototype.hasSystem = function (systemClass) {
        return this.getSystem(systemClass) != undefined;
    };
    return Engine;
}());
exports.Engine = Engine;
