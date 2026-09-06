describe("TicTacToe", () => {
  const actEnvironment = globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}

  beforeEach(() => {
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = false
  })

  afterEach(() => {
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    document.body.innerHTML = ""
    jest.resetModules()
  })

  function loadEntryPoint(): void {
    jest.isolateModules(() => {
      const {act} = require("react") as {act: (callback: () => void) => void}
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = true
      act(() => {
        require("../TicTacToe")
      })
    })
  }

  it("draws the board into the root element", () => {
    document.body.innerHTML = "<div id=\"root\"></div>"

    loadEntryPoint()

    expect(document.querySelectorAll("img")).toHaveLength(9)
  })

  it("draws nothing when the page has no root element", () => {
    loadEntryPoint()

    expect(document.body.innerHTML).toBe("")
  })
})
