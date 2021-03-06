"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTag = void 0;
/**
 * This predicate can help you to understand whether item is a component or tag
 * @param item
 * @returns {item is Tag}
 */
function isTag(item) {
    var type = typeof item;
    return type === 'string' || type === 'number';
}
exports.isTag = isTag;
