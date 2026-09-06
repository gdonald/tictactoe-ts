import {fireEvent, render, screen} from "@testing-library/react"
import NumberPlayers from "../NumberPlayers"
import Game from "../Game"
import {newGame} from "./helpers"

describe("NumberPlayers", () => {
  let game: Game
  let handleNumberPlayersClick: jest.SpyInstance<void, [string]>

  beforeEach(() => {
    game = newGame()
    handleNumberPlayersClick = jest
      .spyOn(game, "handleNumberPlayersClick")
      .mockImplementation(() => undefined)
    render(<NumberPlayers game={game} />)
  })

  function radioFor(numberPlayers: string): HTMLInputElement {
    const radios = screen.getAllByRole("radio") as HTMLInputElement[]
    return radios.filter((radio) => radio.value === numberPlayers)[0]
  }

  it("offers a choice of zero, one, or two players", () => {
    expect(screen.getAllByRole("radio").map((radio) => (radio as HTMLInputElement).value))
      .toEqual(["0", "1", "2"])
  })

  it("starts with one player selected", () => {
    expect(radioFor("1").checked).toBe(true)
  })

  it("selects the choice the player picks", () => {
    fireEvent.click(radioFor("2"))

    expect(radioFor("2").checked).toBe(true)
  })

  it("tells the game when the player picks a different choice", () => {
    fireEvent.click(radioFor("0"))

    expect(handleNumberPlayersClick).toHaveBeenCalledWith("0")
  })

  it("restarts the game when the player picks the choice already selected", () => {
    fireEvent.click(radioFor("1"))

    expect(handleNumberPlayersClick).toHaveBeenCalledWith("1")
  })
})
