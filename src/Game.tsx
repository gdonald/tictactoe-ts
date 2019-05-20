import React from "react"
import Board from "./Board"
import Piece, {Letter} from "./Piece"

export enum Turn { Player, Ai }

class Game extends React.Component<{}, {}> {

  public board: Board
  public mounted: boolean = false
  public aiThinking: boolean = false

  constructor(props) {
    super(props)

    this.board = new Board({game: this})
    this.board.initalize()
  }

  public render() {
    return <>{this.board.render()}</>
  }

  public componentDidMount(): void {
    this.mounted = true
    this.setState({waitIsActive: false})
  }

  public componentWillMount(): void {
    this.mounted = false
  }

  public forceUpdateIfMounted(): void {
    if (this.mounted) {
      this.forceUpdate()
    }
  }

  public handlePieceClick(piece: Piece): void {
    if (this.board.turn !== Turn.Player) {
      return
    }

    if (this.board.isGameOver()) {
      return
    }

    if (!this.board.isLegalMove(piece.row, piece.col)) {
      return
    }

    this.board.grid[piece.row][piece.col].letter = this.board.turnLetter()
    this.forceUpdateIfMounted()

    if (this.board.movesCount() == 0) {
      return
    }

    if (this.board.isGameOver()) {
      return
    }

    this.board.changeTurn()
    this.aiThinking = true
    this.forceUpdateIfMounted()
    this.waitAiTurn()
  }

  private waitAiTurn() {
    const that = this
    setTimeout(() => {
      that.aiTurn()
      this.board.changeTurn()
      this.aiThinking = false
      this.forceUpdateIfMounted()
    }, 200)
  }

