export type Value = number
export type Milliseconds = number
export type ClockTickCallback = ((value: Value) => void | boolean) | null

export type SetterOrUpdaterValue = (valOrUpdater: ((currVal: Value) => Value) | Value) => void
export type SetterOrUpdaterMilliseconds = (valOrUpdater: ((currVal: Milliseconds) => Milliseconds) | Milliseconds) => void


export class Clock {
  private _value: Value
  private _startValue: Value | undefined
  private _endValue: Value | undefined
  private _clampEndValue: boolean
  private _valueInterval: Value
  private _timeInterval: Milliseconds
  private _callback: ClockTickCallback
  private _startCallback: ClockTickCallback
  private _endCallback: ClockTickCallback
  private _waitCallback: ClockTickCallback
  private _setinterval: ReturnType<typeof setInterval> | null
  private _settimeout: ReturnType<typeof setTimeout> | null
  private _incrementing: boolean
  private _decrementing: boolean
  private _skipInitialCallback: boolean
  private _incrementBeforeInitialCallback: boolean
  private _isRunning: boolean
  private _isPaused: boolean
  private _isStopped: boolean
  private _isWaiting: boolean

  constructor() {
    this._value = 0
    this._startValue = undefined
    this._endValue = undefined
    this._clampEndValue = false
    this._valueInterval = 1
    this._timeInterval = 1000
    this._callback = null
    this._startCallback = null
    this._endCallback = null
    this._waitCallback = null
    this._setinterval = null
    this._settimeout = null
    this._incrementing = true
    this._decrementing = false
    this._skipInitialCallback = false
    this._incrementBeforeInitialCallback = false
    this._isRunning = false
    this._isPaused = false
    this._isStopped = true
    this._isWaiting = false
  }

  // value
  public setValue = (value: Value): boolean => {
    if (typeof value !== 'number') {
      console.log("Clock Error: Clock.setValue() input must be a number")
      return (false)
    }
    this._value = value
    return (true)
  }
  get value(): Value { return (this._value) }

  // start value
  public setStartValue = (startValue: Value): boolean => {
    if (typeof startValue !== 'number') {
      console.log("Clock Error: Clock.setStartValue() input must be a number")
      return (false)
    } else {
      this._startValue = startValue
      return (true)
    }
  }
  get startValue(): Value | undefined { return (this._startValue) }

  // end value
  public setEndValue = (endValue: Value): boolean => {
    if (typeof endValue !== 'number') {
      console.log("Clock Error: Clock.setEndValue() input must be a number")
      return (false)
    } else {
      this._endValue = endValue
      return (true)
    }
  }
  get endValue(): Value | undefined { return (this._endValue) }

  get isRunning(): boolean { return (this._isRunning) }
  get isPaused(): boolean { return (this._isPaused) }
  get isStopped(): boolean { return (this._isStopped) }
  get isWaiting(): boolean { return (this._isWaiting) }
  get isAtStart(): boolean { return (this._value === this._startValue) }
  get isAtEnd(): boolean { return (this._value === this._endValue) }








  // value interval
  public setValueInterval = (newValue: Value) => {
    this._valueInterval = newValue
  }
  get valueInterval(): Value { return (this._valueInterval) }

  // time interval
  public setTimeInterval = (newValue: Milliseconds) => {
    this._timeInterval = newValue
  }
  get timeInterval(): Milliseconds { return (this._timeInterval) }









