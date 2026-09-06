import React from "react"
import {render, screen} from "@testing-library/react"
import Piece, {Letter} from "../Piece"
import Game from "../Game"
import {newGame} from "./helpers"

describe("Piece", () => {
  let game: Game

  beforeEach(() => {
    game = newGame()
  })

  it("maps each letter to its image name", () => {
    expect(Piece.images).toEqual(["x", "o", "empty"])
  })

  it("keeps the row, column, and letter it was constructed with", () => {
    const piece = new Piece({game, row: 2, col: 1, letter: Letter.O})

    expect([piece.row, piece.col, piece.letter]).toEqual([2, 1, Letter.O])
  })

  it("renders the image matching its letter", () => {
    const piece = new Piece({game, row: 0, col: 0, letter: Letter.X})

    render(<table><tbody><tr>{piece.render()}</tr></tbody></table>)

    expect(screen.getByRole("img").getAttribute("src")).toBe("img/x.png")
  })

  it("tells the game it was clicked", () => {
    const piece = new Piece({game, row: 1, col: 2, letter: Letter.Empty})
    const handlePieceClick = jest.spyOn(game, "handlePieceClick").mockImplementation(() => undefined)

    piece.handleClick()

    expect(handlePieceClick).toHaveBeenCalledWith(piece)
  })
})
