# good-clock
An **intuitive timer / clock** for **javascript** + **typescript**

## Install

    npm i good-clock

## Quick Links

 - [How To Use](#how-to-use)
 - [Getters](#getters)
 - [Setters](#setters)
 - [Actions](#actions)

## How To Use

Setup

    import Clock from 'good-clock'
               - or -
    const Clock = require('good-clock')

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

coming soon...

## Setters

| code | description |
|--|--|
| `clock.setCallback(function)` | Sets the callback of the clock. This is a function that's called on every clock tick. Returns with whether or not it was set. |
| `clock.setValue(number)` | Sets the value of the clock. This can be any number. The value will be incremented or decremented every clock tick based on the clock's valueInterval. |
| `clock.setTimeInterval(number)` | Sets the time interval of the clock in milliseconds. The clock is based on javascript's setTimeout function, so the time between clock callbacks is NOT perfectly precise. This time can vary quite a bit, sometimes 50ms or so. Each lag (or inaccurately triggered interval) adds on top of the last. So a clock with it's timeInterval set to 1000, (1 second) after 120 seconds (2 minutes) will be more like 120.5 or 121 seconds later. If you want the clock to sync with real world seconds / minutes / etc... see the `clock.setDriftCorrection()` method. |
| `clock.setValueInterval(number)` | Sets the amount to increase or decrease the clock's value on every clock tick. Whether it adds or subtracts is based on whether the clock is set to increment or decrement. |
| `clock.setIncrementing(boolean or undefined)` | If called without an argument or with `true` the clock will be set to increment. If called with `false` the clock will be set to decrement. |
| `clock.setDecrementing(boolean or undefined)` | If called without an argument or with `true` the clock will be set to decrement. If called with `false` the clock will be set to increment. |
| `clock.setStartValue(number)` | Sets the clock's start value. When calling `clock.start()` the clock will start at this value. If startValue is not set and `clock.start()` is called the clock will start with whatever clock.value is set as, and startValue will be automatically set to the clock.value. |
| more coming soon... | check the source code and examples for more info |

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
