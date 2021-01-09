# good-clock
An **intuitive timer / clock** for **javascript** + **typescript**

## Install

    npm i good-clock

## Quick Links

 - [How To Use](#how-to-use)
 - [Actions](#actions)
 - [Setters](#setters)
 - [Getters](#getters)
 - [Helpers](#helpers)
 - [Examples](#examples)
 - [Defaults](#defaults)

## How To Use

Setup

    import Clock from 'good-clock'       // for import method
    const Clock = require('good-clock')  // for require method

Create a clock object - *( or multiple if you want )*

    const clock = new Clock

Classic "setInterval" method

    clock.start(() => {
      console.log('tick-tock')
    }, 1000)

Dot Notation method

    clock.setCallback(() => { console.log('tick-tock') })
    clock.setTimeInterval(1000)
    clock.start()

Things get fun

    clock.start((value) => {
      console.log(value)
    }, clock.seconds(1), {
      {
        startValue: 10,
        endValue: 20,
        endCallback: () => {
          console.log("all done!")
        }
      }
    })

Everything works using both methods, this will do the same thing

    clock.setCallback((value) => { console.log(value) })
    clock.setTimeInterval(clock.seconds(1))
    clock.setStartValue(10)
    clock.setEndValue(20)
    clock.setEndCallback(() => { console.log("all done!") })
    clock.start()


## Actions

| code | description | options |
|--|--|--|
| `clock.increment()` | Increments the clock's value by one valueInterval or by the optional argument | **number:** the amount to increment the clock's value. (optional) |
| `clock.decrement()` | Decrements the clock's value by one valueInterval or by the optional argument | **number:** the amount to decrement the clock's value. (optional) |
| `clock.start()` | Starts the clock, optionally sets it up. | **function:** see clock.setCallback() below. **number:** see clock.setTimeInterval() below. **ClockOptions:** see ClockOptions below. |
| `clock.stop()` | Stops the clock and resets it to startValue | none |
| `clock.stopAfterNextCallback()` | Stops the clock after the next clock tick and resets it to startValue. | none |
| `clock.pause()` | Pauses the clock. Does NOT change the clock's value and `clock.resume()` can then be used to restart the clock as if it had never stopped. | none |
| `clock.pauseAfterNextCallback()` | Pauses the clock after the next clock tick. Does NOT change the clock's value and `clock.resume()` can then be used to restart the clock as if it had never stopped. | none |
| `clock.resume()` | Restarts the clock without changing it's value. Remember that `clock.stop()` resets the value to the clock's startValue. So if you use `clock.stop()` to stop the clock and then resume to restart the clock, the clock WILL start at the clock's startValue. Use `clock.pause()` to stop a clock without reseting it's value to it's startValue. | none |
| `clock.wait()` | Calls a function after a determined wait time. | **function:** The function to be called after the wait time. **number:** The time to wait before calling the function. |
| `clock.cancelWaitWithCallback()` | Call this when the clock is waiting from `clock.wait()` to cancel the wait and immediately call its function. | none |
| `clock.cancelWaitWithoutCallback()` | Call this when the clock is waiting from `clock.wait()` to cancel the wait and NOT call its function. | none |

**ClockOptions**: type: object ( all properties are optional )
	

    {
	    valueInterval: number,
	    incrementing: boolean,
	    decrementing: boolean,
	    startValue: number,
	    startCallback: function,
	    endValue: number,
	    endCallback: function,
	    clampEndValue: boolean,
	    skipInitialCallback: boolean,
	    incrementBeforeInitialCallback: boolean,
	    driftCorrectionOn: boolean
	}

For more details on **ClockOptions** see the corresponding setters below.
## Setters

| code | description |
|--|--|
| `clock.setCallback(function(value))` | Sets the callback of the clock. This is a function that's called on every clock tick. The function receives the clock's `value` as an argument. |
| `clock.setValue(number)` | Sets the value of the clock. This can be any number. The value will be incremented or decremented every clock tick based on the clock's valueInterval. |
| `clock.setTimeInterval(number)` | Sets the time interval of the clock in milliseconds. The clock is based on javascript's setTimeout function, so the time between clock callbacks is NOT perfectly precise. This time can vary quite a bit, sometimes 50ms or so. Each lag (or inaccurately triggered interval) adds on top of the last. So a clock with it's timeInterval set to 1000, (1 second) after 120 seconds (2 minutes) will be more like 120.5 or 121 seconds later. If you want the clock to sync with real world seconds / minutes / etc... see the `clock.setDriftCorrection()` method. |
| `clock.setValueInterval(number)` | Sets the amount to increase or decrease the clock's value on every clock tick. Whether it adds or subtracts is based on whether the clock is set to increment or decrement. |
| `clock.setIncrementing(boolean or undefined)` | If called without an argument or with `true` the clock will be set to increment. If called with `false` the clock will be set to decrement. |
| `clock.setDecrementing(boolean or undefined)` | If called without an argument or with `true` the clock will be set to decrement. If called with `false` the clock will be set to increment. |
| `clock.setStartValue(number)` | Sets the clock's start value. When calling `clock.start()` the clock will start at this value. If startValue is not set and `clock.start()` is called the clock will start with whatever clock.value is set as, and startValue will be automatically set to the clock.value. |
| `clock.setStartCallback(function)` | Sets a function that is called when `clock.start()` is called. |
| `clock.setEndValue(number)` | Set's the endValue of the clock. If the value is equal to this endValue, the clock will automatically stop. If `clock.isEndValueClamped` is `true` then the clock will also stop if it is greater than (when incrementing) or less than (when decrementing) this endValue. |
| `clock.setEndCallback(function)` | Sets a function that is called when the endValue causes the clock to stop. |
| `clock.setClampEndValue(number)` | Sets the value that the clock will automatically stop at (endValue). If `clock.isEndValueClamped` is `true` then the clock will also stop if it is greater than (when incrementing) or less than (when decrementing) the endValue. |
| `clock.setSkipInitialCallback(boolean)` | Sets whether or not the clock's first tick is when `clock.start()` is called, or one timeInterval after `clock.start()` is called. |
| `clock.setIncrementBeforeInitialCallback(boolean)` | Sets whether or not the clock's value will increment / decrement before the first clock tick. |
| `clock.setDriftCorrection(boolean)` | The clock is based on javascript's setTimeout function, so the time between clock callbacks is NOT perfectly precise. This time can vary quite a bit, sometimes 50ms or so. Each lag (or inaccurately triggered interval) adds on top of the last. So a clock with it's timeInterval set to 1000, (1 second) after 120 seconds (2 minutes) will be more like 120.5 or 121 seconds later. If you want the clock to sync with real world seconds / minutes / etc... set this to true. Note that the clock will still not fire at precisely the right time, this only ensures that the clock's error will not accumulate. If the clock's drift is greater than 50ms, driftCorrection is automatically disabled. If the clock's timeInterval is set to less than 50ms, driftCorrection is automatically disabled. |

## Getters

| code | description | type |
|--|--|--|
| `clock.value` | The value of the clock. | number |
| `clock.timeInterval` | The time interval of the clock. | number |
| `clock.valueInterval` | The value interval of the clock. The value interval is how much the value will change each clock tick. | number |
| `clock.isIncrementing` | `true` if the clock is set to increment, false if set to decrement. | boolean |
| `clock.isDecrementing` | `true` if the clock is set to decrement, `false` if set to increment. | boolean |
| `clock.startValue` | The value the clock will start at when ran with `clock.start()`. It is `undefined` until either directly set or the first time `clock.start()` is called. The first time `clock.start()` is called, it's startValue will be set to whatever the value was. (default = 1). Calling `clock.stop()` will set the clock's value back to this startValue. Calling `clock.start()` again, will start the clock at this startValue. | number |
| `clock.endValue` | The clock will automatically stop once the clock's value equals this value. | number |
| `clock.isEndValueClamped` | `true` if the clock is set to be clamped to the end value. `false` if not. (default = false) | boolean |
| `clock.isSkippingInitialCallback` | `true` if the clock is set to skip the initial callback when `clock.start()` is called. `false` if not. (default = false) | number |
| `clock.isIncrementingBeforeInitialCallback` | `true` if the clock is set to increment before the initial callback. `false` if not. | boolean |
| `clock.isDriftCorrectionOn` | `true` if drift correction is on. `false if not. (default = false) | boolean |
| `clock.isRunning` | `true` if the clock is running. `false` if not. | boolean |
| `clock.isPaused` | `true` if the clock is paused. `false` if not. | boolean |
| `clock.isStopped` | `true` if the clock is stopped. `false` if not. | boolean |
| `clock.isWaiting` | `true` if the clock's `clock.wait()` is waiting. `false` if not. | boolean |
| `clock.isAtStart` | `true` if the clock's value is equal to the clock's startValue. `false` if not. | boolean |
| `clock.isAtEnd` | `true` if the clock's value is equal to the clock's endValue. `false` if not. | boolean |
| `clock.willStopAfterNextCallback` | `true` if the clock is set to stop after the next callback after `clock.stop()` is called. `false` if not. | boolean |
| `clock.willPauseAfterNextCallback` | `true` if the clock is set to pause after the next callback after `clock.pause()` is called. `false` if not. | boolean |
| `

## Helpers

| code | description |
|--|--|
| `clock.seconds(number)` | Returns milliseconds. (input * 1000) |
| `clock.minutes(number)` | Returns milliseconds. (input * 60 * 1000) |
| `clock.hours(number)` | Returns milliseconds. (input * 60 * 60 * 1000) |

## Examples

Simple count to ten and stop, incrementing by one each second.

    clock.start((value) => {
	    console.log(value)
	}, clock.seconds(1), {
		endValue: 10,
	})

Count to ten, each one second, but pause at 5 for 3 seconds

    clock.start((value) => {
	    console.log(value)
	    if (value === 5) {
		    clock.pause()
		    clock.wait(() => {
			    clock.resume()
			}, clock.seconds(3))
		}
	}, clock.seconds(1), {
		endValue: 10,
	})

Easy decrementing

    clock.start((value) => {
	    console.log(value)
	}, clock.seconds(1), {
		decrementing: true,
		endValue: -10,
	})

Start at 15 and count to 20

    clock.start((value) => {
	    console.log(value)
	}, clock.seconds(1), {
		startValue: 15,
		endValue: 20,
	})

Pass the endValue, but since it's clamped it stops at the endValue

    clock.start((value) => {
	    console.log(value)
	}, clock.seconds(1), {
		valueInterval: 3,
		endValue: 10,
		clampEndValue: true,
	})

Change the value interval mid-flight

    clock.start((value) => {
	    clock.setValueInterval(value + 1)
	    console.log(value)
	}, clock.seconds(1), {
		endValue: 20,
	})

Change the callback function mid-flight ( after 5 second wait )

    clock.start((value) => {
		console.log(value)
	}, clock.seconds(1), {
		endValue: 10,
	})
	
	clock.wait(() => {
		clock.setCallback((value) => {
			console.log("value: " + value)
		})
	}, clock.seconds(5))

## Defaults

    callback = null
    value = 0
    timeInterval = 1000
    valueInterval = 1
    incrementing = true
    decrementing = false
    startValue = undefined
    startCallback = null
    endValue = undefined
    endCallback = null
    clampEndValue = false
    skipInitialCallback = false
    incrementBeforeInitialCallback = false
    isRunning = false
    isPaused = false
    isStopped = true
    waitCallback = null
    isWaiting = false
    willStopAfterNextCallback = false
    willPauseAfterNextCallback = false
