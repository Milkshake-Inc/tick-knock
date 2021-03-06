import { Entity, EntitySnapshot } from './Entity';
import { Tag } from './Tag';
import { Signal } from '../utils/Signal';
import { Class } from '../utils/Class';
/**
 * Query Predicate is the type that describes a function that compares Entities with the conditions it sets.
 * In other words, it's a function that determines whether Entities meets the right conditions to get into a
 * given Query or not.
 */
export declare type QueryPredicate = (entity: Entity) => boolean;
/**
 * Query represents list of entities that matches query request.
 * @see QueryBuilder
 */
export declare class Query implements Iterable<Entity> {
    [Symbol.iterator](): Iterator<Entity>;
    /**
     * Signal dispatches if new matched entity were added
     */
    onEntityAdded: Signal<(snapshot: EntitySnapshot) => void>;
    /**
     * Signal dispatches if entity stops matching query
     */
    onEntityRemoved: Signal<(snapshot: EntitySnapshot) => void>;
    private readonly _helper;
    private readonly _snapshot;
    private readonly _predicate;
    private _entities;
    /**
     * Initializes Query instance
     * @param predicate Matching predicate
     */
    constructor(predicate: QueryPredicate);
    /**
     * Entities list which matches the query
     */
    get entities(): ReadonlyArray<Entity>;
    /**
     * Returns the first entity in the query or `undefined` if query is empty.
     * @returns {Entity | undefined}
     */
    get first(): Entity | undefined;
    /**
     * Returns the last entity in the query or `undefined` if query is empty.
     * @returns {Entity | undefined}
     */
    get last(): Entity | undefined;
    /**
     * Returns the number of the entities in the query
     * @returns {Entity | undefined}
     */
    get length(): number;
    /**
     * Returns the number of entities that have been tested by the predicate.
     * @param {(entity: Entity) => boolean} predicate
     * @returns {number}
     */
    countBy(predicate: QueryPredicate): number;
    firstBy(predicate: (entity: Entity) => boolean): Entity | undefined;
    includes(entity: Entity): boolean;
    forEach(predicate: (value: Entity, index: number, array: Entity[]) => void): void;
    map<T>(predicate: (entity: Entity) => T): T[];
    /**
     * Returns the first entity from the query, that was accepted by predicate
     * @param {(entity: Entity) => boolean} predicate - function that will be called for every entity in the query until
     *  the result of the function become true.
     * @returns {Entity | undefined}
     */
    find(predicate: QueryPredicate): Entity | undefined;
    /**
     * Returns new array of entities, which passed testing via predicate
     * @param {(entity: Entity) => boolean} predicate - function that will be called for every entity in the query.
     *  If function returns `true` - entity will stay in the array, if `false` than it will be removed.
     * @returns {Entity[]}
     */
    filter(predicate: QueryPredicate): Entity[];
    /**
     * Returns a value that indicates whether the entity is in the Query.
     * @param {Entity} entity
     * @returns {boolean}
     */
    has(entity: Entity): boolean;
    /**
     * This method is matching passed list of entities with predicate of the query to determine
     * if entities are the part of query or not.
     *
     * Entities that will pass testing will become a part of the query
     */
    matchEntities(entities: ReadonlyArray<Entity>): void;
    /**
     * Gets a value indicating that query is empty
     */
    get isEmpty(): boolean;
    /**
     * Clears the list of entities of the query
     */
    clear(): void;
    private updateHelper;
}
/**
 * Query builder, helps to create queries
 * @example
 * const query = new QueryBuilder()
 *  .contains(Position)
 *  .contains(Acceleration)
 *  .contains(TorqueForce)
 *  .build();
 */
export declare class QueryBuilder {
    private readonly _components;
    private readonly _tags;
    /**
     * Specifies components that must be added to entity to be matched
     * @param componentsOrTags
     */
    contains(...componentsOrTags: Array<any>): QueryBuilder;
    /**
     * Build query
     */
    build(): Query;
}
export declare type QueryPattern = (entity: Entity) => boolean;
export declare const all: (...componentClassOrTag: Array<Class<unknown> | Tag>) => QueryPattern;
export declare const any: (...componentClassOrTag: Array<Class<unknown> | Tag>) => QueryPattern;
export declare const not: (...componentClassOrTag: Array<Class<unknown> | Tag>) => QueryPattern;
export declare const makeQuery: (...patterns: QueryPattern[]) => Query;
