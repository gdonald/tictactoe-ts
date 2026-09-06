import React from "react"
import {act, render, screen} from "@testing-library/react"
import Game, {Turn} from "../Game"
import {Letter} from "../Piece"
import {Settings} from "../Settings"
import {gridRows, newGame, privates, setGrid, testSettings} from "./helpers"

const PLACEHOLDER = "___-____-___"
const LAUNCH_CODE = "CPE-1704-TKS"
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function guessFor(character: string): number {
  return (CHARSET.indexOf(character) + 0.5) / CHARSET.length
}

function pickFor(position: number, remaining: number): number {
  return (position + 0.5) / remaining
}

function renderGame(overrides: Partial<Settings> = {}): Game {
  const gameRef = React.createRef<Game>()
  render(<Game ref={gameRef} settings={testSettings(overrides)} />)
  return gameRef.current as Game
}

describe("Game", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("starting up", () => {
    it("starts with an empty board", () => {
      expect(newGame().board.movesCount()).toBe(9)
    })

    it("starts in one player mode", () => {
      expect(newGame().numberPlayers).toBe("1")
    })

    it("starts with the launch code hidden behind placeholders", () => {
      expect(newGame().state.decodingProgress).toBe(PLACEHOLDER)
    })

    it("starts with an unresolved position selected", () => {
      expect(newGame().state.currentIndex).toBeGreaterThanOrEqual(0)
    })

    it("knows it is mounted once React has mounted it", () => {
      expect(renderGame().mounted).toBe(true)
    })

    it("knows it is not mounted before React has mounted it", () => {
      const game = newGame()

      game.componentWillMount()

      expect(game.mounted).toBe(false)
    })
  })

  describe("redrawing itself", () => {
    it("redraws when it is mounted", () => {
      const game = renderGame()
      const forceUpdate = jest.spyOn(game, "forceUpdate")

      act(() => {
        game.forceUpdateIfMounted()
      })

      expect(forceUpdate).toHaveBeenCalled()
    })

    it("does not redraw before it is mounted", () => {
      const game = newGame()
      const forceUpdate = jest.spyOn(game, "forceUpdate")

      game.forceUpdateIfMounted()

      expect(forceUpdate).not.toHaveBeenCalled()
    })
  })

  describe("rendering", () => {
    it("draws the board", () => {
      renderGame()

      expect(screen.getAllByRole("img")).toHaveLength(9)
    })

    it("hides the launch simulation while the game is being played", () => {
      renderGame()

      expect(document.querySelector(".launch-simulation")).toBeNull()
    })

    it("shows the launch simulation once it starts", () => {
      const game = renderGame()

      act(() => {
        game.setState({simulationActive: true})
      })

      expect(document.querySelector(".launch-simulation")).not.toBeNull()
    })
  })

  describe("choosing a letter for the other side", () => {
    it("answers O for X", () => {
      expect(newGame().otherLetter(Letter.X)).toBe(Letter.O)
    })

    it("answers X for O", () => {
      expect(newGame().otherLetter(Letter.O)).toBe(Letter.X)
    })
  })

  describe("speeding the computer up between games", () => {
    it("shortens the delay after each game", () => {
      const game = newGame()

      game.recalculateAiSpeed()

      expect(game.aiSpeed).toBe(125)
    })

    it("never drops below no delay at all", () => {
      const game = newGame()
      game.aiSpeed = 3

      game.recalculateAiSpeed()

      expect(game.aiSpeed).toBe(0)
    })
  })

  describe("knowing whether the computer plays both sides", () => {
    it("agrees when no players are selected", () => {
      const game = newGame()
      game.numberPlayers = "0"

      expect(game.numberPlayersZero()).toBe(true)
    })

    it("disagrees when a player is selected", () => {
      expect(newGame().numberPlayersZero()).toBe(false)
    })
  })

  describe("changing the number of players", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("clears the board when switching to two players", () => {
      const game = renderGame()
      setGrid(game, ["XOX", "...", "..."])

      act(() => {
        game.handleNumberPlayersClick("2")
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("gives the first turn back to the player when switching to two players", () => {
      const game = renderGame()
      game.board.turn = Turn.Ai

      act(() => {
        game.handleNumberPlayersClick("2")
      })

      expect(game.board.turn).toBe(Turn.Player)
    })

    it("stops waiting on the computer when switching to two players", () => {
      const game = renderGame()
      game.aiThinking = true

      act(() => {
        game.handleNumberPlayersClick("2")
      })

      expect(game.aiThinking).toBe(false)
    })

    it("clears the board when switching to no players", () => {
      const game = renderGame()
      setGrid(game, ["XOX", "...", "..."])

      act(() => {
        game.handleNumberPlayersClick("0")
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("resets the games played count when switching to no players", () => {
      const game = renderGame()
      act(() => {
        game.setState({gamesPlayed: 12})
      })

      act(() => {
        game.handleNumberPlayersClick("0")
      })

      expect(game.state.gamesPlayed).toBe(0)
    })

    it("keeps the games played count when no players is chosen again", () => {
      const game = renderGame()
      act(() => {
        game.handleNumberPlayersClick("0")
      })
      act(() => {
        game.setState({gamesPlayed: 12})
      })

      act(() => {
        game.handleNumberPlayersClick("0")
      })

      expect(game.state.gamesPlayed).toBe(12)
    })
  })

  describe("handling a click on a square", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("ignores clicks while the launch simulation is running", () => {
      const game = renderGame()
      act(() => {
        game.setState({simulationActive: true})
      })

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
      })

      expect(gridRows(game)).toEqual(["...", "...", "..."])
    })

    it("ignores clicks while the computer holds the turn", () => {
      const game = renderGame()
      game.board.turn = Turn.Ai

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
      })

      expect(gridRows(game)).toEqual(["...", "...", "..."])
    })

    it("ignores clicks once the game has been won", () => {
      const game = renderGame()
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        game.handlePieceClick(game.board.grid[2][2])
      })

      expect(gridRows(game)).toEqual(["XXX", "OO.", "..."])
    })

    it("ignores clicks on an occupied square", () => {
      const game = renderGame()
      setGrid(game, ["O..", "...", "..."])

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
      })

      expect(gridRows(game)).toEqual(["O..", "...", "..."])
    })

    it("places the player letter on the square that was clicked", () => {
      const game = renderGame()

      act(() => {
        game.handlePieceClick(game.board.grid[1][1])
      })

      expect(game.board.grid[1][1].letter).toBe(Letter.X)
    })

    it("stops without changing turns when the last square is taken", () => {
      const game = renderGame()
      setGrid(game, ["XOX", "XOO", "OX."])

      act(() => {
        game.handlePieceClick(game.board.grid[2][2])
      })

      expect(game.board.turn).toBe(Turn.Player)
    })

    it("stops without changing turns when the move wins the game", () => {
      const game = renderGame()
      setGrid(game, ["XX.", "OO.", "..."])

      act(() => {
        game.handlePieceClick(game.board.grid[0][2])
      })

      expect(game.board.turn).toBe(Turn.Player)
    })

    it("hands the turn to the other person in two player mode", () => {
      const game = renderGame()
      game.numberPlayers = "2"

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
      })

      expect(game.board.turn).toBe(Turn.Ai)
    })

    it("leaves the computer out of it in two player mode", () => {
      const game = renderGame()
      game.numberPlayers = "2"

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
        jest.advanceTimersByTime(1000)
      })

      expect(game.board.movesCount()).toBe(8)
    })

    it("does not answer the click when the computer plays both sides", () => {
      const game = renderGame()
      game.numberPlayers = "0"

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
      })

      expect(game.aiThinking).toBe(false)
    })

    it("waits on the computer after the player moves", () => {
      const game = renderGame()

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
      })

      expect(game.aiThinking).toBe(true)
    })

    it("lets the computer answer after its thinking delay", () => {
      const game = renderGame()

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
        jest.advanceTimersByTime(200)
      })

      expect(game.board.movesCount()).toBe(7)
    })

    it("answers on the thinking delay its settings ask for", () => {
      const game = renderGame({aiThinkingDelay: 20})

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
        jest.advanceTimersByTime(20)
      })

      expect(game.board.movesCount()).toBe(7)
    })

    it("gives the turn back to the player once the computer has answered", () => {
      const game = renderGame()

      act(() => {
        game.handlePieceClick(game.board.grid[0][0])
        jest.advanceTimersByTime(200)
      })

      expect(game.board.turn).toBe(Turn.Player)
    })
  })

  describe("waiting on the computer", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("does not move while the launch simulation is running", () => {
      const game = renderGame()
      act(() => {
        game.setState({simulationActive: true})
      })

      act(() => {
        privates(game).waitAiTurn(Letter.O)
        jest.advanceTimersByTime(200)
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("does not move once the game is over", () => {
      const game = renderGame()
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        privates(game).waitAiTurn(Letter.O)
        jest.advanceTimersByTime(200)
      })

      expect(gridRows(game)).toEqual(["XXX", "OO.", "..."])
    })

    it("abandons its move when the simulation starts during the delay", () => {
      const game = renderGame()

      act(() => {
        privates(game).waitAiTurn(Letter.O)
      })
      act(() => {
        game.setState({simulationActive: true})
      })
      act(() => {
        jest.advanceTimersByTime(200)
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("abandons its move when the game ends during the delay", () => {
      const game = renderGame()

      act(() => {
        privates(game).waitAiTurn(Letter.O)
      })
      setGrid(game, ["XXX", "OO.", "..."])
      act(() => {
        jest.advanceTimersByTime(200)
      })

      expect(gridRows(game)).toEqual(["XXX", "OO.", "..."])
    })
  })

  describe("playing itself", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("does not start while a person is playing", () => {
      const game = renderGame()

      act(() => {
        game.delayedAiTurnLoop(Letter.X)
        jest.advanceTimersByTime(1000)
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("does not start while the launch simulation is running", () => {
      const game = renderGame()
      game.numberPlayers = "0"
      act(() => {
        game.setState({simulationActive: true})
      })

      act(() => {
        game.delayedAiTurnLoop(Letter.X)
        jest.advanceTimersByTime(1000)
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("stops when a person takes over during the delay", () => {
      const game = renderGame()
      game.numberPlayers = "0"

      act(() => {
        game.delayedAiTurnLoop(Letter.X)
      })
      game.numberPlayers = "1"
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("stops when the launch simulation starts during the delay", () => {
      const game = renderGame()
      game.numberPlayers = "0"

      act(() => {
        game.delayedAiTurnLoop(Letter.X)
      })
      act(() => {
        game.setState({simulationActive: true})
      })
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(game.board.movesCount()).toBe(9)
    })

    it("fills the board by alternating letters", () => {
      const game = renderGame()
      game.numberPlayers = "0"

      act(() => {
        game.delayedAiTurnLoop(Letter.X)
        jest.advanceTimersByTime(2000)
      })
      game.numberPlayers = "1"

      expect(game.board.movesCount()).toBeLessThan(9)
    })

    it("counts a game once it is over", () => {
      const game = renderGame()
      game.numberPlayers = "0"
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        game.delayedAiTurnLoop(Letter.O)
        jest.advanceTimersByTime(260)
      })
      game.numberPlayers = "1"

      expect(game.state.gamesPlayed).toBe(1)
    })

    it("clears the board to start the next game", () => {
      const game = renderGame()
      game.numberPlayers = "0"
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        game.delayedAiTurnLoop(Letter.O)
        jest.advanceTimersByTime(260)
      })
      game.numberPlayers = "1"

      expect(game.board.movesCount()).toBe(9)
    })

    it("speeds itself up before starting the next game", () => {
      const game = renderGame()
      game.numberPlayers = "0"
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        game.delayedAiTurnLoop(Letter.O)
        jest.advanceTimersByTime(260)
      })
      game.numberPlayers = "1"

      expect(game.aiSpeed).toBe(125)
    })

    it("stops counting when a person takes over while the board is being cleared", () => {
      const game = renderGame()
      game.numberPlayers = "0"
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        game.delayedAiTurnLoop(Letter.O)
        jest.advanceTimersByTime(130)
      })
      game.numberPlayers = "1"
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(game.state.gamesPlayed).toBe(0)
    })

    it("stops playing once it has played enough games to give up", () => {
      const game = renderGame()
      game.numberPlayers = "0"
      act(() => {
        game.setState({gamesPlayed: 79})
      })
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        game.delayedAiTurnLoop(Letter.O)
        jest.advanceTimersByTime(260)
      })

      expect(game.state.simulationActive).toBe(true)
    })

    it("gives up after the number of games its settings allow", () => {
      const game = renderGame({gamesBeforeSimulation: 1, aiSpeed: 10})
      game.numberPlayers = "0"
      setGrid(game, ["XXX", "OO.", "..."])

      act(() => {
        game.delayedAiTurnLoop(Letter.O)
        jest.advanceTimersByTime(20)
      })

      expect(game.state.simulationActive).toBe(true)
    })
  })

  describe("counting completed games", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("does not count a game while the launch simulation is running", () => {
      const game = renderGame()
      act(() => {
        game.setState({simulationActive: true, gamesPlayed: 5})
      })

      let shouldContinue = true
      act(() => {
        shouldContinue = privates(game).recordCompletedGame()
      })

      expect(shouldContinue).toBe(false)
    })

    it("keeps playing while it is below the games it will tolerate", () => {
      const game = renderGame()

      let shouldContinue = false
      act(() => {
        shouldContinue = privates(game).recordCompletedGame()
      })

      expect(shouldContinue).toBe(true)
    })

    it("adds the finished game to the count", () => {
      const game = renderGame()

      act(() => {
        privates(game).recordCompletedGame()
      })

      expect(game.state.gamesPlayed).toBe(1)
    })
  })

  describe("decoding the launch code", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    interface DecodingState {
      decodingProgress: string
      displayProgress: string
      decoded: boolean
      currentIndex: number
    }

    function simulating(overrides: Partial<DecodingState> = {}): Game {
      const game = renderGame()
      act(() => {
        game.setState({
          simulationActive: true,
          decodingProgress: overrides.decodingProgress ?? PLACEHOLDER,
          displayProgress: overrides.displayProgress ?? PLACEHOLDER,
          decoded: overrides.decoded ?? false,
          currentIndex: overrides.currentIndex ?? 0,
        })
      })
      return game
    }

    it("checks the code on the timer its settings ask for", () => {
      const game = renderGame({decodingSpeed: 10})
      jest.spyOn(Math, "random").mockReturnValue(0)

      act(() => {
        privates(game).startLaunchSimulation()
      })
      const before = game.state.displayProgress
      act(() => {
        jest.advanceTimersByTime(10)
      })

      expect(game.state.displayProgress).not.toBe(before)
    })

    it("checks the code on a timer once it starts", () => {
      const game = renderGame()
      jest.spyOn(Math, "random").mockReturnValue(0)

      act(() => {
        privates(game).startLaunchSimulation()
      })
      const before = game.state.displayProgress
      act(() => {
        jest.advanceTimersByTime(150)
      })

      expect(game.state.displayProgress).not.toBe(before)
    })

    it("shows a wrong guess without accepting it", () => {
      const game = simulating()
      jest.spyOn(Math, "random").mockReturnValueOnce(guessFor("A"))

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect([game.state.displayProgress, game.state.decodingProgress])
        .toEqual(["A__-____-___", PLACEHOLDER])
    })

    it("keeps a character it guesses correctly", () => {
      const game = simulating()
      jest.spyOn(Math, "random")
        .mockReturnValueOnce(guessFor("C"))
        .mockReturnValueOnce(pickFor(0, 8))

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(game.state.decodingProgress).toBe("C__-____-___")
    })

    it("moves on to another position after a correct guess", () => {
      const game = simulating()
      jest.spyOn(Math, "random")
        .mockReturnValueOnce(guessFor("C"))
        .mockReturnValueOnce(pickFor(0, 8))

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(game.state.currentIndex).toBe(1)
    })

    it("picks a position when it does not have one", () => {
      const game = simulating({currentIndex: -1})
      jest.spyOn(Math, "random")
        .mockReturnValueOnce(pickFor(0, 9))
        .mockReturnValueOnce(guessFor("A"))

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(game.state.currentIndex).toBe(0)
    })

    it("picks another position when the one it holds is already decoded", () => {
      const game = simulating({
        decodingProgress: "C__-____-___",
        displayProgress: "C__-____-___",
        currentIndex: 0,
      })
      jest.spyOn(Math, "random")
        .mockReturnValueOnce(pickFor(0, 8))
        .mockReturnValueOnce(guessFor("A"))

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(game.state.currentIndex).toBe(1)
    })

    it("finishes when it guesses the last character", () => {
      const game = simulating({
        decodingProgress: "CPE-1704-TK_",
        displayProgress: "CPE-1704-TK_",
        currentIndex: 11,
      })
      jest.spyOn(Math, "random").mockReturnValueOnce(guessFor("S"))

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(game.state.displayProgress).toBe(LAUNCH_CODE)
    })

    it("stops checking once the code is decoded", () => {
      const game = renderGame()
      jest.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(guessFor("S"))
      act(() => {
        privates(game).startLaunchSimulation()
      })
      act(() => {
        game.setState({
          decodingProgress: "CPE-1704-TK_",
          displayProgress: "CPE-1704-TK_",
          currentIndex: 11,
        })
      })
      const clearInterval = jest.spyOn(globalThis, "clearInterval")

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(clearInterval).toHaveBeenCalled()
    })

    it("settles on the code when no positions are left to decode", () => {
      const game = simulating({
        decodingProgress: LAUNCH_CODE,
        displayProgress: PLACEHOLDER,
        currentIndex: 0,
      })

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(game.state.displayProgress).toBe(LAUNCH_CODE)
    })

    it("has no position left to pick once every character is decoded", () => {
      const pickPosition = (Game as unknown as {
        pickRandomUnresolvedIndex(progress: string): number
      }).pickRandomUnresolvedIndex

      expect(pickPosition(LAUNCH_CODE)).toBe(-1)
    })

    it("leaves the code alone once it has been decoded", () => {
      const game = simulating({
        decodingProgress: LAUNCH_CODE,
        displayProgress: LAUNCH_CODE,
        decoded: true,
        currentIndex: -1,
      })

      act(() => {
        privates(game).advanceLaunchSimulation()
      })

      expect(game.state.displayProgress).toBe(LAUNCH_CODE)
    })

    it("stops the timer when the game is taken off the screen", () => {
      const game = renderGame()
      jest.spyOn(Math, "random").mockReturnValue(0)
      act(() => {
        privates(game).startLaunchSimulation()
      })
      const clearInterval = jest.spyOn(globalThis, "clearInterval")

      act(() => {
        game.componentWillUnmount()
      })

      expect(clearInterval).toHaveBeenCalled()
    })

    it("has no timer to stop when no simulation is running", () => {
      const game = renderGame()
      const clearInterval = jest.spyOn(globalThis, "clearInterval")

      act(() => {
        game.componentWillUnmount()
      })

      expect(clearInterval).not.toHaveBeenCalled()
    })
  })
})
