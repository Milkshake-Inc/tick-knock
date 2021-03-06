/**
 * Lightweight implementation of Signal
 */
export declare class Signal<Handler extends (...args: any[]) => any> {
    private readonly handlers;
    /**
     * Gets a value that indicates whether signal has handlers
     * @return {boolean}
     */
    get hasHandlers(): boolean;
    /**
     * Gets an amount of connected handlers
     * @return {number}
     */
    get handlersAmount(): number;
    /**
     * Connects signal handler, that will be invoked on signal emit.
     * @param {Handler} handler
     * @param priority Handler invocation priority (handler with higher priority will be called later than with lower one)
     */
    connect(handler: Handler, priority?: number): void;
    /**
     * Disconnects signal handler
     * @param {Handler} handler
     */
    disconnect(handler: Handler): void;
    /**
     * Disconnects all signal handlers
     * @param {Handler} handler
     */
    disconnectAll(): void;
    /**
     * Invokes connected handlers with passed parameters.
     * @param {any} args
     */
    emit(...args: Parameters<Handler>): void;
}
