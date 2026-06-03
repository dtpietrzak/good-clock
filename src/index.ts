export type Value = number;
export type Milliseconds = number;
export type ClockTickCallback = ((value: Value) => void | boolean) | null;

/**
 * Options object used by `Clock.start()` to configure behavior.
 */
export type ClockOptions = {
  /** Amount to change the clock's `value` on each tick. `@default 1` */
  valueInterval?: Value;
  /** Amount of time between each tick in milliseconds. `@default 1000` */
  timeInterval?: Milliseconds;
  /** If true, clock will increment on each tick. `@default true` */
  incrementing?: boolean;
  /** If true, clock will decrement on each tick. `@default false` */
  decrementing?: boolean;
  /** Callback to run on each tick. */
  callBack?: ClockTickCallback;
  /** Value to set when the clock starts. `@default 0` */
  startValue?: Value;
  /** Callback to run when the clock starts. */
  startCallback?: ClockTickCallback;
  /** Value at which the clock should stop. `@default undefined` */
  endValue?: Value;
  /** Callback to run when the clock reaches `endValue`. */
  endCallback?: ClockTickCallback;
  /** Whether to clamp the clock value to `endValue` to prevent overshoot. `@default true` */
  clampEndValue?: boolean;
  /** Whether to skip the initial tick callback when starting. `@default false` */
  skipInitialCallback?: boolean;
  /** If true, apply increment/decrement before calling callbacks. `@default false` */
  incrementBeforeCallbacks?: boolean;
  /** If true, apply increment/decrement before the initial callback. `@default false` */
  incrementBeforeInitialCallback?: boolean;
  /** Enable drift-correction for timer scheduling (ignored for very small intervals). `@default false` */
  driftCorrectionOn?: boolean;
};

export class Clock {
  private _setinterval: ReturnType<typeof setInterval> | null;
  private _settimeout: ReturnType<typeof setTimeout> | null;
  private _callback: ClockTickCallback;
  private _value: Value;
  private _lastTickEpoch: number;
  private _timeInterval: Milliseconds;
  private _valueInterval: Value;
  private _incrementing: boolean;
  private _decrementing: boolean;
  private _startValue: Value | undefined;
  private _startCallback: ClockTickCallback;
  private _endValue: Value | undefined;
  private _endCallback: ClockTickCallback;
  private _clampEndValue: boolean;
  private _skipInitialCallback: boolean;
  private _incrementBeforeCallbacks: boolean;
  private _incrementBeforeInitialCallback: boolean;
  private _isRunning: boolean;
  private _isPaused: boolean;
  private _isStopped: boolean;
  private _waitCallback: ClockTickCallback;
  private _isWaiting: boolean;
  private _willStopAfterNextCallback: boolean;
  private _willPauseAfterNextCallback: boolean;

  // drift correction stuff
  private _epochStarted: number;
  private _expected: number;
  private _drifted: number;
  private _hadDriftError: boolean;
  private _driftCorrectionOn: boolean;

  constructor(options?: ClockOptions) {
    this._setinterval = null;
    this._settimeout = null;
    this._callback = options?.callBack ?? null;
    this._value = 0;
    this._lastTickEpoch = 0;
    this._timeInterval = options?.timeInterval ?? 1000;
    this._valueInterval = options?.valueInterval ?? 1;
    this._incrementing = options?.incrementing ?? true;
    this._decrementing = options?.decrementing ?? false;
    this._startValue = options?.startValue ?? 0;
    this._startCallback = options?.startCallback ?? null;
    this._endValue = options?.endValue ?? undefined;
    this._endCallback = options?.endCallback ?? null;
    this._clampEndValue = true;
    this._skipInitialCallback = false;
    this._incrementBeforeCallbacks = false;
    this._incrementBeforeInitialCallback = false;
    this._isRunning = false;
    this._isPaused = false;
    this._isStopped = true;
    this._waitCallback = null;
    this._isWaiting = false;
    this._willStopAfterNextCallback = false;
    this._willPauseAfterNextCallback = false;

    // drift correction stuff
    this._epochStarted = 0;
    this._expected = 0;
    this._drifted = 0;
    this._hadDriftError = false;
    this._driftCorrectionOn = false;
  }

