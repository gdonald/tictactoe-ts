import React from "react"
import Game from "./Game"

export enum Letter { X, O, Empty }

class Piece extends React.Component {

  public static images: string[] = [
    "x", "o", "empty",
  ];

  public game: Game;
  public letter: Letter = Letter.Empty;
  public col: number;
  public row: number;

  constructor(props) {
    super(props);

    this.game = props.game;
    this.col = props.col;
    this.row = props.row;
    this.letter = props.letter;

    this.handleClick = this.handleClick.bind(this);
  }

  public render() {
    return (
      <td className="piece" key={`c${this.col}r${this.row}`} onClick={this.handleClick}>
        <div key={`piece${this.col}${this.row}`}>
          <img src={`img/${Piece.images[this.letter]}.png`} />
        </div>
      </td>
    );
  }

  public handleClick(): void {
    this.game.handlePieceClick(this);
  }
}

export default Piece;
