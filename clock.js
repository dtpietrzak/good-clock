"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _calcTimeInterval, _calcValueInterval, _incrementOrDecrement, _runClockCallback;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
class Clock {
    constructor() {
        this.setValue = (value) => {
            this.value = value;
            return (this.value);
        };
        this.setInterval = (interval) => {
            this.valueInterval = interval;
            return (this.valueInterval);
        };
        this.increment = (interval) => {
            if (interval) {
                this.value = this.value + __classPrivateFieldGet(this, _calcValueInterval).call(this, interval);
                return (this.value);
            }
            else {
                this.value = this.value + __classPrivateFieldGet(this, _calcValueInterval).call(this, this.valueInterval);
                return (this.value);
            }
        };
        this.decrement = (interval) => {
            if (interval) {
                this.value = this.value - __classPrivateFieldGet(this, _calcValueInterval).call(this, interval);
                return (this.value);
            }
            else {
                this.value = this.value - __classPrivateFieldGet(this, _calcValueInterval).call(this, this.valueInterval);
                return (this.value);
            }
        };
        // these intervals are off. last_interval keeps sending as a function
        _calcTimeInterval.set(this, (interval) => {
            if (typeof interval === 'number') {
                return interval;
            }
            else {
                return interval(this.value, this.timeInterval);
            }
        }
        // these intervals are off. last_interval keeps sending as a function
        );
        // these intervals are off. last_interval keeps sending as a function
        _calcValueInterval.set(this, (interval) => {
            if (typeof interval === 'number') {
                return interval;
            }
            else {
                return interval(this.value, this.valueInterval);
            }
        });
        _incrementOrDecrement.set(this, () => {
            // increment if only increment option is set to true
            // decrement if decrement or both are set to true
            // do nothing if both are false
            // this isn't intuitive until you go to use the function
            if (this.incrementing && !(this.decrementing)) {
                this.increment();
            }
            else if (this.decrementing) {
                this.decrement();
            }
        });
        _runClockCallback.set(this, () => {
            if (typeof this.callback === 'function') {
                // this if statement is for stopping the clock if the callback returns true
                if (this.callback(this.value))
                    this.stop();
                if (this.endValue) {
                    if (this.decrementing) {
                        if (this.value <= this.endValue) {
                            this.stop();
                            if (this.endCallback)
                                this.endCallback(this.value);
                        }
                    }
                    else {
                        if (this.value >= this.endValue) {
                            this.stop();
                            if (this.endCallback)
                                this.endCallback(this.value);
                        }
                    }
                }
            }
            // check if should, and if should then inc or dec
            __classPrivateFieldGet(this, _incrementOrDecrement).call(this);
        }
        // this starts a repeating clock that calls the clock's callback or an optional callback argument passed to the function. if the internal callback and the optional callback arent set, the clock still increments, but nothing happens. if both are set, only the optional argument callback is called
        );
        // this starts a repeating clock that calls the clock's callback or an optional callback argument passed to the function. if the internal callback and the optional callback arent set, the clock still increments, but nothing happens. if both are set, only the optional argument callback is called
        this.start = (callback, timeInterval, options) => {
            if (this.setinterval == null) {
                if (callback)
                    this.callback = callback;
                if (timeInterval)
                    this.timeInterval = timeInterval;
                if (options === null || options === void 0 ? void 0 : options.incrementing)
                    this.incrementing = options.incrementing;
                if (options === null || options === void 0 ? void 0 : options.decrementing)
                    this.decrementing = options.decrementing;
                if (options === null || options === void 0 ? void 0 : options.skipInitialCallback)
                    this.skipInitialCallback = options.skipInitialCallback;
                if (options === null || options === void 0 ? void 0 : options.incrementBeforeInitialCallback)
                    this.incrementBeforeInitialCallback = options.incrementBeforeInitialCallback;
                if (options === null || options === void 0 ? void 0 : options.valueInterval)
                    this.valueInterval = options.valueInterval;
                if (options === null || options === void 0 ? void 0 : options.startValue)
                    this.startValue = options.startValue;
                if (options === null || options === void 0 ? void 0 : options.endValue)
                    this.endValue = options.endValue;
                if (options === null || options === void 0 ? void 0 : options.endCallback)
                    this.endCallback = options.endCallback;
                if (this.startValue !== undefined) {
                    this.value = this.startValue;
                }
                // if the optional incrementOnInitialCallback is set, do it
                if (this.incrementBeforeInitialCallback)
                    __classPrivateFieldGet(this, _incrementOrDecrement).call(this);
                // if callback is set and it's not set to initially be skipped
                if (!(this.skipInitialCallback))
                    __classPrivateFieldGet(this, _runClockCallback).call(this);
                // start the clock & set the callback on it
                this.setinterval = setInterval(() => {
                    // if callback is set, run it
                    __classPrivateFieldGet(this, _runClockCallback).call(this);
                }, __classPrivateFieldGet(this, _calcTimeInterval).call(this, this.timeInterval));
            }
        };
        this.stop = () => {
            if (this.setinterval != null) {
                clearInterval(this.setinterval);
                this.setinterval = null;
            }
            if (this.startValue)
                this.value = this.startValue;
        };
        this.pause = () => {
            if (this.setinterval != null) {
                clearInterval(this.setinterval);
                this.setinterval = null;
            }
        };
        this.resume = () => {
            if (this.setinterval == null) {
                // start the clock & set the callback on it
                this.setinterval = setInterval(() => {
                    // if callback is set, run it
                    __classPrivateFieldGet(this, _runClockCallback).call(this);
                }, __classPrivateFieldGet(this, _calcTimeInterval).call(this, this.timeInterval));
            }
        };
        this.value = 0;
        this.startValue = undefined;
        this.endValue = undefined;
        this.valueInterval = 1;
        this.timeInterval = 1000;
        this.callback = null;
        this.endCallback = null;
        this.setinterval = null;
        this.settimeout = null;
        this.incrementing = true;
        this.decrementing = false;
        this.skipInitialCallback = false;
        this.incrementBeforeInitialCallback = false;
    }
}
exports.Clock = Clock;
_calcTimeInterval = new WeakMap(), _calcValueInterval = new WeakMap(), _incrementOrDecrement = new WeakMap(), _runClockCallback = new WeakMap();
exports.default = Clock;
