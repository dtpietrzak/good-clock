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

## Getters

coming soon...

## Setters

coming soon...

## Actions

coming soon...

