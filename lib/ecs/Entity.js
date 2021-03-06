"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySnapshot = exports.Entity = void 0;
var tslib_1 = require("tslib");
var ComponentId_1 = require("./ComponentId");
var Class_1 = require("../utils/Class");
var Signal_1 = require("../utils/Signal");
var Tag_1 = require("./Tag");
var LinkedComponent_1 = require("./LinkedComponent");
var LinkedComponentList_1 = require("./LinkedComponentList");
/**
 * Entity is a general purpose object, which can be marked with tags and can contain different components.
 * So it is just a container, that can represent any in-game entity, like enemy, bomb, configuration, game state, etc.
 *
 * @example
 * ```ts
 * // Here we can see structure of the component "Position", it's just a data that can be attached to the Entity
 * // There is no limits for component`s structure.
 * // Components mustn't hold the reference to the entity that it attached to.
 *
 * class Position {
 *   public x:number;
 *   public y:number;
 *
 *   public constructor(x:number = 0, y:number = 0) {
 *     this.x = x;
 *     this.y = y;
 *   }
 * }
 *
 * // We can mark an entity with the tag OBSTACLE. Tag can be represented as a number or string.
 * const OBSTACLE = 10100;
 *
 * const entity = new Entity()
 *  .add(OBSTACLE)
 *  .add(new Position(10, 5));
 * ```
 */
