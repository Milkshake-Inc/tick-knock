"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentClass = exports.getComponentId = void 0;
var componentIds = new Map();
var componentClassId = 1;
/**
 * Gets an id for a component class.
 *
 * @param component Component class
 * @param createIfNotExists If defined - will create unique id for class component, if it's not defined before
 */
function getComponentId(component, createIfNotExists) {
    if (createIfNotExists === void 0) { createIfNotExists = false; }
    if (component == undefined)
        return undefined;
    var className = component.prototype ? component.prototype.constructor.name : component.constructor.name;
    if (componentIds.has(className)) {
        return componentIds.get(className);
    }
    else if (createIfNotExists) {
        componentIds.set(className, componentClassId++);
        return componentIds.get(className);
    }
    return undefined;
}
exports.getComponentId = getComponentId;
/**
 * @internal
 */
function getComponentClass(component, resolveClass) {
    var componentClass = Object.getPrototypeOf(component).constructor;
    if (resolveClass) {
        if (!(component instanceof resolveClass || componentClass === resolveClass)) {
            throw new Error('Resolve class should be an ancestor of component class');
        }
        componentClass = resolveClass;
    }
    return componentClass;
}
exports.getComponentClass = getComponentClass;
