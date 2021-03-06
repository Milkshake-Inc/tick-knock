"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IterativeSystem = void 0;
var tslib_1 = require("tslib");
var ReactionSystem_1 = require("./ReactionSystem");
/**
 * Iterative system made for iterating over entities that matches its query.
 *
 * @example
 * You have a View component, that is responsible for entity displaying and contains an image.
 * So every step you want to update image positions, that can depends on Position component.
 *
 * ```ts
 * class ViewSystem extends IterativeSystem {
 *   constructor(container:Container) {
 *      super(new Query((entity:Entity) => entity.hasAll(View, Position));
 *      this.container = container;
 *   }
 *
 *   // Update entity view position on screen, via position component data
 *   updateEntity(entity:Entity) {
 *     const {view} = entity.get(View)!;
 *     const {x, y) = entity.get(Position)!;
 *     view.x = x;
 *     view.y = y;
 *   }
 *
 *   // Add entity view from screen
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
var IterativeSystem = /** @class */ (function (_super) {
    tslib_1.__extends(IterativeSystem, _super);
    function IterativeSystem(query) {
        var _this = _super.call(this, query) || this;
        _this._removed = false;
        return _this;
    }
    IterativeSystem.prototype.update = function (dt) {
        this.updateEntities(dt);
    };
    IterativeSystem.prototype.onRemovedFromEngine = function () {
        this._removed = true;
        _super.prototype.onRemovedFromEngine.call(this);
    };
    IterativeSystem.prototype.updateEntities = function (dt) {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(this.query.entities), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entity = _c.value;
                if (this._removed)
                    return;
                this.updateEntity(entity, dt);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return IterativeSystem;
}(ReactionSystem_1.ReactionSystem));
exports.IterativeSystem = IterativeSystem;
