import Game from "../Game"
import {Letter} from "../Piece"
import {gridRows, newGame, privates, randomForIndex, setGrid, stubRandom} from "./helpers"

describe("the computer choosing a move", () => {
  let game: Game

  beforeEach(() => {
    game = newGame()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function moveFrom(before: [string, string, string], letter: Letter = Letter.O): string[] {
    setGrid(game, before)
    privates(game).aiTurn(letter)
    return gridRows(game)
  }

  it("leaves the board alone while the launch simulation is running", () => {
    game.setState = jest.fn()
    Object.assign(game.state, {simulationActive: true})

    expect(moveFrom(["X..", "...", "..."])).toEqual(["X..", "...", "..."])
  })

  describe("taking a win it already has", () => {
    it("completes a row from the left end", () => {
      expect(moveFrom([".OO", "X.X", "..."])).toEqual(["OOO", "X.X", "..."])
    })

    it("completes a row through the middle", () => {
      expect(moveFrom(["X.X", "O.O", "..."])).toEqual(["X.X", "OOO", "..."])
    })

    it("completes a row from the right end", () => {
      expect(moveFrom(["X.X", "...", "OO."])).toEqual(["X.X", "...", "OOO"])
    })

    it("completes a column from the top", () => {
      expect(moveFrom([".X.", "O..", "O.X"])).toEqual(["OX.", "O..", "O.X"])
    })

    it("completes a column through the middle", () => {
      expect(moveFrom([".O.", "...", ".O."])).toEqual([".O.", ".O.", ".O."])
    })

    it("completes a column from the bottom", () => {
      expect(moveFrom(["..O", "X.O", "X.."])).toEqual(["..O", "X.O", "X.O"])
    })

    it("completes the top left to bottom right diagonal at its top", () => {
      expect(moveFrom(["..X", ".O.", "X.O"])).toEqual(["O.X", ".O.", "X.O"])
    })

    it("completes the top left to bottom right diagonal at its center", () => {
      expect(moveFrom(["O.X", "...", "X.O"])).toEqual(["O.X", ".O.", "X.O"])
    })

    it("completes the top left to bottom right diagonal at its bottom", () => {
      expect(moveFrom(["O.X", ".O.", "X.."])).toEqual(["O.X", ".O.", "X.O"])
    })

    it("completes the bottom left to top right diagonal at its bottom", () => {
      expect(moveFrom(["X.O", ".O.", "..X"])).toEqual(["X.O", ".O.", "O.X"])
    })

    it("completes the bottom left to top right diagonal at its center", () => {
      expect(moveFrom(["X.O", "...", "O.X"])).toEqual(["X.O", ".O.", "O.X"])
    })

    it("completes the bottom left to top right diagonal at its top", () => {
      expect(moveFrom(["X..", ".O.", "O.X"])).toEqual(["X.O", ".O.", "O.X"])
    })
  })

  describe("refusing a fork on the fourth move", () => {
    it("answers opposite corners held across the center it owns", () => {
      expect(moveFrom(["X..", ".O.", "..X"])).toEqual(["XO.", ".O.", "..X"])
    })

    it("answers the other pair of opposite corners across the center it owns", () => {
      expect(moveFrom(["..X", ".O.", "X.."])).toEqual([".OX", ".O.", "X.."])
    })

    it("answers a corner of its own with the player holding the center and far corner", () => {
      expect(moveFrom(["O..", ".X.", "..X"])).toEqual(["O.O", ".X.", "..X"])
    })

    it("answers the player holding a top corner and the square below the center", () => {
      expect(moveFrom(["..X", ".O.", ".X."])).toEqual(["..X", ".OO", ".X."])
    })

    it("answers the player holding the squares below and right of the center", () => {
      expect(moveFrom(["...", ".OX", ".X."])).toEqual(["..O", ".OX", ".X."])
    })

    it("answers the player holding the square right of the center and a far corner", () => {
      expect(moveFrom(["...", ".OX", "X.."])).toEqual(["...", ".OX", "XO."])
    })

    it("answers the player holding a near corner and the square below the center", () => {
      expect(moveFrom(["X..", ".O.", ".X."])).toEqual(["X..", "OO.", ".X."])
    })
  })

  describe("refusing a fork later in the game", () => {
    it("takes the corner that answers a fork on the fifth move", () => {
      expect(moveFrom(["XO.", ".O.", ".X."])).toEqual(["XO.", ".O.", "OX."])
    })

    it("takes the corner that answers a fork on the sixth move", () => {
      expect(moveFrom(["X..", "OOX", ".X."])).toEqual(["X..", "OOX", ".XO"])
    })
  })

  describe("blocking a row the player is about to complete", () => {
    it("blocks at the right end", () => {
      expect(moveFrom(["XX.", "...", "..."])).toEqual(["XXO", "...", "..."])
    })

    it("blocks through the middle", () => {
      expect(moveFrom(["...", "X.X", "..."])).toEqual(["...", "XOX", "..."])
    })

    it("blocks at the left end", () => {
      expect(moveFrom(["...", "...", ".XX"])).toEqual(["...", "...", "OXX"])
    })
  })

  describe("blocking a column the player is about to complete", () => {
    it("blocks at the bottom", () => {
      expect(moveFrom(["X..", "X..", "..."])).toEqual(["X..", "X..", "O.."])
    })

    it("blocks through the middle", () => {
      expect(moveFrom([".X.", "...", ".X."])).toEqual([".X.", ".O.", ".X."])
    })

    it("blocks at the top", () => {
      expect(moveFrom(["...", "..X", "..X"])).toEqual(["..O", "..X", "..X"])
    })
  })

  describe("blocking the top left to bottom right diagonal", () => {
    it("blocks at its bottom", () => {
      expect(moveFrom(["X..", ".X.", "..."])).toEqual(["X..", ".X.", "..O"])
    })

    it("blocks at its center", () => {
      expect(moveFrom(["X..", "...", "..X"])).toEqual(["X..", ".O.", "..X"])
    })

    it("blocks at its top", () => {
      expect(moveFrom(["...", ".X.", "..X"])).toEqual(["O..", ".X.", "..X"])
    })
  })

  describe("blocking the bottom left to top right diagonal", () => {
    it("blocks at its top", () => {
      expect(moveFrom(["...", ".X.", "X.."])).toEqual(["..O", ".X.", "X.."])
    })

    it("blocks at its center", () => {
      expect(moveFrom(["..X", "...", "X.."])).toEqual(["..X", ".O.", "X.."])
    })

    it("blocks at its bottom", () => {
      expect(moveFrom(["..X", ".X.", "..."])).toEqual(["..X", ".X.", "O.."])
    })
  })

  describe("opening on a board with nothing to win or block", () => {
    const squares: Array<[number, string[]]> = [
      [0, ["O..", "...", "..."]],
      [1, [".O.", "...", "..."]],
      [2, ["..O", "...", "..."]],
      [3, ["...", "O..", "..."]],
      [4, ["...", ".O.", "..."]],
      [5, ["...", "..O", "..."]],
      [6, ["...", "...", "O.."]],
      [7, ["...", "...", ".O."]],
      [8, ["...", "...", "..O"]],
    ]

    squares.forEach(([choice, expected]) => {
      it(`takes the square at random position ${choice}`, () => {
        stubRandom(randomForIndex(choice, 9))

        expect(moveFrom(["...", "...", "..."])).toEqual(expected)
      })
    })

    it("takes the first free square when the random choice is already occupied", () => {
      stubRandom(randomForIndex(0, 9))

      expect(moveFrom(["X..", "...", "..."])).toEqual(["XO.", "...", "..."])
    })
  })

  it("plays as X when the computer is given the other letter", () => {
    expect(moveFrom([".XX", "O.O", "..."], Letter.X)).toEqual(["XXX", "O.O", "..."])
  })
})
