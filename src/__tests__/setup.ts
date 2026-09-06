// Every test runs against the same sequence of "random" numbers, so a branch is
// either covered on purpose or not covered at all. Tests that need a specific
// choice still spy on Math.random themselves.
const FIRST_SEED = 1
const MULTIPLIER = 1103515245
const INCREMENT = 12345
const MODULUS = 2147483648

beforeEach(() => {
  let seed = FIRST_SEED

  jest.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * MULTIPLIER + INCREMENT) % MODULUS
    return seed / MODULUS
  })
})
