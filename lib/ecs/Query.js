"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeQuery = exports.not = exports.any = exports.all = exports.isQueryBuilder = exports.isQueryPredicate = exports.QueryBuilder = exports.Query = void 0;
var tslib_1 = require("tslib");
var ComponentId_1 = require("./ComponentId");
var Entity_1 = require("./Entity");
var Tag_1 = require("./Tag");
var Signal_1 = require("../utils/Signal");
var LinkedComponent_1 = require("./LinkedComponent");
/**
 * Query represents list of entities that matches query request.
 * @see QueryBuilder
 */
var Query = /** @class */ (function () {
    /**
     * Initializes Query instance
     * @param predicate Matching predicate
     */
    function Query(predicate) {
        var _this = this;
        /**
         * Signal dispatches if new matched entity were added
         */
        this.onEntityAdded = new Signal_1.Signal();
        /**
         * Signal dispatches if entity stops matching query
         */
        this.onEntityRemoved = new Signal_1.Signal();
        this._helper = new Entity_1.Entity();
        this._snapshot = new Entity_1.EntitySnapshot();
        this._entities = [];
        /**
         * @internal
         */
        this.entityAdded = function (entity) {
            var index = _this._entities.indexOf(entity);
            if (index === -1 && _this._predicate(entity)) {
                _this._entities.push(entity);
                if (_this.onEntityAdded.hasHandlers) {
                    entity.takeSnapshot(_this._snapshot);
                    _this.onEntityAdded.emit(_this._snapshot);
                }
            }
        };
        /**
         * @internal
         */
        this.entityRemoved = function (entity) {
            var index = _this._entities.indexOf(entity);
            if (index !== -1) {
                _this._entities.splice(index, 1);
                if (_this.onEntityRemoved.hasHandlers) {
                    entity.takeSnapshot(_this._snapshot);
                    _this.onEntityRemoved.emit(_this._snapshot);
                }
            }
        };
        /**
         * @internal
         */
        this.entityComponentAdded = function (entity, componentOrTag, componentClass) {
            var hasAddedHandlers = _this.onEntityAdded.hasHandlers;
            var hasRemovedHandlers = _this.onEntityRemoved.hasHandlers;
            _this.updateHelper(entity, componentOrTag, componentClass);
            var index = _this._entities.indexOf(entity);
            var isMatch = _this._predicate(_this._helper);
            if (index === -1 && isMatch) {
                _this._entities.push(entity);
                if (hasAddedHandlers) {
                    entity.takeSnapshot(_this._snapshot, componentOrTag, componentClass);
                    _this.onEntityAdded.emit(_this._snapshot);
                }
            }
            else if (index !== -1 && !isMatch) {
                _this._entities.splice(index, 1);
                if (hasRemovedHandlers) {
                    entity.takeSnapshot(_this._snapshot, componentOrTag, componentClass);
                    _this.onEntityRemoved.emit(_this._snapshot);
                }
            }
        };
        /**
         * @internal
         */
        this.entityComponentRemoved = function (entity, component, componentClass) {
            var hasAddedHandlers = _this.onEntityAdded.hasHandlers;
            var hasRemovedHandlers = _this.onEntityRemoved.hasHandlers;
            _this.updateHelper(entity, component, componentClass);
            var index = _this._entities.indexOf(entity);
            if (index !== -1 && _this._predicate(_this._helper) && !_this._predicate(entity)) {
                _this._entities.splice(index, 1);
                if (hasRemovedHandlers) {
                    entity.takeSnapshot(_this._snapshot, component, componentClass);
                    _this.onEntityRemoved.emit(_this._snapshot);
                }
            }
            else if (index === -1 && _this._predicate(entity) && !_this._predicate(_this._helper)) {
                _this._entities.push(entity);
                if (hasAddedHandlers) {
                    entity.takeSnapshot(_this._snapshot, component, componentClass);
                    _this.onEntityAdded.emit(_this._snapshot);
                }
            }
        };
        this._predicate = predicate;
    }
    Query.prototype[Symbol.iterator] = function () {
        var _a, _b, entity, e_1_1;
        var e_1, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, 6, 7]);
                    _a = tslib_1.__values(this.entities), _b = _a.next();
                    _d.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 4];
                    entity = _b.value;
                    return [4 /*yield*/, entity];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    };
    Object.defineProperty(Query.prototype, "entities", {
        /**
         * Entities list which matches the query
         */
        get: function () {
            return this._entities;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Query.prototype, "first", {
        /**
         * Returns the first entity in the query or `undefined` if query is empty.
         * @returns {Entity | undefined}
         */
        get: function () {
            if (this._entities.length === 0)
                return undefined;
            return this._entities[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Query.prototype, "last", {
        /**
         * Returns the last entity in the query or `undefined` if query is empty.
         * @returns {Entity | undefined}
         */
        get: function () {
            if (this._entities.length === 0)
                return undefined;
            return this._entities[this._entities.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Query.prototype, "length", {
        /**
         * Returns the number of the entities in the query
         * @returns {Entity | undefined}
         */
        get: function () {
            return this._entities.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the number of entities that have been tested by the predicate.
     * @param {(entity: Entity) => boolean} predicate
     * @returns {number}
     */
    Query.prototype.countBy = function (predicate) {
        var e_2, _a;
        var result = 0;
        try {
            for (var _b = tslib_1.__values(this._entities), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entity = _c.value;
                if (predicate(entity))
                    result++;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return result;
    };
    Query.prototype.firstBy = function (predicate) {
        var e_3, _a;
        try {
            for (var _b = tslib_1.__values(this._entities), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entity = _c.value;
                if (predicate(entity))
                    return entity;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return undefined;
    };
    Query.prototype.includes = function (entity) {
        return this._entities.includes(entity);
    };
    Query.prototype.forEach = function (predicate) {
        this._entities.forEach(predicate);
    };
    Query.prototype.map = function (predicate) {
        return this._entities.map(predicate);
    };
    /**
     * Returns the first entity from the query, that was accepted by predicate
     * @param {(entity: Entity) => boolean} predicate - function that will be called for every entity in the query until
     *  the result of the function become true.
     * @returns {Entity | undefined}
     */
    Query.prototype.find = function (predicate) {
        return this._entities.find(predicate);
    };
    /**
     * Returns new array of entities, which passed testing via predicate
     * @param {(entity: Entity) => boolean} predicate - function that will be called for every entity in the query.
     *  If function returns `true` - entity will stay in the array, if `false` than it will be removed.
     * @returns {Entity[]}
     */
    Query.prototype.filter = function (predicate) {
        return this._entities.filter(predicate);
    };
    /**
     * Returns a value that indicates whether the entity is in the Query.
     * @param {Entity} entity
     * @returns {boolean}
     */
    Query.prototype.has = function (entity) {
        return this._entities.indexOf(entity) !== -1;
    };
    /**
     * This method is matching passed list of entities with predicate of the query to determine
     * if entities are the part of query or not.
     *
     * Entities that will pass testing will become a part of the query
     */
    Query.prototype.matchEntities = function (entities) {
        var _this = this;
        entities.forEach(function (entity) { return _this.entityAdded(entity); });
    };
    Object.defineProperty(Query.prototype, "isEmpty", {
        /**
         * Gets a value indicating that query is empty
         */
        get: function () {
            return this.entities.length == 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clears the list of entities of the query
     */
    Query.prototype.clear = function () {
        this._entities = [];
    };
    /**
     * @internal
     */
    Query.prototype.validateEntity = function (entity) {
        var index = this.entities.indexOf(entity);
        var isMatch = this._predicate(entity);
        if (index !== -1 && !isMatch) {
            this.entityRemoved(entity);
        }
        else {
            this.entityAdded(entity);
        }
    };
    Query.prototype.updateHelper = function (entity, component, resolveClass) {
        this._helper.clear();
        this._helper.copyFrom(entity);
        if (!LinkedComponent_1.isLinkedComponent(component)) {
            this._helper.add(component);
        }
        else if (!this._helper.has(ComponentId_1.getComponentClass(component, resolveClass))) {
            this._helper.append(component);
        }
    };
    return Query;
}());
exports.Query = Query;
function hasAll(entity, components, tags) {
    var e_4, _a, e_5, _b;
    if (components.size > 0) {
        try {
            for (var components_1 = tslib_1.__values(components), components_1_1 = components_1.next(); !components_1_1.done; components_1_1 = components_1.next()) {
                var componentId = components_1_1.value;
                if (entity.components[componentId] === undefined) {
                    return false;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (components_1_1 && !components_1_1.done && (_a = components_1.return)) _a.call(components_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    }
    if (tags.size > 0) {
        try {
            for (var tags_1 = tslib_1.__values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                var tag = tags_1_1.value;
                if (!entity.tags.has(tag)) {
                    return false;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (tags_1_1 && !tags_1_1.done && (_b = tags_1.return)) _b.call(tags_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
    }
    return true;
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
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder() {
        this._components = new Set();
        this._tags = new Set();
    }
    /**
     * Specifies components that must be added to entity to be matched
     * @param componentsOrTags
     */
    QueryBuilder.prototype.contains = function () {
        var e_6, _a;
        var componentsOrTags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            componentsOrTags[_i] = arguments[_i];
        }
        try {
            for (var componentsOrTags_1 = tslib_1.__values(componentsOrTags), componentsOrTags_1_1 = componentsOrTags_1.next(); !componentsOrTags_1_1.done; componentsOrTags_1_1 = componentsOrTags_1.next()) {
                var componentOrTag = componentsOrTags_1_1.value;
                if (Tag_1.isTag(componentOrTag)) {
                    if (!this._tags.has(componentOrTag)) {
                        this._tags.add(componentOrTag);
                    }
                }
                else {
                    var componentId = ComponentId_1.getComponentId(componentOrTag, true);
                    if (!this._components.has(componentId)) {
                        this._components.add(componentId);
                    }
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (componentsOrTags_1_1 && !componentsOrTags_1_1.done && (_a = componentsOrTags_1.return)) _a.call(componentsOrTags_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return this;
    };
    /**
     * Build query
     */
    QueryBuilder.prototype.build = function () {
        var _this = this;
        return new Query(function (entity) { return hasAll(entity, _this._components, _this._tags); });
    };
    /**
     * @internal
     */
    QueryBuilder.prototype.getComponents = function () {
        return this._components;
    };
    /**
     * @internal
     */
    QueryBuilder.prototype.getTags = function () {
        return this._tags;
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
/**
 * @internal
 */
function isQueryPredicate(item) {
    return typeof item === 'function';
}
exports.isQueryPredicate = isQueryPredicate;
/**
 * @internal
 */
function isQueryBuilder(item) {
    return item instanceof QueryBuilder;
}
exports.isQueryBuilder = isQueryBuilder;
var all = function () {
    var componentClassOrTag = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        componentClassOrTag[_i] = arguments[_i];
    }
    return function (entity) {
        return entity.hasAll.apply(entity, tslib_1.__spreadArray([], tslib_1.__read(componentClassOrTag)));
    };
};
exports.all = all;
var any = function () {
    var componentClassOrTag = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        componentClassOrTag[_i] = arguments[_i];
    }
    return function (entity) {
        return entity.hasAny.apply(entity, tslib_1.__spreadArray([], tslib_1.__read(componentClassOrTag)));
    };
};
exports.any = any;
var not = function () {
    var componentClassOrTag = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        componentClassOrTag[_i] = arguments[_i];
    }
    return function (entity) {
        return !entity.hasAny.apply(entity, tslib_1.__spreadArray([], tslib_1.__read(componentClassOrTag)));
    };
};
exports.not = not;
var makeQuery = function () {
    var patterns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        patterns[_i] = arguments[_i];
    }
    return new Query(function (entity) {
        return patterns.every(function (p) { return p(entity); });
    });
};
exports.makeQuery = makeQuery;
