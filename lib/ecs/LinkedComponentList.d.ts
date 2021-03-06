import { ILinkedComponent } from './LinkedComponent';
export declare class LinkedComponentList<T extends ILinkedComponent> {
    private _head?;
    get head(): T | undefined;
    get isEmpty(): boolean;
    add(linkedComponent: T): void;
    remove(linkedComponent: T): boolean;
    nodes(): Generator<T, void, unknown>;
    iterate(action: (value: T) => void): void;
    clear(): void;
    private find;
}
