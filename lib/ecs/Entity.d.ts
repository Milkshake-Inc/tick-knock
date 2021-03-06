import { Class } from '../utils/Class';
import { Signal } from '../utils/Signal';
import { Tag } from './Tag';
import { ILinkedComponent } from './LinkedComponent';
/**
 * Entity readonly interface
 */
export interface ReadonlyEntity {
    /**
     * The signal dispatches if new component or tag was added to the entity
     */
    readonly onComponentAdded: Signal<ComponentUpdateHandler>;
    /**
     * The signal dispatches if component was removed from the entity
     */
    readonly onComponentRemoved: Signal<ComponentUpdateHandler>;
    /**
     * Returns components map, where key is component identifier, and value is a component itself
     * @see {@link getComponentId}, {@link Entity.getComponents}
     */
    readonly components: Readonly<Record<number, unknown>>;
    /**
     * Returns set of tags applied to the entity
     * @see getComponentId
     */
    readonly tags: ReadonlySet<Tag>;
    /**
     * Returns value indicating whether entity has a specific component or tag
     *
     * @param {Class | Tag} componentClassOrTag
     * @example
     * ```ts
     * const BERSERK = 10091;
     * if (!entity.has(Immobile) || entity.has(BERSERK)) {
     *   const position = entity.get(Position)!;
     *   position.x += 1;
     * }
     * ```
     */
    has<T>(componentClassOrTag: Class<T> | Tag): boolean;
    /**
     * Returns value indicating whether entity contains a component instance.
     * If the component is an instance of ILinkedComponent then all components of its type will be checked for equality.
     *
     * @param {T} component
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
    contains<T extends K, K>(component: T, resolveClass?: Class<K>): boolean;
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
    hasComponent<T>(component: Class<T>): boolean;
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
    hasTag(tag: Tag): boolean;
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
    hasAny(...componentClassOrTag: Array<Class<unknown> | Tag>): boolean;
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
    hasAll(...componentClassOrTag: Array<Class<unknown> | Tag>): boolean;
    /**
     * Returns an array of entity components
     *
     * @returns {unknown[]}
     */
    getComponents(): unknown[];
    /**
     * Returns an array of tags applied to the entity
     */
    getTags(): Tag[];
    /**
     * Gets a component instance if it's exists in the entity, otherwise returns `undefined`
     * - If you want to check presence of the tag then use {@link has} instead.
     *
     * @param componentClass Specific component class
     */
    get<T>(componentClass: Class<T>): T | undefined;
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
    iterate<T>(componentClass: Class<T>, action: (component: T) => void): void;
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
    getAll<T>(componentClass: Class<T>): Generator<T, void, T>;
    /**
     * Searches a component instance of specified linked component class.
     * Works and for standard components (predicate will be called for a single instance in this case).
     *
     * @param {Class<T>} componentClass
     * @param {(component: T) => boolean} predicate
     * @return {T | undefined}
     */
    find<T>(componentClass: Class<T>, predicate: (component: T) => boolean): T | undefined;
    /**
     * Returns number of components of specified class.
     *
     * @param {Class<T>} componentClass
     * @return {number}
     */
    lengthOf<T>(componentClass: Class<T>): number;
}
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
export declare class Entity implements ReadonlyEntity {
    /**
     * The signal dispatches if new component or tag was added to the entity. Works for every linked component as well.
     */
    readonly onComponentAdded: Signal<ComponentUpdateHandler>;
    /**
     * The signal dispatches if component was removed from the entity. Works for every linked component as well.
     */
    readonly onComponentRemoved: Signal<ComponentUpdateHandler>;
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
    readonly onInvalidationRequested: Signal<(entity: Entity) => void>;
    /**
     * Unique id identifier
     */
    readonly id: number;
    private _components;
    private _linkedComponents;
    private _tags;
    static NumberComponents: number;
    /**
     * Returns components map, where key is component identifier, and value is a component itself
     * @see {@link getComponentId}, {@link Entity.getComponents}
     */
    get components(): Readonly<Record<number, unknown>>;
    /**
     * Returns set of tags applied to the entity
     * @see getComponentId
     */
    get tags(): ReadonlySet<Tag>;
    toString(): string;
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
    add<T extends K, K extends unknown>(componentOrTag: Class<T> | NonNullable<T> | Tag, data?: Partial<T>, resolveClass?: Class<K>): Entity;
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
    append<T extends K, K extends ILinkedComponent>(component: NonNullable<T>, resolveClass?: Class<K>): Entity;
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
    withdraw<T>(componentClass: Class<T>): T | undefined;
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
    pick<T>(component: NonNullable<T>, resolveClass?: Class<T>): T | undefined;
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
    addComponent<T extends K, K extends unknown>(component: NonNullable<T>, resolveClass?: Class<K>): void;
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
    appendComponent<T extends K, K extends ILinkedComponent>(component: NonNullable<T>, resolveClass?: Class<K>): Entity;
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
    addTag(tag: Tag): void;
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
    has<T>(componentClassOrTag: Class<T> | Tag): boolean;
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
    contains<T extends K, K>(component: NonNullable<T>, resolveClass?: Class<K>): boolean;
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
    hasComponent<T>(component: Class<T>): boolean;
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
    hasTag(tag: Tag): boolean;
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
    hasAny(...componentClassOrTag: Array<Class<unknown> | Tag>): boolean;
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
    hasAll(...componentClassOrTag: Array<Class<unknown> | Tag>): boolean;
    /**
     * Gets a component instance if it's exists in the entity, otherwise returns `undefined`
     * - If you want to check presence of the tag then use {@link has} instead.
     *
     * @param componentClass Specific component class
     */
    get<T>(componentClass: Class<T>): T | undefined;
    /**
     * Returns an array of entity components
     *
     * @returns {unknown[]}
     */
    getComponents(): unknown[];
    /**
     * Returns an array of tags applied to the entity
     */
    getTags(): Tag[];
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
    remove<T>(componentClassOrTag: Class<T> | Tag): T | undefined;
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
    removeComponent<T>(componentClassOrTag: Class<T>): T | undefined;
    /**
     * Removes a tag from the entity.
     *  In case if the component tag is present - then {@link onComponentRemoved} will be
     *  dispatched after removing it from the entity
     *
     * @param {Tag} tag Specific tag
     * @returns {void}
     */
    removeTag(tag: Tag): void;
    /**
     * Removes all components and tags from entity
     */
    clear(): void;
    /**
     * Copies content from entity to itself.
     * Linked components structure will be copied by the link, because we can't duplicate linked list order without
     * cloning components itself. So modifying linked components in the copy will affect linked components in copy
     * source.
     *
     * @param {Entity} entity
     * @return {this}
     */
    copyFrom(entity: Entity): this;
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
    iterate<T>(componentClass: Class<T>, action: (component: T) => void): void;
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
    getAll<T>(componentClass: Class<T>): Generator<T, void, T | undefined>;
    /**
     * Searches a component instance of specified linked component class.
     * Works and for standard components (predicate will be called for a single instance in this case).
     *
     * @param {Class<T>} componentClass
     * @param {(component: T) => boolean} predicate
     * @return {T | undefined}
     */
    find<T>(componentClass: Class<T>, predicate: (component: T) => boolean): T | undefined;
    /**
     * Returns number of components of specified class.
     *
     * @param {Class<T>} componentClass
     * @return {number}
     */
    lengthOf<T>(componentClass: Class<T>): number;
    /**
     * Use this method to dispatch that entity component properties were changed, in case if
     * queries predicates are depends on them.
     * Components properties are not tracking by Engine itself, because it's too expensive.
     */
    invalidate(): void;
    private withdrawComponent;
    private dispatchOnComponentAdded;
    private dispatchOnComponentRemoved;
}
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
export declare class EntitySnapshot {
    private _current?;
    private _previous;
    /**
     * Gets an instance of the actual entity
     * @returns {Entity}
     */
    get current(): Entity;
    /**
     * Gets an instance of the previous state of entity
     */
    get previous(): ReadonlyEntity;
}
/**
 * Component update handler type.
 * @see {@link Entity.onComponentAdded}
 * @see {@link Entity.onComponentRemoved}
 */
export declare type ComponentUpdateHandler = (entity: Entity, componentOrTag: unknown, componentClass?: Class<unknown>) => void;
