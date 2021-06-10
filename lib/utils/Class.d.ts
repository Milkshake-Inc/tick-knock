export declare type Class<T> = {
    new (...args: any[]): T;
};
export declare const isClass: <T>(value: T | Class<T>) => value is Class<T>;
export declare const isFunction: (func: any) => func is Function;