  // private stuff  -  private stuff  -  private stuff
  // private stuff  -  private stuff  -  private stuff
  // private stuff  -  private stuff  -  private stuff

  private _incrementOrDecrement = () => {
    // increment if only increment option is set to true
    // decrement if decrement or both are set to true
    // do nothing if both are false

    // this isn't intuitive until you go to use the function
    if (this._incrementing && !this._decrementing) {
      this.increment();
    } else if (this._decrementing) {
      this.decrement();
    }
  };

  private _runClockCallback = () => {
    // record the time this tick ran
    this._lastTickEpoch = Date.now();

    if (typeof this._callback === "function") {
      if (this._incrementBeforeCallbacks === true) {
        // check if should, and if should then inc or dec
        this._incrementOrDecrement();
      }

      if (this._endValue !== undefined) {
        if (this._decrementing) {
          if (this._value <= this._endValue) {
            this.stop();
            if (this._clampEndValue) this._value = this._endValue;
            if (this._endCallback) this._endCallback(this._value);
          }
        } else {
          if (this._value >= this._endValue) {
            this.stop();
            if (this._clampEndValue) this._value = this._endValue;
            if (this._endCallback) this._endCallback(this._value);
          }
        }
      }

      // stop if set it to end after next callback
      if (this._willStopAfterNextCallback) {
        this.stop();
        this._willStopAfterNextCallback = false;
      }

      // pause if set it to end after next callback
      if (this._willPauseAfterNextCallback) {
        this.pause();
        this._willPauseAfterNextCallback = false;
      }

      // this if statement is for stopping the clock if the callback returns true
      if (this._callback(this._value)) this.stop();
    }

    if (this._incrementBeforeCallbacks === false) {
      // check if should, and if should then inc or dec
      this._incrementOrDecrement();
    }
  };

  // these intervals are off. last_interval keeps sending as a function
  private _calcTimeInterval = (interval: Milliseconds): Milliseconds => {
    if (typeof interval === "number") {
      return interval;
    } else {
      return this._calcTimeInterval(this._timeInterval);
    }
  };

  // these intervals are off. last_interval keeps sending as a function
  private _calcValueInterval = (interval: Milliseconds): Value | Value => {
    if (typeof interval === "number") {
      return interval;
    } else {
      return this._calcValueInterval(this._valueInterval);
    }
  };

  private _runClock = () => {
    this._isRunning = true;
    this._isPaused = false;
    this._isStopped = false;

    this._setinterval = setTimeout(
      () => {
        this._runClock();
        // if callback is set, run it
        this._runClockCallback();
      },
      this._calcTimeInterval(this._timeInterval) - this._driftCorrection(),
    );
  };

  // drift correction
  private _driftCorrection = () => {
    if (!this._hadDriftError && this._driftCorrectionOn) {
      // this is how we ignore drift correction
      if (this._expected !== 0) {
        // handles all ticks after the first
        // we know what the drift is for the last tick
        // so we'll simply subtract the last drift value
        this._drifted = Date.now() - this._epochStarted - this._expected;
        this._expected = this._expected + this._timeInterval;

        // if the drift messed up
        // we'll set all future ticks to ignore drift correction
        if (
          this._drifted < 0 ||
          this._drifted > this._timeInterval ||
          this._drifted > 50
        ) {
          this._hadDriftError = true;
          return 0;
        }
        return this._drifted;
      } else {
        // handles the first tick
        // we dont know what the drift is yet,
        this._epochStarted = Date.now();
        this._expected = this._timeInterval;
        return 0;
      }
    }
    return 0;
  };

  // public getters  -  public getters  -  public getters
  // public getters  -  public getters  -  public getters
  // public getters  -  public getters  -  public getters

