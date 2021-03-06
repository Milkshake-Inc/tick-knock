"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
/**
 * @internal
 */
var Subscription = /** @class */ (function () {
    function Subscription(messageType, handler) {
        this.messageType = messageType;
        this.handler = handler;
    }
    Subscription.prototype.equals = function (messageType, handler) {
        return this.messageType === messageType && (handler === undefined || this.handler === handler);
    };
    return Subscription;
}());
exports.Subscription = Subscription;
