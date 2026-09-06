import * as React from "react"
import { createRoot } from "react-dom/client"
import Game from "./Game"
import { readSettings } from "./Settings"

const TicTacToe: React.FunctionComponent<{}> = () => {
  return <Game key="g" settings={readSettings()}></Game>
}

const container = document.getElementById("root")

if (container) {
  createRoot(container).render(<TicTacToe/>)
}
