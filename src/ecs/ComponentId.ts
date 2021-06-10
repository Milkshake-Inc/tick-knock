import { Class } from '../utils/Class';

const componentIds = new Map<string, number>();
let componentClassId = 1;

/**
 * Gets an id for a component class.
 *
 * @param component Component class
 * @param createIfNotExists If defined - will create unique id for class component, if it's not defined before
 */
export function getComponentId<T>(component: Class<T>, createIfNotExists = false): number | undefined {
  if (component == undefined) return undefined;

  const className = component.prototype ? component.prototype.constructor.name : component.constructor.name;
  if (componentIds.has(className)) {
    return componentIds.get(className);
  } else if (createIfNotExists) {
    componentIds.set(className, componentClassId++);
    return componentIds.get(className);
  }

  return undefined;
}

/**
 * @internal
 */
export function getComponentClass<T extends K, K>(component: NonNullable<T>, resolveClass?: Class<K>) {
  let componentClass = Object.getPrototypeOf(component).constructor as Class<T>;
  if (resolveClass) {
    if (!(component instanceof resolveClass || componentClass === resolveClass)) {
      throw new Error('Resolve class should be an ancestor of component class');
    }
    componentClass = resolveClass as Class<T>;
  }
  return componentClass;
}
