import Clock from './lib/index'

// need a clock that runs a callback every 5 seconds for one minute, and another callback at the end of the minute?
const clock = new Clock

// // dot notation method
// 
// clock.setEndValue(60)
// clock.setValueInterval(15)
// clock.setTimeInterval(clock.seconds(15))
// clock.setCallback((value) => {
//   console.log('every 15 seconds: '+value)
// })
// clock.setEndCallback((value) => {
//   console.log('end of minute: '+ value)
// })
// clock.start()


// // function method
// 
// clock.start((value) => {
//   console.log('every 15 seconds: '+value)
// }, clock.seconds(15), {
//   endValue: 60,
//   valueInterval: 15,
//   endCallback: (value) => {
//     console.log('end of minute: '+value)
//   }
// })


// // simple count to ten, one each second
// 
// clock.start((value) => {
//   console.log(value)
// }, clock.seconds(1), {
//   endValue: 10
// })


// // simple normal js setInterval
// 
// clock.start(() => {
//   console.log('one second')
// }, 1000)


// // count to ten, each one second, but pause at 5 for 3 seconds
// 
// clock.start((value) => {
//   console.log(value)
//   if (value === 5) {
//     clock.pause()

//     clock.wait(() => {
//       clock.resume()
//     }, clock.seconds(3))
//   }
// }, clock.seconds(1), {
//   endValue: 10
// })


// // everyone loves poop jokes
// clock.start((value) => {
//   console.log("poop # times: "+value)

//   if (value === 4) {
//     console.log("am I done pooping?")
//     clock.pause()

//     clock.wait(() => {
//       console.log("nope, hold on, there's more")
//       clock.resume()
//     }, clock.seconds(5))
//   }
  
// }, clock.seconds(1), {
//   endValue: 10,
//   endCallback: () => {
//     console.log("all done.\nthat's a lot of poop!\n")
//   }
// })


// // easy decrementing
// clock.start((value) => {
//   console.log(value)
// }, clock.seconds(0.5), {
//   decrementing: true,
//   endValue: -10
// })


// // change the value interval, and pass the end value, but it still stops
// clock.start((value) => {
//   console.log(value)
// }, clock.seconds(0.5), {
//   decrementing: true,
//   valueInterval: 3,
//   endValue: -10
// })


// // want a different start value?
// clock.start((value) => {
//   console.log(value)
// }, clock.seconds(0.5), {
//   startValue: 15,
//   endValue: 20,
// })


// // non-linear time intervals // NOT WORKING!
// clock.start((value) => {
//   console.log("value: "+value)
//   console.log("time interval: "+clock.timeInterval)
// }, (time_interval) => {

//   return (clock.seconds(1))
// }, {
//   endValue: 10
// })