  // increment
  public increment = (interval?: Value): Value | boolean => {
    if (interval) {
      if ((typeof interval !== 'number') && (typeof interval !== 'function')) {
        console.log("Clock Error: Clock.increment() input must be a number or a setter function")
        return (false)
      }
      this._value = this._value + this._calcValueInterval(interval)
      return (this._value)
    } else {
      this._value = this._value + this._calcValueInterval(this._valueInterval)
      return (this._value)
    }
  }
  public setIncrementing = (incrementing?: boolean): boolean => {
    if (incrementing === undefined) {
      this._incrementing = !this._incrementing
      return (true)
    } else {
      if (typeof incrementing === 'boolean') {
        this._incrementing = incrementing
        return (true)
      } else {
        console.log("Clock Error: Clock.setIncrementing() input must be a boolean")
        return (false)
      }
    }
  }
  get isIncrementing(): boolean {
    if (this._decrementing) {
      return (false)
    } else if (this._incrementing) {
      return (true)
    } else {
      return (false)
    }
  }

  // decrement
  public decrement = (interval?: Value): Value | boolean => {
    if (interval) {
      if ((typeof interval !== 'number') && (typeof interval !== 'function')) {
        console.log("Clock Error: Clock.decrement() input must be a number or a setter function")
        return (false)
      }
      this._value = this._value - this._calcValueInterval(interval)
      return (this._value)
    } else {
      this._value = this._value - this._calcValueInterval(this._valueInterval)
      return (this._value)
    }
  }
  public setDecrementing = (decrementing?: boolean): boolean => {
    if (decrementing === undefined) {
      this._decrementing = !this._decrementing
      return (true)
    } else {
      if (typeof decrementing === 'boolean') {
        this._decrementing = decrementing
        return (true)
      } else {
        console.log("Clock Error: Clock.setDecrementing() input must be a boolean")
        return (false)
      }
    }
  }
  get isDecrementing(): boolean { return (this._decrementing) }

  // callbacks
  public setCallback = (callback: ClockTickCallback): boolean => {
    if (typeof callback !== 'function') {
      console.log("Clock Error: Clock.setCallback() input must be a function")
      return (false)
    } else {
      this._callback = callback
      return (true)
    }
  }
  public setStartCallback = (startCallback: ClockTickCallback): boolean => {
    if (typeof startCallback !== 'function') {
      console.log("Clock Error: Clock.setStartCallback() input must be a function")
      return (false)
    } else {
      this._startCallback = startCallback
      return (true)
    }
  }
  public setEndCallback = (endCallback: ClockTickCallback): boolean => {
    if (typeof endCallback !== 'function') {
      console.log("Clock Error: Clock.setEndCallback() input must be a function")
      return (false)
    } else {
      this._endCallback = endCallback
      return (true)
    }
  }





  // these intervals are off. last_interval keeps sending as a function
  private _calcTimeInterval = (interval: Milliseconds): Milliseconds => {
    if (typeof interval === 'number') {
      return interval
    } else {
      return this._calcTimeInterval(this._timeInterval)
    }
  }

  // these intervals are off. last_interval keeps sending as a function
  private _calcValueInterval = (interval: Milliseconds): Value | Value => {
    if (typeof interval === 'number') {
      return interval
    } else {
      return this._calcValueInterval(this._valueInterval)
    }
  }







  private _incrementOrDecrement = () => {
    // increment if only increment option is set to true
    // decrement if decrement or both are set to true
    // do nothing if both are false

    // this isn't intuitive until you go to use the function
    if (this._incrementing && !(this._decrementing)) {
      this.increment()
    } else if (this._decrementing) {
      this.decrement()
    }
  }

  private _runClockCallback = () => {
    if (typeof this._callback === 'function') {

      if (this._endValue) {
        if (this._decrementing) {
          if (this._value <= this._endValue) {
            this.stop()
            if (this._clampEndValue) this._value = this._endValue
            if (this._endCallback) this._endCallback(this._value)
          }
        } else {
          if (this._value >= this._endValue) {
            this.stop()
            if (this._clampEndValue) this._value = this._endValue
            if (this._endCallback) this._endCallback(this._value)
          }
        }
      }

      // this if statement is for stopping the clock if the callback returns true
      if (this._callback(this._value)) this.stop()
    }
    // check if should, and if should then inc or dec
    this._incrementOrDecrement()
  }