var Entity = /** @class */ (function () {
    function Entity() {
        /**
         * The signal dispatches if new component or tag was added to the entity. Works for every linked component as well.
         */
        this.onComponentAdded = new Signal_1.Signal();
        /**
         * The signal dispatches if component was removed from the entity. Works for every linked component as well.
         */
        this.onComponentRemoved = new Signal_1.Signal();
        /**
         * The signal dispatches that invalidation requested for this entity.
         * Which means that if the entity attached to the engine — its queries will be updated.
         *
         * Use {@link Entity.invalidate} method in case if in query test function is using component properties or complex
         * logic.
         *
         * Only adding/removing components and tags are tracked by Engine. So you need to request queries invalidation
         * manually, if some of your queries depends on logic or component`s properties.
         */
        this.onInvalidationRequested = new Signal_1.Signal();
        /**
         * Unique id identifier
         */
        this.id = entityId++;
        this._components = {};
        this._linkedComponents = {};
        this._tags = new Set();
    }
    Object.defineProperty(Entity.prototype, "components", {
        /**
         * Returns components map, where key is component identifier, and value is a component itself
         * @see {@link getComponentId}, {@link Entity.getComponents}
         */
        get: function () {
            return this._components;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "tags", {
        /**
         * Returns set of tags applied to the entity
         * @see getComponentId
         */
        get: function () {
            return this._tags;
        },
        enumerable: false,
        configurable: true
    });
    Entity.prototype.toString = function () {
        return "Entity" + this.id + " [" + Array.from(Object.values(this.components)).map(function (c) { return c.constructor.name; }) + "]";
    };
    /**
     * Adds a component or tag to the entity.
     * It's a unified shorthand for {@link addComponent} and {@link addTag}.
     *
     * - If a component of the same type already exists in entity, it will be replaced by the passed one (only if
     *  component itself is not the same, in this case - no actions will be done).
     * - If the tag is already present in the entity - no actions will be done.
     * - During components replacement {@link onComponentRemoved} and {@link onComponentAdded} are will be triggered
     *  sequentially.
     * - If there is no component of the same type, or the tag is not present in the entity - then only
     * - If the passed component is an instance of ILinkedComponent then all existing instances will be removed, and the
     *  passed instance will be added to the Entity. {@link onComponentRemoved} will be triggered for every removed
     *  instance and {@link onComponentAdded} will be triggered for the passed component.
     * - Linked component always replaces all existing instances. Even if the passed instance already exists in the
     *  Entity - all existing linked components will be removed anyway, and replaced with the passed one.
     *
     * @throws Throws error if component is null or undefined, or if component is not an instance of the class as well
     * @param {T | Tag} componentOrTag Component instance or Tag
     * @param {K} resolveClass Class that should be used as resolving class.
     *  Passed class always should be an ancestor of Component's class.
     *  It has sense only if component instance is passed, but not the Tag.
     * @returns {Entity} Reference to the entity itself. It helps to build chain of calls.
     * @see {@link addComponent, appendComponent}, {@link addTag}
     * @example
     * ```ts
     * const BULLET = 1;
     * const EXPLOSIVE = "explosive";
     * const entity = new Entity()
     *  .add(new Position())
     *  .add(new View())
     *  .add(new Velocity())
     *  .add(BULLET)
     *  .add(EXPLOSIVE);
     * ```
     */
    Entity.prototype.add = function (componentOrTag, data, resolveClass) {
        if (data === void 0) { data = {}; }
        if (Tag_1.isTag(componentOrTag)) {
            this.addTag(componentOrTag);
        }
        else {
            var component = Class_1.isClass(componentOrTag) ? new componentOrTag() : componentOrTag;
            Object.assign(component, data);
            this.addComponent(component, resolveClass);
        }
        return this;
    };
    /**
     * Appends a linked component to the entity.
     *
     * - If linked component is not exists, then it will be added to the Entity and {@link onComponentAdded}
     * will be triggered.
     * - If component already exists in the entity, then passed one will be appended to the tail. {@link onComponentAdded}
     *  will be triggered as well.
     *
     * It's a shorthand to {@link appendComponent}
     *
     * @throws Throws error if component is null or undefined, or if component is not an instance of the class as well
     * @param {T | Tag} component ILinkedComponent instance
     * @param {K} resolveClass Class that should be used as resolving class.
     *  Passed class always should be an ancestor of Component's class.
     *
     * @returns {Entity} Reference to the entity itself. It helps to build chain of calls.
     * @see {@link addComponent}
     * @see {@link appendComponent}
     * @example
     * ```ts
     * const damage = new Damage();
     * const entity = new Entity()
     *  .append(new Damage(1))
     *  .append(new Damage(2))
     *
     *  const damage = entity.get(Damage);
     *  while (entity.has(Damage)) {
     *    const entity = entity.withdraw(Damage);
     *    print(damage.value);
     *  }
     * ```
     */
    Entity.prototype.append = function (component, resolveClass) {
        return this.appendComponent(component, resolveClass);
    };
    /**
     * Removes first appended linked component instance of the specified type.
     * Unlike {@link remove} and {@link removeComponent} remaining linked components stays in the Entity.
     *
     * - If linked component exists in the Entity, then it will be removed from Entity and {@link onComponentRemoved}
     * will be triggered.
     *
     * @param {Class<T>} componentClass
     * @return {T | undefined} Component instance if any of the specified type exists in the entity, otherwise undefined
     * @example
     * ```ts
     * const entity = new Entity()
     *   .append(new Damage(1))
     *   .append(new Damage(2))
     *   .append(new Damage(3));
     *
     * entity.withdraw(Damage);
     * entity.iterate(Damage, (damage) => {
     *   print('Remaining damage: ' + damage.value);
     * });
     *
     * // Remaining damage: 2
     * // Remaining damage: 3
     * ```
     */
    Entity.prototype.withdraw = function (componentClass) {
        var component = this.get(componentClass);
        if (component !== undefined) {
            return this.withdrawComponent(component, componentClass);
        }
        return undefined;
    };
    /**
     * Removes particular linked component instance from the Entity.
     *
     * - If linked component instance exists in the Entity, then it will be removed from Entity and
     * {@link onComponentRemoved} will be triggered.
     *
     * @param {NonNullable<T>} component Linked component instance
     * @param {Class<K>} resolveClass Resolve class
     * @return {T | undefined} Component instance if it exists in the entity, otherwise undefined
     */
    Entity.prototype.pick = function (component, resolveClass) {
        return this.withdrawComponent(component, resolveClass);
    };
    /**
     * Adds a component to the entity.
     *
     * - If a component of the same type already exists in entity, it will be replaced by the passed one (only if
     *  component itself is not the same, in this case - no actions will be done).
     * - During components replacement {@link onComponentRemoved} and {@link onComponentAdded} are will be triggered
     *  sequentially.
     * - If there is no component of the same type - then only {@link onComponentAdded} will be triggered.
     *
     * @throws Throws error if component is null or undefined, or if component is not an instance of the class as well
     * @param {T} component Component instance
     * @param {K} resolveClass Class that should be used as resolving class.
     *  Passed class always should be an ancestor of Component's class.
     * @returns {Entity} Reference to the entity itself. It helps to build chain of calls.
     * @see {@link add}, {@link addTag}
     * @example
     * ```ts
     * const BULLET = 1;
     * const entity = new Entity()
     *  .addComponent(new Position())
     *  .addComponent(new View())
     *  .add(BULLET);
     * ```
     */
    Entity.prototype.addComponent = function (component, resolveClass) {
        var componentClass = ComponentId_1.getComponentClass(component, resolveClass);
        var id = ComponentId_1.getComponentId(componentClass, true);
        var linkedComponent = LinkedComponent_1.isLinkedComponent(component);
        if (this._components[id] !== undefined) {
            if (!linkedComponent && component === this._components[id]) {
                return;
            }
            this.remove(componentClass);
        }
        if (linkedComponent) {
            this.append(component, resolveClass);
        }
        else {
            this._components[id] = component;
            this.dispatchOnComponentAdded(component);
        }
        Entity.NumberComponents++;
    };
    /**
     * Appends a linked component to the entity.
     *
     * - If linked component is not exists, then it will be added via `addComponent` method and {@link onComponentAdded}
     * will be triggered.
     * - If component already exists in the entity, then passed one will be appended to the tail. {@link
     * onComponentAdded} wont be triggered.
     *
     * @throws Throws error if component is null or undefined, or if component is not an instance of the class as well
     * @param {T | Tag} component ILinkedComponent instance
     * @param {K} resolveClass Class that should be used as resolving class.
     *  Passed class always should be an ancestor of Component's class.
     *
     * @returns {Entity} Reference to the entity itself. It helps to build chain of calls.
     * @see {@link append}
     * @see {@link addComponent}
     * @example
     * ```ts
     * const damage = new Damage();
     * const entity = new Entity()
     *  .append(new Damage())
     *  .append(new Damage())
     *
     *  const damage = entity.get(Damage);
     *  while (damage !== undefined) {
     *    print(damage.value);
     *    damage = damage.next;
     *  }
     * ```
     */
    Entity.prototype.appendComponent = function (component, resolveClass) {
        var componentClass = ComponentId_1.getComponentClass(component, resolveClass);
        var componentId = ComponentId_1.getComponentId(componentClass, true);
        var componentList = this.getLinkedComponentList(componentId);
        componentList.add(component);
        if (this._components[componentId] === undefined) {
            this._components[componentId] = componentList.head;
        }
        this.dispatchOnComponentAdded(component);
        return this;
    };
    /**
     * Adds a tag to the entity.
     *
     * - If the tag is already present in the entity - no actions will be done.
     * - If there is such tag in the entity then {@link onComponentAdded} will be triggered.
     *
     * @param {Tag} tag Tag
     * @returns {Entity} Reference to the entity itself. It helps to build chain of calls.
     * @see {@link add}, {@link addComponent}
     * @example
     * ```ts
     * const DEVELOPER = "developer;
     * const EXHAUSTED = 2;
     * const  = "game-over";
     * const entity = new Entity()
     *  .addTag(DEVELOPER)
     *  .add(EXHAUSTED)
     * ```
     */
    Entity.prototype.addTag = function (tag) {
        if (!this._tags.has(tag)) {
            this._tags.add(tag);
            this.dispatchOnComponentAdded(tag);
            Entity.NumberComponents++;
        }
    };
    /**
     * Returns componentClassOrTag indicating whether entity has a specific component or tag
     *
     * @param componentClassOrTag
     * @example
     * ```ts
     * const BERSERK = 10091;
     * if (!entity.has(Immobile) || entity.has(BERSERK)) {
     *   const position = entity.get(Position)!;
     *   position.x += 1;
     * }
     * ```
     */
    Entity.prototype.has = function (componentClassOrTag) {
        if (Tag_1.isTag(componentClassOrTag)) {
            return this.hasTag(componentClassOrTag);
        }
        return this.hasComponent(componentClassOrTag);
    };
    /**
     * Returns value indicating whether entity contains a component instance.
     * If the component is an instance of ILinkedComponent then all components of its type will be checked for equality.
     *
     * @param {NonNullable<T>} component
     * @param {Class<K>} resolveClass
     * @example
     * ```ts
     * const boon = new Boon(BoonType.HEAL);
     * entity
     *   .append(new Boon(BoonType.PROTECTION));
     *   .append(boon);
     *
     * if (entity.contains(boon)) {
     *   logger.info('Ah, sweet. We have not only protection but heal as well!');
     * }
     * ```
     */
    Entity.prototype.contains = function (component, resolveClass) {
        var componentClass = ComponentId_1.getComponentClass(component, resolveClass);
        if (LinkedComponent_1.isLinkedComponent(component)) {
            return this.find(componentClass, function (value) { return value === component; }) !== undefined;
        }
        return this.get(componentClass) === component;
    };
    /**
     * Returns value indicating whether entity has a specific component
     *
     * @param component
     * @example
     * ```
     * if (!entity.hasComponent(Immobile)) {
     *   const position = entity.get(Position)!;
     *   position.x += 1;
     * }
     * ```
     */
    Entity.prototype.hasComponent = function (component) {
        var id = ComponentId_1.getComponentId(component);
        if (id === undefined)
            return false;
        return this._components[id] !== undefined;
    };
    /**
     * Returns value indicating whether entity has a specific tag
     *
     * @param tag
     * @example
     * ```ts
     * const BERSERK = "berserk";
     * let damage = initialDamage;
     * if (entity.hasTag(BERSERK)) {
     *   damage *= 1.2;
     * }
     * ```
     */
    Entity.prototype.hasTag = function (tag) {
        return this._tags.has(tag);
    };
    /**
     * Returns value indicating whether entity have any of specified components/tags
     *
     * @param {Class<unknown> | Tag} componentClassOrTag
     * @returns {boolean}
     * @example
     * ```ts
     * const IMMORTAL = "immortal";
     * if (!entity.hasAny(Destroy, Destroying, IMMORTAL)) {
     *   entity.add(new Destroy());
     * }
     * ```
     */
    Entity.prototype.hasAny = function () {
        var _this = this;
        var componentClassOrTag = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            componentClassOrTag[_i] = arguments[_i];
        }
        return componentClassOrTag.some(function (value) { return _this.has(value); });
    };
    /**
     * Returns value indicating whether entity have all of specified components/tags
     *
     * @param {Class<unknown> | Tag} componentClassOrTag
     * @returns {boolean}
     * @example
     * ```ts
     * const I_LOVE_GRAVITY = "no-i-don't";
     * if (entity.hasAll(Position, Acceleration, I_LOVE_GRAVITY)) {
     *   entity.get(Position)!.y += entity.get(Acceleration)!.y * dt;
     * }
     * ```
     */
    Entity.prototype.hasAll = function () {
        var _this = this;
        var componentClassOrTag = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            componentClassOrTag[_i] = arguments[_i];
        }
        return componentClassOrTag.every(function (value) { return _this.has(value); });
    };
    /**
     * Gets a component instance if it's exists in the entity, otherwise returns `undefined`
     * - If you want to check presence of the tag then use {@link has} instead.
     *
     * @param componentClass Specific component class
     */
    Entity.prototype.get = function (componentClass) {
        var id = ComponentId_1.getComponentId(componentClass);
        if (id === undefined)
            return undefined;
        return this._components[id];
    };
    /**
     * Returns an array of entity components
     *
     * @returns {unknown[]}
     */
    Entity.prototype.getComponents = function () {
        return Array.from(Object.values(this._components));
    };
    /**
     * Returns an array of tags applied to the entity
     */
    Entity.prototype.getTags = function () {
        return Array.from(this._tags);
    };
    /**
     * Removes a component or tag from the entity.
     *  In case if the component or tag is present - then {@link onComponentRemoved} will be
     *  dispatched after removing it from the entity.
     *
     * If linked component type provided:
     * - For each instance of linked component {@link onComponentRemoved} will be called
     * - Only head of the linked list will be returned.
     *
     * If you need to get all instances use {@link withdraw} or {@link pick} instead, or check {@link iterate},
     * {@link getAll}
     *
     * It's a shorthand for {@link removeComponent}
     *
     * @param componentClassOrTag Specific component class or tag
     * @returns Component instance or `undefined` if it doesn't exists in the entity, or tag was removed
     * @see {@link withdraw}
     * @see {@link pick}
     */
    Entity.prototype.remove = function (componentClassOrTag) {
        Entity.NumberComponents--;
        if (Tag_1.isTag(componentClassOrTag)) {
            this.removeTag(componentClassOrTag);
            return undefined;
        }
        return this.removeComponent(componentClassOrTag);
    };
    /**
     * Removes a component from the entity.
     *  In case if the component or tag is present - then {@link onComponentRemoved} will be
     *  dispatched after removing it from the entity.
     *
     * If linked component type provided:
     * - For each instance of linked component {@link onComponentRemoved} will be called
     * - Only head of the linked list will be returned.
     *
     * If you need to get all instances use {@link withdraw} or {@link pick} instead, or check {@link iterate},
     * {@link getAll}
     *
     * @param componentClassOrTag Specific component class
     * @returns Component instance or `undefined` if it doesn't exists in the entity
     */
    Entity.prototype.removeComponent = function (componentClassOrTag) {
        var id = ComponentId_1.getComponentId(componentClassOrTag);
        if (id === undefined || this._components[id] === undefined) {
            return undefined;
        }
        var value = this._components[id];
        if (LinkedComponent_1.isLinkedComponent(value)) {
            var list = this.getLinkedComponentList(componentClassOrTag);
            while (!list.isEmpty) {
                this.withdraw(componentClassOrTag);
            }
        }
        else {
            delete this._components[id];
            this.dispatchOnComponentRemoved(value);
        }
        return value;
    };
    /**
     * Removes a tag from the entity.
     *  In case if the component tag is present - then {@link onComponentRemoved} will be
     *  dispatched after removing it from the entity
     *
     * @param {Tag} tag Specific tag
     * @returns {void}
     */
    Entity.prototype.removeTag = function (tag) {
        if (this._tags.has(tag)) {
            this._tags.delete(tag);
            this.dispatchOnComponentRemoved(tag);
        }
    };
    /**
     * Removes all components and tags from entity
     */
    Entity.prototype.clear = function () {
        this._components = {};
        this._linkedComponents = {};
        this._tags.clear();
    };
    /**
     * Copies content from entity to itself.
     * Linked components structure will be copied by the link, because we can't duplicate linked list order without
     * cloning components itself. So modifying linked components in the copy will affect linked components in copy
     * source.
     *
     * @param {Entity} entity
     * @return {this}
     */
    Entity.prototype.copyFrom = function (entity) {
        this._components = Object.assign({}, entity._components);
        this._linkedComponents = Object.assign({}, entity._linkedComponents);
        this._tags = new Set(entity._tags);
        return this;
    };
    /**
     * Iterates over instances of linked component appended to the Entity and performs the action over each.<br>
     * Works and for standard components (action will be called for a single instance in this case).
     *
     * @param {Class<T>} componentClass Component`s class
     * @param {(component: T) => void} action Action to perform over every component instance.
     * @example
     * ```ts
     * class Boon extends LinkedComponent {
     *   public constructor(
     *     public type: BoonType,
     *     public duration: number
     *   ) { super(); }
     * }
     * const entity = new Entity()
     *   .append(new Boon(BoonType.HEAL, 2))
     *   .append(new Boon(BoonType.PROTECTION, 3);
     *
     * // Let's decrease every boon duration and remove them if they are expired.
     * entity.iterate(Boon, (boon) => {
     *   if (--boon.duration <= 0) {
     *      entity.pick(boon);
     *   }
     * });
     * ```
     */
    Entity.prototype.iterate = function (componentClass, action) {
        var _a;
        if (!this.hasComponent(componentClass))
            return;
        (_a = this.getLinkedComponentList(componentClass)) === null || _a === void 0 ? void 0 : _a.iterate(action);
    };
    /**
     * Returns generator with all instances of specified linked component class
     *
     * @param {Class<T>} componentClass Component`s class
     * @example
     * ```ts
     * for (const damage of entity.linkedComponents(Damage)) {
     *   if (damage.value < 0) {
     *   throw new Error('Damage value can't be less than zero');
     * }
     * ```
     */
    Entity.prototype.getAll = function (componentClass) {
        var list;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!this.hasComponent(componentClass))
                        return [2 /*return*/];
                    list = this.getLinkedComponentList(componentClass, false);
                    if (list === undefined)
                        return [2 /*return*/, undefined];
                    return [5 /*yield**/, tslib_1.__values(list.nodes())];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    /**
     * Searches a component instance of specified linked component class.
     * Works and for standard components (predicate will be called for a single instance in this case).
     *
     * @param {Class<T>} componentClass
     * @param {(component: T) => boolean} predicate
     * @return {T | undefined}
     */
    Entity.prototype.find = function (componentClass, predicate) {
        var componentIdToFind = ComponentId_1.getComponentId(componentClass, false);
        if (componentIdToFind === undefined)
            return undefined;
        var component = this._components[componentIdToFind];
        if (component === undefined)
            return undefined;
        if (LinkedComponent_1.isLinkedComponent(component)) {
            var linkedComponent = component;
            while (linkedComponent !== undefined) {
                if (predicate(linkedComponent))
                    return linkedComponent;
                linkedComponent = linkedComponent.next;
            }
        }
        else
            return predicate(component) ? component : undefined;
    };
    /**
     * Returns number of components of specified class.
     *
     * @param {Class<T>} componentClass
     * @return {number}
     */
    Entity.prototype.lengthOf = function (componentClass) {
        var result = 0;
        this.iterate(componentClass, function () {
            result++;
        });
        return result;
    };
    /**
     * Use this method to dispatch that entity component properties were changed, in case if
     * queries predicates are depends on them.
     * Components properties are not tracking by Engine itself, because it's too expensive.
     */
    Entity.prototype.invalidate = function () {
        this.onInvalidationRequested.emit(this);
    };
    /**
     * @internal
     * @param {EntitySnapshot} result
     * @param {T} changedComponentOrTag
     * @param {Class<T>} resolveClass
     */
    Entity.prototype.takeSnapshot = function (result, changedComponentOrTag, resolveClass) {
        var previousState = result.previous;
        if (result.current !== this) {
            result.current = this;
            previousState.copyFrom(this);
        }
        if (changedComponentOrTag === undefined) {
            return;
        }
        if (Tag_1.isTag(changedComponentOrTag)) {
            var previousTags = previousState._tags;
            if (this.has(changedComponentOrTag)) {
                previousTags.delete(changedComponentOrTag);
            }
            else {
                previousTags.add(changedComponentOrTag);
            }
        }
        else {
            var componentClass = resolveClass !== null && resolveClass !== void 0 ? resolveClass : Object.getPrototypeOf(changedComponentOrTag).constructor;
            var componentId = ComponentId_1.getComponentId(componentClass, true);
            var previousComponents = previousState._components;
            if (this.has(componentClass)) {
                delete previousComponents[componentId];
            }
            else {
                previousComponents[componentId] = changedComponentOrTag;
            }
        }
    };
    /**
     * @internal
     */
    Entity.prototype.getLinkedComponentList = function (componentClassOrId, createIfNotExists) {
        if (createIfNotExists === void 0) { createIfNotExists = true; }
        if (typeof componentClassOrId !== 'number') {
            componentClassOrId = ComponentId_1.getComponentId(componentClassOrId);
        }
        if (this._linkedComponents[componentClassOrId] !== undefined || !createIfNotExists) {
            return this._linkedComponents[componentClassOrId];
        }
        else {
            return this._linkedComponents[componentClassOrId] = new LinkedComponentList_1.LinkedComponentList();
        }
    };
    Entity.prototype.withdrawComponent = function (component, resolveClass) {
        var componentClass = ComponentId_1.getComponentClass(component, resolveClass);
        if (!LinkedComponent_1.isLinkedComponent(component)) {
            return this.remove(componentClass);
        }
        var componentList = this.getLinkedComponentList(componentClass, false);
        if (!this.hasComponent(componentClass) || componentList === undefined)
            return undefined;
        var result = componentList.remove(component) ? component : undefined;
        var componentId = ComponentId_1.getComponentId(componentClass, true);
        if (componentList.isEmpty) {
            delete this._components[componentId];
            delete this._linkedComponents[componentId];
        }
        else {
            this._components[componentId] = componentList.head;
        }
        if (result !== undefined) {
            this.dispatchOnComponentRemoved(result);
        }
        return result;
    };
    Entity.prototype.dispatchOnComponentAdded = function (component) {
        if (this.onComponentAdded.hasHandlers) {
            this.onComponentAdded.emit(this, component);
        }
    };
    Entity.prototype.dispatchOnComponentRemoved = function (value) {
        if (this.onComponentRemoved.hasHandlers) {
            this.onComponentRemoved.emit(this, value);
        }
    };
    Entity.NumberComponents = 0;
    return Entity;
}());
exports.Entity = Entity;
/**
 * EntitySnapshot is a content container that displays the difference between the current state of Entity and its
 * previous state.
 *
 * The {@link EntitySnapshot.current} property always reflects the current state, and {@link EntitySnapshot.previous} -
 * previous one. So you can understand which components have been added and which have been removed.
 *
 * <p>It is important to note that changes in the data of the same entity components will not be reflected in the
 * snapshot, even if a manual invalidation of the entity has been triggered.</p>
 */
var EntitySnapshot = /** @class */ (function () {
    function EntitySnapshot() {
        this._previous = new Entity();
    }
    Object.defineProperty(EntitySnapshot.prototype, "current", {
        /**
         * Gets an instance of the actual entity
         * @returns {Entity}
         */
        get: function () {
            return this._current;
        },
        /**
         * @internal
         */
        set: function (value) {
            this._current = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EntitySnapshot.prototype, "previous", {
        /**
         * Gets an instance of the previous state of entity
         */
        get: function () {
            return this._previous;
        },
        enumerable: false,
        configurable: true
    });
    return EntitySnapshot;
}());
exports.EntitySnapshot = EntitySnapshot;
/**
 * Entity ids enumerator
 */
var entityId = 1;
