import {render, screen} from "@testing-library/react"
import Board from "../Board"
import Game, {Turn} from "../Game"
import {Letter} from "../Piece"
import {newGame, setGrid} from "./helpers"

describe("Board", () => {
  let game: Game
  let board: Board

  beforeEach(() => {
    game = newGame()
    board = game.board
  })

  it("is three squares wide", () => {
    expect(Board.SIZE).toBe(3)
  })

  it("starts with the player taking the first turn", () => {
    expect(board.turn).toBe(Turn.Player)
  })

  it("gives the player X and the computer O", () => {
    expect([board.playerLetter, board.aiLetter]).toEqual([Letter.X, Letter.O])
  })

  it("builds a three by three grid of empty pieces", () => {
    const letters = board.grid.flat().map((piece) => piece.letter)

    expect(letters).toEqual(new Array(9).fill(Letter.Empty))
  })

  it("clears every square when it is initialized again", () => {
    setGrid(game, ["XOX", "OXO", "XOX"])

    board.initalize()

    expect(board.movesCount()).toBe(9)
  })

  it("renders a square for each cell in the grid", () => {
    render(<table><tbody>{board.render()}</tbody></table>)

    expect(screen.getAllByRole("img")).toHaveLength(9)
  })

  describe("taking turns", () => {
    it("hands the turn to the computer after the player", () => {
      board.changeTurn()

      expect(board.turn).toBe(Turn.Ai)
    })

    it("hands the turn back to the player after the computer", () => {
      board.turn = Turn.Ai

      board.changeTurn()

      expect(board.turn).toBe(Turn.Player)
    })

    it("reports the player letter while it is the player's turn", () => {
      expect(board.turnLetter()).toBe(Letter.X)
    })

    it("reports the computer letter while it is the computer's turn", () => {
      board.turn = Turn.Ai

      expect(board.turnLetter()).toBe(Letter.O)
    })
  })

  describe("counting remaining moves", () => {
    it("counts every square on an empty board", () => {
      expect(board.movesCount()).toBe(9)
    })

    it("counts only the empty squares once pieces are placed", () => {
      setGrid(game, ["XO.", "...", "..X"])

      expect(board.movesCount()).toBe(6)
    })
  })

  describe("judging whether a move is legal", () => {
    it("allows a move onto an empty square", () => {
      expect(board.isLegalMove(1, 1)).toBe(true)
    })

    it("refuses a move onto an occupied square", () => {
      setGrid(game, ["...", ".X.", "..."])

      expect(board.isLegalMove(1, 1)).toBe(false)
    })
  })

  describe("deciding whether the game is over", () => {
    it("is not over while the board is empty", () => {
      expect(board.isGameOver()).toBe(false)
    })

    it("is over once every square is filled", () => {
      setGrid(game, ["XOX", "XOX", "OXO"])

      expect(board.isGameOver()).toBe(true)
    })

    it("is over when a row is filled with one letter", () => {
      setGrid(game, ["XXX", "OO.", "..."])

      expect(board.isGameOver()).toBe(true)
    })

    it("is over when a column is filled with one letter", () => {
      setGrid(game, ["X.O", "X.O", "..O"])

      expect(board.isGameOver()).toBe(true)
    })

    it("is over when the top left to bottom right diagonal is filled with one letter", () => {
      setGrid(game, ["X.O", "OX.", "..X"])

      expect(board.isGameOver()).toBe(true)
    })

    it("is over when the bottom left to top right diagonal is filled with one letter", () => {
      setGrid(game, ["O.X", ".X.", "X.O"])

      expect(board.isGameOver()).toBe(true)
    })

    it("is not over when a row holds two letters and an empty square", () => {
      setGrid(game, ["XO.", "...", "..."])

      expect(board.isGameOver()).toBe(false)
    })

    it("is not over when a column holds two letters and an empty square", () => {
      setGrid(game, ["X..", "O..", "..."])

      expect(board.isGameOver()).toBe(false)
    })

    it("is not over when the diagonals hold mixed letters", () => {
      setGrid(game, ["X.O", ".O.", "X.X"])

      expect(board.isGameOver()).toBe(false)
    })
  })
})
