"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = void 0;
var tslib_1 = require("tslib");
/**
 * Lightweight implementation of Signal
 */
var Signal = /** @class */ (function () {
    function Signal() {
        this.handlers = [];
    }
    Object.defineProperty(Signal.prototype, "hasHandlers", {
        /**
         * Gets a value that indicates whether signal has handlers
         * @return {boolean}
         */
        get: function () {
            return this.handlers.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Signal.prototype, "handlersAmount", {
        /**
         * Gets an amount of connected handlers
         * @return {number}
         */
        get: function () {
            return this.handlers.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Connects signal handler, that will be invoked on signal emit.
     * @param {Handler} handler
     * @param priority Handler invocation priority (handler with higher priority will be called later than with lower one)
     */
    Signal.prototype.connect = function (handler, priority) {
        if (priority === void 0) { priority = 0; }
        var existingHandler = this.handlers.find(function (it) { return it.equals(handler); });
        var needResort;
        if (existingHandler !== undefined) {
            needResort = existingHandler.priority !== priority;
            existingHandler.priority = priority;
        }
        else {
            var lastHandler = this.handlers[this.handlers.length - 1];
            this.handlers.push(new SignalHandler(handler, priority));
            needResort = (lastHandler !== undefined && lastHandler.priority > priority);
        }
        if (needResort) {
            this.handlers.sort(function (a, b) { return a.priority - b.priority; });
        }
    };
    /**
     * Disconnects signal handler
     * @param {Handler} handler
     */
    Signal.prototype.disconnect = function (handler) {
        var existingHandlerIndex = this.handlers.findIndex(function (it) { return it.equals(handler); });
        if (existingHandlerIndex >= 0) {
            this.handlers.splice(existingHandlerIndex, 1);
        }
    };
    /**
     * Disconnects all signal handlers
     * @param {Handler} handler
     */
    Signal.prototype.disconnectAll = function () {
        this.handlers.length = 0;
    };
    /**
     * Invokes connected handlers with passed parameters.
     * @param {any} args
     */
    Signal.prototype.emit = function () {
        var e_1, _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            for (var _b = tslib_1.__values(this.handlers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var handler = _c.value;
                handler.handle.apply(handler, tslib_1.__spreadArray([], tslib_1.__read(args)));
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
    return Signal;
}());
exports.Signal = Signal;
var SignalHandler = /** @class */ (function () {
    function SignalHandler(handler, priority) {
        this.handler = handler;
        this.priority = priority;
    }
    SignalHandler.prototype.equals = function (handler) {
        return this.handler === handler;
    };
    SignalHandler.prototype.handle = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.handler.apply(this, tslib_1.__spreadArray([], tslib_1.__read(args)));
    };
    return SignalHandler;
}());