  private aiTurn(): void {

    const playerLetter = this.board.playerLetter
    const aiLetter = this.board.aiLetter
    const grid = this.board.grid

    // take the win

    // rows
    for (let row = 0; row < Board.SIZE; row++) {
      if (grid[row][0].letter == Letter.Empty
        && grid[row][1].letter == aiLetter
        && grid[row][2].letter == aiLetter) {
        grid[row][0].letter = aiLetter
        return
      }

      if (grid[row][1].letter == Letter.Empty
        && grid[row][0].letter == aiLetter
        && grid[row][2].letter == aiLetter) {
        grid[row][1].letter = aiLetter
        return
      }

      if (grid[row][2].letter == Letter.Empty
        && grid[row][0].letter == aiLetter
        && grid[row][1].letter == aiLetter) {
        grid[row][2].letter = aiLetter
        return
      }
    }

    // cols
    for (let col = 0; col < Board.SIZE; col++) {
      if (grid[0][col].letter == Letter.Empty
        && grid[1][col].letter == aiLetter
        && grid[2][col].letter == aiLetter) {
        grid[0][col].letter = aiLetter
        return
      }

      if (grid[1][col].letter == Letter.Empty
        && grid[0][col].letter == aiLetter
        && grid[2][col].letter == aiLetter) {
        grid[1][col].letter = aiLetter
        return
      }

      if (grid[2][col].letter == Letter.Empty
        && grid[0][col].letter == aiLetter
        && grid[1][col].letter == aiLetter) {
        grid[2][col].letter = aiLetter
        return
      }
    }

    // diagonals
    if (grid[0][0].letter == Letter.Empty
      && grid[1][1].letter == aiLetter
      && grid[2][2].letter == aiLetter) {
      grid[0][0].letter = aiLetter
      return
    }

    if (grid[1][1].letter == Letter.Empty
      && grid[0][0].letter == aiLetter
      && grid[2][2].letter == aiLetter) {
      grid[1][1].letter = aiLetter
      return
    }

    if (grid[2][2].letter == Letter.Empty
      && grid[0][0].letter == aiLetter
      && grid[1][1].letter == aiLetter) {
      grid[2][2].letter = aiLetter
      return
    }

    if (grid[2][0].letter == Letter.Empty
      && grid[1][1].letter == aiLetter
      && grid[0][2].letter == aiLetter) {
      grid[2][0].letter = aiLetter
      return
    }

    if (grid[1][1].letter == Letter.Empty
      && grid[2][0].letter == aiLetter
      && grid[0][2].letter == aiLetter) {
      grid[1][1].letter = aiLetter
      return
    }

    if (grid[0][2].letter == Letter.Empty
      && grid[2][0].letter == aiLetter
      && grid[1][1].letter == aiLetter) {
      grid[0][2].letter = aiLetter
      return
    }

    // end take the win

    // take center
    if (this.board.movesCount() == 8 && grid[1][1].letter == Letter.Empty) {
      grid[1][1].letter = aiLetter
      return
    }

    // prevent triangle traps
    if (this.board.movesCount() == 6) {

      if (grid[0][0].letter == playerLetter
        && grid[1][1].letter == aiLetter
        && grid[2][2].letter == playerLetter) {
        grid[0][1].letter = aiLetter
        return
      }

      if (grid[0][2].letter == playerLetter
        && grid[1][1].letter == aiLetter
        && grid[2][0].letter == playerLetter) {
        grid[0][1].letter = aiLetter
        return
      }

      if (grid[0][0].letter == aiLetter
        && grid[1][1].letter == playerLetter
        && grid[2][2].letter == playerLetter) {
        grid[0][2].letter = aiLetter
        return
      }

      if (grid[1][1].letter == aiLetter
        && grid[2][1].letter == playerLetter
        && grid[0][2].letter == playerLetter) {
        grid[1][2].letter = aiLetter
        return
      }

      if (grid[1][1].letter == aiLetter
        && grid[2][1].letter == playerLetter
        && grid[1][2].letter == playerLetter) {
        grid[0][2].letter = aiLetter
        return
      }
    }

    // rows
    for (let row = 0; row < Board.SIZE; row++) {

      if (grid[row][0].letter == playerLetter
        && grid[row][1].letter == playerLetter
        && grid[row][2].letter == Letter.Empty) {
        grid[row][2].letter = aiLetter
        return
      }

      if (grid[row][0].letter == playerLetter
        && grid[row][2].letter == playerLetter
        && grid[row][1].letter == Letter.Empty) {
        grid[row][1].letter = aiLetter
        return
      }

      if (grid[row][1].letter == playerLetter
        && grid[row][2].letter == playerLetter
        && grid[row][0].letter == Letter.Empty) {
        grid[row][0].letter = aiLetter
        return
      }
    }

    // cols
    for (let col = 0; col < Board.SIZE; col++) {

      if (grid[0][col].letter == playerLetter
        && grid[1][col].letter == playerLetter
        && grid[2][col].letter == Letter.Empty) {
        grid[2][col].letter = aiLetter
        return
      }

      if (grid[0][col].letter == playerLetter
        && grid[2][col].letter == playerLetter
        && grid[1][col].letter == Letter.Empty) {
        grid[1][col].letter = aiLetter
        return
      }

      if (grid[1][col].letter == playerLetter
        && grid[2][col].letter == playerLetter
        && grid[0][col].letter == Letter.Empty) {
        grid[0][col].letter = aiLetter
        return
      }
    }

    // diagonals

    // top left - bottom right
    if (grid[0][0].letter == playerLetter
      && grid[1][1].letter == playerLetter
      && grid[2][2].letter == Letter.Empty) {
      grid[2][2].letter = aiLetter
      return
    }

    if (grid[0][0].letter == playerLetter
      && grid[2][2].letter == playerLetter
      && grid[1][1].letter == Letter.Empty) {
      grid[1][1].letter = aiLetter
      return
    }

    if (grid[2][2].letter == playerLetter
      && grid[1][1].letter == playerLetter
      && grid[0][0].letter == Letter.Empty) {
      grid[0][0].letter = aiLetter
      return
    }

    // bottom left - top right
    if (grid[2][0].letter == playerLetter
      && grid[1][1].letter == playerLetter
      && grid[0][2].letter == Letter.Empty) {
      grid[0][2].letter = aiLetter
      return
    }

    if (grid[2][0].letter == playerLetter
      && grid[0][2].letter == playerLetter
      && grid[1][1].letter == Letter.Empty) {
      grid[1][1].letter = aiLetter
      return
    }

    if (grid[0][2].letter == playerLetter
      && grid[1][1].letter == playerLetter
      && grid[2][0].letter == Letter.Empty) {
      grid[2][0].letter = aiLetter
      return
    }

    // end diagonals

    // first available
    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        if (this.board.isLegalMove(row, col)) {
          grid[row][col].letter = aiLetter
          return
        }
      }
    }
  }
}

export default Game
