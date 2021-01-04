import Clock from '..'

test('Set Value to 500 and Get it', async () => {
  const clock = new Clock
  clock.setValue(500)

  expect(clock.value).toBe(500);
})

test('3 seconds after the default clock starts, value should be 3', async () => {
  const clock = new Clock
  clock.start()

  setTimeout(() => {
    expect(clock.value).toBe(3)
  }, 3200)
})

test('trigger twice then change the callback and trigger two more times', async () => {
  const clock = new Clock

  clock.start((value) => {
    if (value === 2) {
      expect(value).toBe(2)
    }
  }, clock.seconds(1), {
    endValue: 5
  })

  clock.wait(() => {
    clock.setCallback((value) => {
      if (value === 4) {
        expect(value).toBe(4)
      }
    })
  }, clock.seconds(2))
})

test('value should start at 15 and go to 17', async () => {
  const clock = new Clock

  clock.start((value) => {
  }, clock.seconds(0.5), {
    startValue: 15,
    endValue: 17,
  })

  setTimeout(() => {
    expect(clock.value).toBe(15)
  }, 500)
})

test('change the value interval, and pass the end value, but it still stops', async () => {
  const clock = new Clock

  clock.start((value) => {
  }, clock.seconds(0.5), {
    decrementing: true,
    valueInterval: 3,
    endValue: -10,
  })

  setTimeout(() => {
    expect(clock.value).toBe(-12)
  }, 5000)
})

test('change the value interval, and pass the end value, but it still stops, and clamp at the set endvalue', async () => {
  const clock = new Clock

  clock.start((value) => {
  }, clock.seconds(0.5), {
    decrementing: true,
    valueInterval: 3,
    endValue: -10,
    clampEndValue: true,
  })

  setTimeout(() => {
    expect(clock.value).toBe(-10)
  }, 5000)
})


