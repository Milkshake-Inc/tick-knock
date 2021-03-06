import { Query, QueryBuilder, QueryPredicate } from './Query';
import { Entity, EntitySnapshot } from './Entity';
import { System } from './System';
/**
 * Represents a system that reacts when entities are added to or removed from its query.
 * `entityAdded` and `entityRemoved` will be called accordingly.
 *
 * @example
 * ```ts
 * class ViewSystem extends ReactionSystem {
 *   constructor(
 *      private readonly container:Container
 *   ) {
 *      super(new Query((entity:Entity) => entity.has(View));
 *   }
 *
 *   // Add entity view to the screen
 *   entityAdded = ({entity}:EntitySnapshot) => {
 *    this.container.add(entity.get(View)!.view);
 *   }
 *
 *   // Remove entity view from screen
 *   entityRemoved = (snapshot:EntitySnapshot) => {
 *    this.container.remove(snapshot.get(View)!.view);
 *   }
 * }
 * ```
 */
export declare abstract class ReactionSystem extends System {
    protected readonly query: Query;
    protected constructor(query: Query | QueryBuilder | QueryPredicate);
    protected get entities(): ReadonlyArray<Entity>;
    onAddedToEngine(): void;
    onRemovedFromEngine(): void;
    protected prepare(): void;
    /**
     * Method will be called for every new entity that matches system query.
     * You could easily override it with your own logic.
     *
     * Note: Method will not be called for already existing in query entities (at the adding system to engine phase),
     * only new entities will be handled
     *
     * @param entity EntitySnapshot that contains entity that was removed from query or engine, and components that it has
     *   before adding, and component that will be added
     */
    protected entityAdded: (entity: EntitySnapshot) => void;
    /**
     * Method will be called for every entity matches system query, that is going to be removed from engine, or it stops
     * matching to the query.
     * You could easily override it with your own logic.
     *
     * @param entity EntitySnapshot that contains entity that was removed from query or engine, and components that it has
     *   before removing
     */
    protected entityRemoved: (entity: EntitySnapshot) => void;
}
