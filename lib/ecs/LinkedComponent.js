"use strict";
/**
 * Linked list interface for linked components
 * @see {@link Entity.append}
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLinkedComponent = exports.LinkedComponent = void 0;
/**
 * Simple ILinkedComponent implementation
 * @see {@link Entity.append}
 */
var LinkedComponent = /** @class */ (function () {
    function LinkedComponent() {
        this.next = undefined;
    }
    return LinkedComponent;
}());
exports.LinkedComponent = LinkedComponent;
/**
 * @internal
 */
function isLinkedComponent(component) {
    return component.hasOwnProperty('next');
}
exports.isLinkedComponent = isLinkedComponent;
