import Clock from './clock'

const clock = new Clock;

console.log("test begins")

clock.setValue(-5)

clock.start((value) => {
  console.log(value)
  console.log(new Date())
}, 100, {
  endValue: 20,
  endCallback: () => {
    console.log('test ends')
  },
  valueInterval: (last_value, last_interval) => {
    console.log(last_interval)
    return (1)
  }
})
