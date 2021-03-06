"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedComponentList = void 0;
var tslib_1 = require("tslib");
var LinkedComponentList = /** @class */ (function () {
    function LinkedComponentList() {
    }
    Object.defineProperty(LinkedComponentList.prototype, "head", {
        get: function () {
            return this._head;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LinkedComponentList.prototype, "isEmpty", {
        get: function () {
            return this._head === undefined;
        },
        enumerable: false,
        configurable: true
    });
    LinkedComponentList.prototype.add = function (linkedComponent) {
        var prev = undefined;
        var current = this._head;
        while (current !== undefined) {
            if (current === linkedComponent) {
                throw new Error('Component is already appended, appending it once again will break linked items order');
            }
            prev = current;
            current = current.next;
        }
        if (this._head === undefined) {
            this._head = linkedComponent;
        }
        else {
            prev.next = linkedComponent;
        }
    };
    LinkedComponentList.prototype.remove = function (linkedComponent) {
        var _a = tslib_1.__read(this.find(linkedComponent), 2), prev = _a[0], current = _a[1];
        if (current === undefined) {
            return false;
        }
        if (prev === undefined) {
            this._head = current.next;
        }
        else {
            prev.next = current.next;
        }
        return true;
    };
    LinkedComponentList.prototype.nodes = function () {
        var node;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    node = this.head;
                    _a.label = 1;
                case 1:
                    if (!(node !== undefined)) return [3 /*break*/, 3];
                    return [4 /*yield*/, node];
                case 2:
                    _a.sent();
                    node = node.next;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    LinkedComponentList.prototype.iterate = function (action) {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(this.nodes()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var node = _c.value;
                action(node);
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
    LinkedComponentList.prototype.clear = function () {
        this._head = undefined;
    };
    LinkedComponentList.prototype.find = function (linkedComponent) {
        var prev;
        var current = this._head;
        while (current !== undefined) {
            if (current === linkedComponent) {
                return [prev, current];
            }
            prev = current;
            current = current.next;
        }
        return [undefined, undefined];
    };
    return LinkedComponentList;
}());
exports.LinkedComponentList = LinkedComponentList;
