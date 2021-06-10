"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunction = exports.isClass = void 0;
var isClass = function (value) {
    return value.prototype !== undefined;
};
exports.isClass = isClass;
var isFunction = function (func) {
    return func instanceof Function;
};
exports.isFunction = isFunction;
