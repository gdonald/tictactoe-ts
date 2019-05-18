import React from "react";
import Board from "./Board";
import Piece from "./Piece";

export enum Turn { Player, Ai }

class Game extends React.Component<{}, {}> {

  public board: Board;
  public mounted: boolean = false;
  public aiThinking: boolean = false;

  constructor(props) {
    super(props);

    this.board = new Board({game: this});
    this.board.initalize();
  }

  public render() {
    return <>{this.board.render()}</>;
  }

  public componentDidMount(): void {
    this.mounted = true;
    this.setState({ waitIsActive: false });
  }

  public componentWillMount(): void {
    this.mounted = false;
  }

  public forceUpdateIfMounted(): void {
    if (this.mounted) {
      this.forceUpdate();
    }
  }

  public handlePieceClick(piece: Piece): void {
    if (this.board.turn !== Turn.Player) {
      return;
    }

    if (this.board.isGameOver()) {
      return
    }

    if (!this.board.isLegalMove(piece.row, piece.col)) {
      return;
    }

    this.board.grid[piece.row][piece.col].letter = this.board.turnLetter();
    this.forceUpdateIfMounted();

    if (this.board.movesCount() == 0) {
      return;
    }

    if (this.board.isGameOver()) {
      return
    }

    this.board.changeTurn();
    this.aiThinking = true;
    this.forceUpdateIfMounted();
    this.waitAiTurn();
  }

  private waitAiTurn() {
    const that = this;
    setTimeout( () => {
      that.aiTurn();
      this.board.changeTurn();
      this.aiThinking = false;
      this.forceUpdateIfMounted();
    }, 200);
  }

  private aiTurn(): void {

    // TODO

    for (let row = 0; row < Board.SIZE; row++) {
      for (let col = 0; col < Board.SIZE; col++) {
        if(this.board.isLegalMove(row, col)) {
          this.board.grid[row][col].letter = this.board.turnLetter();
          return;
        }
      }
    }
  }
}

export default Game