  // this starts a repeating clock that calls the clock's callback or an optional callback argument passed to the function. if the internal callback and the optional callback arent set, the clock still increments, but nothing happens. if both are set, only the optional argument callback is called
  public start = (
    callback?: ClockTickCallback,
    timeInterval?: Milliseconds,
    options?: {
      incrementing?: boolean,
      decrementing?: boolean,
      valueInterval?: Value,
      skipInitialCallback?: boolean,
      incrementBeforeInitialCallback?: boolean,
      startValue?: Value,
      startCallback?: ClockTickCallback,
      endValue?: Value,
      clampEndValue?: boolean,
      endCallback?: ClockTickCallback,
    }
  ) => {
    if (this._setinterval == null) {
      if (callback) this._callback = callback
      if (timeInterval) this._timeInterval = timeInterval
      if (options?.incrementing) this._incrementing = options.incrementing
      if (options?.decrementing) this._decrementing = options.decrementing
      if (options?.skipInitialCallback)
        this._skipInitialCallback = options.skipInitialCallback
      if (options?.incrementBeforeInitialCallback)
        this._incrementBeforeInitialCallback = options.incrementBeforeInitialCallback
      if (options?.valueInterval) this._valueInterval = options.valueInterval
      if (options?.startValue) this._startValue = options.startValue
      if (options?.startCallback) this._startCallback = options.startCallback
      if (options?.endValue) this._endValue = options.endValue
      if (options?.clampEndValue) this._clampEndValue = options.clampEndValue
      if (options?.endCallback) this._endCallback = options.endCallback

      if (this._startValue !== undefined) {
        this._value = this._startValue
      }

      // if the optional incrementOnInitialCallback is set, do it
      if (this._incrementBeforeInitialCallback) this._incrementOrDecrement()

      // if start callback is set, run it
      if (this._startCallback) this._startCallback(this._value)

      // if callback is set and it's not set to initially be skipped
      if (!(this._skipInitialCallback)) this._runClockCallback()

      // start the clock
      this._runClock()
    }
  }

  private _runClock = () => {
    this._isRunning = true
    this._isPaused = false
    this._isStopped = false

    this._setinterval = setTimeout(() => {
      this._runClock()
      // if callback is set, run it
      this._runClockCallback()
    }, this._calcTimeInterval(this._timeInterval))
  }

  public stop = () => {
    this._isRunning = false
    this._isPaused = false
    this._isStopped = true

    if (this._setinterval != null) {
      clearInterval(this._setinterval)
      this._setinterval = null
    }
    if (this._startValue) this._value = this._startValue
  }

  public pause = () => {
    this._isRunning = false
    this._isPaused = true
    this._isStopped = false

    if (this._setinterval != null) {
      clearInterval(this._setinterval)
      this._setinterval = null
    }
  }

  public resume = () => {
    if (this._setinterval == null) {
      this._runClock()
    }
  }

  // needs to test this special wait stuff !!!
  public wait = (callback: ClockTickCallback, waitTime: number) => {
    this._isWaiting = true

    this._waitCallback = callback

    this._settimeout = setTimeout(() => {
      this._isWaiting = false
      
      if (callback) {
        this._waitCallback = null
        callback(this._value)
      }
    }, waitTime)
  }

  public cancelWaitWithCallback = () => {
    if (this._settimeout != null) {
      clearTimeout(this._settimeout)
      this._settimeout = null
    }
    if (this._waitCallback) {
      this._waitCallback(this._value)
    }
    this._waitCallback = null
  }

  public cancelWaitWithoutCallback = () => {
    if (this._settimeout != null) {
      clearTimeout(this._settimeout)
      this._settimeout = null
      this._waitCallback = null
    }
  }


  public seconds = (seconds: number): number => (seconds * 1000)
  public minutes = (minutes: number): number => (minutes * 60 * 1000)
  public hours = (hours: number): number => (hours * 60 * 60 * 1000)
}

export default Clock