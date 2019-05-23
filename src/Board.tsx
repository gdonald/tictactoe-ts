import React from "react"
import Game, {Turn} from "./Game"
import Piece, {Letter} from "./Piece"
import NumberPlayers from "./NumberPlayers"

class Board extends React.Component<{}, {}> {

  public static SIZE: number = 3

  public game: Game
  public grid: Piece[][]
  public turn: Turn
  public playerLetter: Letter
  public aiLetter: Letter

  constructor(props) {
    super(props)

    this.game = props.game
    this.turn = Turn.Player
    this.playerLetter = Letter.X
    this.aiLetter = Letter.O

    this.initializeGrid()
  }

  public initalize(): void {
    this.initializeGrid()
  }

  public render() {
    return (
      <div className="outer">
        <div className="options">
          <NumberPlayers game={this.game}></NumberPlayers>
        </div>
        <div className="board">
          <table>
            <tbody>
            {this.grid.map((row, index) => {
              return (
                <tr className="row" key={`r${index}`}>
                  {row.map((piece) => {
                    return piece.render()
                  })}
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  public changeTurn(): void {
    this.turn = this.turn === Turn.Player ? Turn.Ai : Turn.Player
  }

  public turnLetter(): Letter {
    return this.turn === Turn.Player ? this.playerLetter : this.aiLetter
  }

  private initializeGrid(): void {
    this.grid = []
    for (let row = 0; row < Board.SIZE; row++) {
      this.grid[row] = []
      for (let col = 0; col < Board.SIZE; col++) {
        this.grid[row][col] = new Piece({game: this.game, row, col, letter: Letter.Empty})
      }
    }
  }

  public isGameOver(): boolean {
    if (this.movesCount() == 0) {
      return true
    }

    // rows
    for (let row = 0; row < Board.SIZE; row++) {
      if (this.grid[row][0].letter != Letter.Empty
        && this.grid[row][0].letter == this.grid[row][1].letter
        && this.grid[row][1].letter == this.grid[row][2].letter) {
        return true
      }
    }

    // cols
    for (let col = 0; col < Board.SIZE; col++) {
      if (this.grid[0][col].letter != Letter.Empty
        && this.grid[0][col].letter == this.grid[1][col].letter
        && this.grid[1][col].letter == this.grid[2][col].letter) {
        return true
      }
    }

    // diagonals
    if (this.grid[0][0].letter != Letter.Empty
      && this.grid[0][0].letter == this.grid[1][1].letter
      && this.grid[1][1].letter == this.grid[2][2].letter) {
      return true
    }

    if (this.grid[2][0].letter != Letter.Empty
      && this.grid[2][0].letter == this.grid[1][1].letter
      && this.grid[1][1].letter == this.grid[0][2].letter) {
      return true
    }

    return false
  }

  public isLegalMove(row: number, col: number): boolean {
    return this.pieceIsEmpty(row, col)
  }

  private pieceIsEmpty(row: number, col: number): boolean {
    return this.grid[row][col].letter === Letter.Empty
  }

  public movesCount(): number {
    let count: number = 0

    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        if (this.pieceIsEmpty(row, col)) {
          count++
        }
      }
    }

    return count
  }
}

export default Board
