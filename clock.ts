export type Value = number
export type ValueInterval = Value | ((last_value: Value, last_interval: ValueInterval) => Value)
export type Milliseconds = number
export type TimeInterval = Milliseconds | ((last_value: Milliseconds, last_interval: TimeInterval) => Milliseconds)
export type ClockTickCallback = ((value: Value) => void | boolean) | null

export class Clock {
  value: Value
  startValue: Value | undefined
  endValue: Value | undefined
  callback: ClockTickCallback
  endCallback: ClockTickCallback
  valueInterval: ValueInterval
  timeInterval: TimeInterval
  setinterval: ReturnType<typeof setInterval> | null
  settimeout: ReturnType<typeof setTimeout> | null
  incrementing: boolean
  decrementing: boolean
  skipInitialCallback: boolean
  incrementBeforeInitialCallback: boolean

  constructor() {
    this.value = 0
    this.startValue = undefined
    this.endValue = undefined
    this.valueInterval = 1
    this.timeInterval = 1000
    this.callback = null
    this.endCallback = null
    this.setinterval = null
    this.settimeout = null
    this.incrementing = true
    this.decrementing = false
    this.skipInitialCallback = false
    this.incrementBeforeInitialCallback = false
  }

  setValue = (value: Value): Value => {
    this.value = value
    return (this.value)
  }

  setInterval = (interval: ValueInterval): ValueInterval => {
    this.valueInterval = interval
    return (this.valueInterval)
  }

  increment = (interval?: ValueInterval): Value => {
    if (interval) {
      this.value = this.value + this.#calcValueInterval(interval)
      return (this.value)
    } else {
      this.value = this.value + this.#calcValueInterval(this.valueInterval)
      return (this.value)
    }
  }

  decrement = (interval?: ValueInterval): Value => {
    if (interval) {
      this.value = this.value - this.#calcValueInterval(interval)
      return (this.value)
    } else {
      this.value = this.value - this.#calcValueInterval(this.valueInterval)
      return (this.value)
    }
  }

  // these intervals are off. last_interval keeps sending as a function
  #calcTimeInterval = (interval: TimeInterval): Milliseconds => {
    if (typeof interval === 'number') {
      return interval
    } else {
      return interval(this.value, this.timeInterval)
    }
  }

  // these intervals are off. last_interval keeps sending as a function
  #calcValueInterval = (interval: ValueInterval): Value => {
    if (typeof interval === 'number') {
      return interval
    } else {
      return interval(this.value, this.valueInterval)
    }
  }

  #incrementOrDecrement = () => {
    // increment if only increment option is set to true
    // decrement if decrement or both are set to true
    // do nothing if both are false

    // this isn't intuitive until you go to use the function
    if (this.incrementing && !(this.decrementing)) {
      this.increment()
    } else if (this.decrementing) {
      this.decrement()
    }
  }

  #runClockCallback = () => {
    if (typeof this.callback === 'function') {
      // this if statement is for stopping the clock if the callback returns true
      if (this.callback(this.value)) this.stop()

      if (this.endValue) {
        if (this.decrementing) {
          if (this.value <= this.endValue) {
            this.stop()
            if (this.endCallback) this.endCallback(this.value)
          }
        } else {
          if (this.value >= this.endValue) {
            this.stop()
            if (this.endCallback) this.endCallback(this.value)
          }
        }
      }
    }
    // check if should, and if should then inc or dec
    this.#incrementOrDecrement()
  }

  // this starts a repeating clock that calls the clock's callback or an optional callback argument passed to the function. if the internal callback and the optional callback arent set, the clock still increments, but nothing happens. if both are set, only the optional argument callback is called
  start = (
    callback?: ClockTickCallback,
    timeInterval?: TimeInterval,
    options?: {
      incrementing?: boolean,
      decrementing?: boolean,
      valueInterval?: ValueInterval,
      skipInitialCallback?: boolean,
      incrementBeforeInitialCallback?: boolean,
      startValue?: Value,
      endValue?: Value,
      endCallback?: ClockTickCallback
    }
  ) => {
    if (this.setinterval == null) {
      if (callback) this.callback = callback
      if (timeInterval) this.timeInterval = timeInterval
      if (options?.incrementing) this.incrementing = options.incrementing
      if (options?.decrementing) this.decrementing = options.decrementing
      if (options?.skipInitialCallback)
        this.skipInitialCallback = options.skipInitialCallback
      if (options?.incrementBeforeInitialCallback)
        this.incrementBeforeInitialCallback = options.incrementBeforeInitialCallback
      if (options?.valueInterval) this.valueInterval = options.valueInterval
      if (options?.startValue) this.startValue = options.startValue
      if (options?.endValue) this.endValue = options.endValue
      if (options?.endCallback) this.endCallback = options.endCallback

      if (this.startValue !== undefined) {
        this.value = this.startValue
      }

      // if the optional incrementOnInitialCallback is set, do it
      if (this.incrementBeforeInitialCallback) this.#incrementOrDecrement()
      // if callback is set and it's not set to initially be skipped
      if (!(this.skipInitialCallback)) this.#runClockCallback()

      // start the clock & set the callback on it
      this.setinterval = setInterval(() => {
        // if callback is set, run it
        this.#runClockCallback()
      }, this.#calcTimeInterval(this.timeInterval))
    }
  }

  stop = () => {
    if (this.setinterval != null) {
      clearInterval(this.setinterval)
      this.setinterval = null
    }
    if (this.startValue) this.value = this.startValue
  }

  pause = () => {
    if (this.setinterval != null) {
      clearInterval(this.setinterval)
      this.setinterval = null
    }
  }

  resume = () => {
    if (this.setinterval == null) {
      // start the clock & set the callback on it
      this.setinterval = setInterval(() => {
        // if callback is set, run it
        this.#runClockCallback()
      }, this.#calcTimeInterval(this.timeInterval))
    }
  }
}


export default Clock
