import React from "react"
import Game from "./Game"

interface IProps { game: Game }
interface IState { selectedOption: string }

class NumberPlayers extends React.Component<IProps, IState> {

  public game: Game

  constructor(props) {
    super(props)

    this.state = { selectedOption: "1" }
    this.game = props.game

    this.handleChange = this.handleChange.bind(this)
  }

  public render() {
    return (
      <>
        <p>Number of Players: &nbsp;
        <input type="radio"
               name="numberPlayers"
               value="0"
               checked={this.state.selectedOption === "0"}
               onChange={this.handleChange}
        /> 0 &nbsp;
        <input type="radio"
               name="numberPlayers"
               value="1"
               checked={this.state.selectedOption === "1"}
               onChange={this.handleChange}
        /> 1 &nbsp;
        <input type="radio"
               name="numberPlayers"
               value="2"
               checked={this.state.selectedOption === "2"}
               onChange={this.handleChange}
        /> 2 &nbsp;
        </p>
      </>
    )
  }

  handleChange = (changEvent) => {
    this.setState({
      selectedOption: changEvent.target.value
    })

    this.game.handleNumberPlayersClick(changEvent.target.value)
  }
}

export default NumberPlayers
