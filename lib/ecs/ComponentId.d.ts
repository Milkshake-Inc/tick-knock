import { Class } from '../utils/Class';
/**
 * Gets an id for a component class.
 *
 * @param component Component class
 * @param createIfNotExists If defined - will create unique id for class component, if it's not defined before
 */
export declare function getComponentId<T>(component: Class<T>, createIfNotExists?: boolean): number | undefined;
