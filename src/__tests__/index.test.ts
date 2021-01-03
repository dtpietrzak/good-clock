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