  /**
   * Gets the current value of the clock.
   */
  get value(): Value {
    return this._value;
  }
  /**
   * Gets the current time interval of the clock.
   */
  get timeInterval(): Milliseconds {
    return this._timeInterval;
  }
  /**
   * Gets the current value interval of the clock.
   */
  get valueInterval(): Value {
    return this._valueInterval;
  }
  /**
   * Gets whether the clock is incrementing.
   *
   * incrementing = true
   *
   * decrementing = false
   */
  get isIncrementing(): boolean {
    if (this._decrementing) {
      return false;
    } else if (this._incrementing) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Gets whether the clock is decrementing.
   *
   * decrementing = true
   *
   * incrementing = false
   */
  get isDecrementing(): boolean {
    return this._decrementing;
  }
  /**
   * Gets the value the clock started at.
   */
  get startValue(): Value | undefined {
    return this._startValue;
  }
  /**
   * Gets the value the clock will end at.
   */
  get endValue(): Value | undefined {
    return this._endValue;
  }
  /**
   * Whether the clock's value is clamped to the configured `endValue`.
   *
   * When `true`, if the clock reaches or would step past the `endValue`,
   * the value will be set exactly to `endValue` to prevent overshoot.
   * This is useful when the `valueInterval` can cause the clock to skip
   * over the end point on a single increment/decrement.
   */
  get isEndValueClamped(): boolean {
    return this._clampEndValue;
  }
  /**
   * Gets whether the clock is skipping the initial callback.
   */
  get isSkippingInitialCallback(): boolean {
    return this._skipInitialCallback;
  }
  /**
   * Gets whether the clock is incrementing before callbacks.
   */
  get isIncrementingBeforeCallbacks(): boolean {
    return this._incrementBeforeCallbacks;
  }
  /**
   * Gets whether the clock is incrementing before the initial callback.
   */
  get isIncrementingBeforeInitialCallback(): boolean {
    return this._incrementBeforeInitialCallback;
  }
  /**
   * Gets whether drift correction is on.
   */
  get isDriftCorrectionOn(): boolean {
    return this._driftCorrectionOn;
  }
  /**
   * Gets whether the clock is running.
   */
  get isRunning(): boolean {
    return this._isRunning;
  }
  /**
   * Gets whether the clock is paused.
   */
  get isPaused(): boolean {
    return this._isPaused;
  }
  /**
   * Gets whether the clock is stopped.
   */
  get isStopped(): boolean {
    return this._isStopped;
  }
  /**
   * Gets whether the clock is waiting.
   */
  get isWaiting(): boolean {
    return this._isWaiting;
  }
  /**
   * Gets whether the clock is at the start value.
   */
  get isAtStart(): boolean {
    return this._value === this._startValue;
  }
  /**
   * Gets whether the clock is at the end value.
   */
  get isAtEnd(): boolean {
    return this._value === this._endValue;
  }
  /**
   * Gets whether the clock will stop after the next callback.
   */
  get willStopAfterNextCallback(): boolean {
    return this._willStopAfterNextCallback;
  }
  /**
   * Gets whether the clock will pause after the next callback.
   */
  get willPauseAfterNextCallback(): boolean {
    return this._willPauseAfterNextCallback;
  }

  get lastTickEpoch(): number {
    return this._lastTickEpoch;
  }

  // public setters  -  public setters  -  public setters
  // public setters  -  public setters  -  public setters
  // public setters  -  public setters  -  public setters

  // callback
  /**
   * Sets the callback function for the clock.
   * @param callback The callback function to be called on each tick.
   */
  public setCallback = (callback: ClockTickCallback) => {
    if (typeof callback !== "function") {
      console.warn("Clock Error: Clock.setCallback() input must be a function");
    } else {
      this._callback = callback;
    }
  };

  // value
  /**
   * Sets the value of the clock.
   * @param value The new value for the clock.
   */
  public setValue = (value: Value) => {
    if (typeof value !== "number") {
      console.warn("Clock Error: Clock.setValue() input must be a number");
    } else {
      this._value = value;
    }
  };

  // time interval
  /**
   * Sets the time interval for the clock.
   * @param newValue The new time interval in milliseconds.
   */
  public setTimeInterval = (newValue: Milliseconds) => {
    if (typeof newValue !== "number") {
      console.warn(
        "Clock Error: Clock.setTimeInterval() input must be a number",
      );
    } else {
      this._timeInterval = newValue;
      if (newValue < 99) this._driftCorrectionOn = false;
    }
  };

  // value interval
  /**
   * Sets the value interval for the clock.
   * @param newValue The new value interval.
   */
  public setValueInterval = (newValue: Value) => {
    if (typeof newValue !== "number") {
      console.warn(
        "Clock Error: Clock.setValueInterval() input must be a number",
      );
    } else {
      this._valueInterval = newValue;
    }
  };

  // set it to incrementing state,
  // if an option isnt passed, it sets it to increment
  /**
   * Sets whether the clock is in the incrementing state.
   * @param incrementing If true, sets the clock to incrementing; if false, sets it to decrementing. If undefined, defaults to incrementing.
   */
  public setIncrementing = (incrementing?: boolean) => {
    if (incrementing === undefined) {
      this._incrementing = true;
      this._decrementing = false;
    } else {
      if (typeof incrementing === "boolean") {
        this._incrementing = incrementing;
        this._decrementing = !incrementing;
      } else {
        console.warn(
          "Clock Error: Clock.setIncrementing() input must be a boolean or undefined",
        );
      }
    }
  };

  // set it to decrementing state,
  // if an option isn't passed, it sets it to decrement
  /**
   * Sets whether the clock is in the decrementing state.
   * @param decrementing If true, sets the clock to decrementing; if false, sets it to incrementing. If undefined, defaults to decrementing.
   */
  public setDecrementing = (decrementing?: boolean) => {
    if (decrementing === undefined) {
      this._incrementing = false;
      this._decrementing = true;
    } else {
      if (typeof decrementing === "boolean") {
        this._incrementing = !decrementing;
        this._decrementing = decrementing;
      } else {
        console.warn(
          "Clock Error: Clock.setDecrementing() input must be a boolean or undefined",
        );
      }
    }
  };

  // start value
  /**
   * Sets the start value for the clock.
   * @param startValue The new start value for the clock.
   */
  public setStartValue = (startValue: Value) => {
    if (typeof startValue !== "number") {
      console.warn("Clock Error: Clock.setStartValue() input must be a number");
    } else {
      this._startValue = startValue;
    }
  };

  /**
   * Sets the start callback for the clock.
   * @param startCallback The callback function to be called when the clock starts.
   */
  public setStartCallback = (startCallback: ClockTickCallback) => {
    if (typeof startCallback !== "function") {
      console.warn(
        "Clock Error: Clock.setStartCallback() input must be a function",
      );
    } else {
      this._startCallback = startCallback;
    }
  };

  // end value
  /**
   * Sets the end value for the clock.
   * @param endValue The new end value for the clock.
   */
  public setEndValue = (endValue: Value) => {
    if (typeof endValue !== "number") {
      console.warn("Clock Error: Clock.setEndValue() input must be a number");
    } else {
      this._endValue = endValue;
    }
  };

  /**
   * Sets the end callback for the clock.
   * @param endCallback The callback function to be called when the clock ends.
   */
  public setEndCallback = (endCallback: ClockTickCallback) => {
    if (typeof endCallback !== "function") {
      console.warn(
        "Clock Error: Clock.setEndCallback() input must be a function",
      );
    } else {
      this._endCallback = endCallback;
    }
  };

  /**
   * Sets whether the end value of the clock should be clamped to `endValue`.
   *
   * When `true`, if a tick would move the clock past the configured
   * `endValue`, the clock's value will be set exactly to `endValue` to
   * prevent overshooting. This is helpful when `valueInterval` may cause
   * the value to skip over the end in a single increment/decrement.
   * @param isClamped If true, clamp to `endValue` on reaching it; otherwise allow overshoot.
   */
  public setClampEndValue = (isClamped: boolean) => {
    if (typeof isClamped !== "boolean") {
      console.warn(
        "Clock Error: Clock.setClampEndValue() input must be a boolean",
      );
    } else {
      this._clampEndValue = isClamped;
    }
  };

  /**
   * Sets whether the initial callback should be skipped.
   * @param skipInitialCallback If true, the initial callback is skipped; otherwise, it is not skipped.
   */
  public setSkipInitialCallback = (skipInitialCallback: boolean) => {
    if (typeof skipInitialCallback !== "boolean") {
      console.warn(
        "Clock Error: Clock.setSkipInitialCallback() input must be a boolean",
      );
    } else {
      this._skipInitialCallback = skipInitialCallback;
    }
  };

  /**
   * Sets whether the increment should occur before callbacks.
   * @param incrementBeforeCallbacks If true, the increment occurs before callbacks; otherwise, it occurs after callbacks.
   */
  public setIncrementBeforeCallbacks = (incrementBeforeCallbacks: boolean) => {
    if (typeof incrementBeforeCallbacks !== "boolean") {
      console.warn(
        "Clock Error: Clock.setIncrementBeforeCallbacks() input must be a boolean",
      );
    } else {
      this._incrementBeforeCallbacks = incrementBeforeCallbacks;
    }
  };

  /**
   * Sets whether the increment should occur before the initial callback.
   * @param incrementBeforeInitialCallback If true, the increment occurs before the initial callback; otherwise, it occurs after the initial callback.
   */
  public setIncrementBeforeInitialCallback = (
    incrementBeforeInitialCallback: boolean,
  ) => {
    if (typeof incrementBeforeInitialCallback !== "boolean") {
      console.warn(
        "Clock Error: Clock.setIncrementBeforeInitialCallback() input must be a boolean",
      );
    } else {
      this._incrementBeforeInitialCallback = incrementBeforeInitialCallback;
    }
  };

  /**
   * Sets whether drift correction is enabled for the clock.
   * @param driftCorrection If true, drift correction is enabled; otherwise, it is disabled.
   */
  public setDriftCorrection = (driftCorrection: boolean) => {
    if (typeof driftCorrection !== "boolean") {
      console.warn(
        "Clock Error: Clock.setDriftCorrection() input must be a boolean",
      );
    } else {
      this._driftCorrectionOn = driftCorrection;
    }
  };

  // public actions  -  public actions  -  public actions
  // public actions  -  public actions  -  public actions
  // public actions  -  public actions  -  public actions

  // increment
  public increment = (interval?: Value): Value | boolean => {
    if (interval) {
      if (typeof interval !== "number") {
        console.warn("Clock Error: Clock.increment() input must be a number");
        return false;
      }
      this._value = this._value + this._calcValueInterval(interval);
      return this._value;
    } else {
      this._value = this._value + this._calcValueInterval(this._valueInterval);
      return this._value;
    }
  };

  // decrement
  public decrement = (interval?: Value): Value | boolean => {
    if (interval) {
      if (typeof interval !== "number") {
        console.warn("Clock Error: Clock.decrement() input must be a number");
        return false;
      }
      this._value = this._value - this._calcValueInterval(interval);
      return this._value;
    } else {
      this._value = this._value - this._calcValueInterval(this._valueInterval);
      return this._value;
    }
  };

  // this starts a repeating clock that calls the clock's callback or an optional callback argument passed to the function. if the internal callback and the optional callback arent set, the clock still increments, but nothing happens. if both are set, only the optional argument callback is called
  public start = (
    callback?: ClockTickCallback,
    timeInterval?: Milliseconds,
    options?: {
      valueInterval?: Value;
      incrementing?: boolean;
      decrementing?: boolean;
      startValue?: Value;
      startCallback?: ClockTickCallback;
      endValue?: Value;
      endCallback?: ClockTickCallback;
      clampEndValue?: boolean;
      skipInitialCallback?: boolean;
      incrementBeforeCallbacks?: boolean;
      incrementBeforeInitialCallback?: boolean;
      driftCorrectionOn?: boolean;
    },
  ) => {
    if (this._setinterval == null) {
      if (callback) this._callback = callback;
      if (timeInterval) this._timeInterval = timeInterval;
      if (options?.incrementing) this._incrementing = options.incrementing;
      if (options?.decrementing) this._decrementing = options.decrementing;
      if (options?.skipInitialCallback)
        this._skipInitialCallback = options.skipInitialCallback;
      if (options?.incrementBeforeCallbacks)
        this._incrementBeforeCallbacks = options.incrementBeforeCallbacks;
      if (options?.incrementBeforeInitialCallback)
        this._incrementBeforeInitialCallback =
          options.incrementBeforeInitialCallback;
      if (options?.valueInterval) this._valueInterval = options.valueInterval;
      if (options?.startValue) this._startValue = options.startValue;
      if (options?.startCallback) this._startCallback = options.startCallback;
      if (options?.endValue) this._endValue = options.endValue;
      if (options?.clampEndValue) this._clampEndValue = options.clampEndValue;
      if (options?.endCallback) this._endCallback = options.endCallback;
      if (options?.driftCorrectionOn)
        this._driftCorrectionOn = options.driftCorrectionOn;

      if (this._timeInterval < 99) this._driftCorrectionOn = false;

      if (this._startValue !== undefined) {
        this._value = this._startValue;
      } else {
        this._startValue = this._value;
      }

      // if the optional incrementOnInitialCallback is set, do it
      if (this._incrementBeforeInitialCallback) this._incrementOrDecrement();

      // if start callback is set, run it
      if (this._startCallback) this._startCallback(this._value);

      // if callback is set and it's not set to initially be skipped
      if (!this._skipInitialCallback) this._runClockCallback();

      // reset expected epoch and drift
      this._drifted = 0;
      this._expected = 0;

      // start the clock
      this._runClock();
    }
  };

  // stop, just like a CD player. it stops playback and restarts the clock
  public stop = () => {
    this._isRunning = false;
    this._isPaused = false;
    this._isStopped = true;

    if (this._setinterval != null) {
      clearInterval(this._setinterval);
      this._setinterval = null;
    }
    if (this._startValue) this._value = this._startValue;
  };
  public stopAfterNextCallback = () => {
    this._willStopAfterNextCallback = true;
  };

  // pause, just like a CD player. it stops playback, but doesn't restart the clock
  /**
   * Pauses the clock if it is currently running.
   *
   * (stop resets value to 0, pause does not)
   */
  public pause = () => {
    this._isRunning = false;
    this._isPaused = true;
    this._isStopped = false;

    if (this._setinterval != null) {
      clearInterval(this._setinterval);
      this._setinterval = null;
    }
  };
  public pauseAfterNextCallback = () => {
    this._willPauseAfterNextCallback = true;
  };

  // resume, just like a CD player. resumes playback after it was paused
  /**
   * Resumes the clock if it was paused.
   *
   * (does not reset value to 0)
   */
  public resume = () => {
    if (this._setinterval == null) {
      // reset expected epoch and drift
      this._drifted = 0;
      this._expected = 0;
      this._runClock();
    }
  };

  // wait functions
  public wait = (callback: ClockTickCallback, waitTime: number) => {
    this._isWaiting = true;

    this._waitCallback = callback;

    this._settimeout = setTimeout(() => {
      this._isWaiting = false;

      if (callback) {
        this._waitCallback = null;
        callback(this._value);
      }
    }, waitTime);
  };

  // cancel wait with callback
  public cancelWaitWithCallback = () => {
    if (this._settimeout != null) {
      clearTimeout(this._settimeout);
      this._settimeout = null;
    }
    if (this._waitCallback) {
      this._waitCallback(this._value);
    }
    this._waitCallback = null;
  };

  // cancel wait with callback
  public cancelWaitWithoutCallback = () => {
    if (this._settimeout != null) {
      clearTimeout(this._settimeout);
      this._settimeout = null;
      this._waitCallback = null;
    }
  };

  // public converters  -  public converters  -  public converters
  // public converters  -  public converters  -  public converters
  // public converters  -  public converters  -  public converters

  // easy time conversions
  public seconds = (seconds: number): number => seconds * 1000;
  public minutes = (minutes: number): number => minutes * 60 * 1000;
  public hours = (hours: number): number => hours * 60 * 60 * 1000;
}

module.exports = Clock;
export default Clock;
