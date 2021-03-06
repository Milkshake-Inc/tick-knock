"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionSystem = void 0;
var tslib_1 = require("tslib");
var Query_1 = require("./Query");
var System_1 = require("./System");
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
var ReactionSystem = /** @class */ (function (_super) {
    tslib_1.__extends(ReactionSystem, _super);
    function ReactionSystem(query) {
        var _this = _super.call(this) || this;
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
        _this.entityAdded = function (entity) {
        };
        /**
         * Method will be called for every entity matches system query, that is going to be removed from engine, or it stops
         * matching to the query.
         * You could easily override it with your own logic.
         *
         * @param entity EntitySnapshot that contains entity that was removed from query or engine, and components that it has
         *   before removing
         */
        _this.entityRemoved = function (entity) {
        };
        if (Query_1.isQueryBuilder(query)) {
            _this.query = query.build();
        }
        else if (Query_1.isQueryPredicate(query)) {
            _this.query = new Query_1.Query(query);
        }
        else {
            _this.query = query;
        }
        return _this;
    }
    Object.defineProperty(ReactionSystem.prototype, "entities", {
        get: function () {
            return this.query.entities;
        },
        enumerable: false,
        configurable: true
    });
    ReactionSystem.prototype.onAddedToEngine = function () {
        this.engine.addQuery(this.query);
        this.prepare();
        this.query.onEntityAdded.connect(this.entityAdded);
        this.query.onEntityRemoved.connect(this.entityRemoved);
    };
    ReactionSystem.prototype.onRemovedFromEngine = function () {
        this.engine.removeQuery(this.query);
        this.query.onEntityAdded.disconnect(this.entityAdded);
        this.query.onEntityRemoved.disconnect(this.entityRemoved);
        this.query.clear();
    };
    ReactionSystem.prototype.prepare = function () { };
    return ReactionSystem;
}(System_1.System));
exports.ReactionSystem = ReactionSystem;
