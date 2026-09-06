import {DEFAULT_SETTINGS, readSettings} from "../Settings"

describe("Settings", () => {
  it("uses the shipped timings when the page has no query string", () => {
    expect(readSettings("")).toEqual(DEFAULT_SETTINGS)
  })

  it("reads the number of games to play before giving up", () => {
    expect(readSettings("?games=3").gamesBeforeSimulation).toBe(3)
  })

  it("reads the delay between moves while the computer plays itself", () => {
    expect(readSettings("?aiSpeed=5").aiSpeed).toBe(5)
  })

  it("reads how long the computer takes to answer a person", () => {
    expect(readSettings("?aiDelay=7").aiThinkingDelay).toBe(7)
  })

  it("reads how fast the launch code is guessed", () => {
    expect(readSettings("?decodeSpeed=9").decodingSpeed).toBe(9)
  })

  it("allows a timing of no delay at all", () => {
    expect(readSettings("?aiSpeed=0").aiSpeed).toBe(0)
  })

  it("ignores a timing that is not a number", () => {
    expect(readSettings("?aiSpeed=fast").aiSpeed).toBe(DEFAULT_SETTINGS.aiSpeed)
  })

  it("ignores a timing below zero", () => {
    expect(readSettings("?games=-1").gamesBeforeSimulation)
      .toBe(DEFAULT_SETTINGS.gamesBeforeSimulation)
  })

  it("reads the query string off the page when it is not given one", () => {
    window.history.replaceState({}, "", "/?games=4")

    expect(readSettings().gamesBeforeSimulation).toBe(4)
  })
})
