import Game from "../Game"
import {Letter} from "../Piece"
import {DEFAULT_SETTINGS, Settings} from "../Settings"

type Cell = "X" | "O" | "."

const letterForCell: Record<Cell, Letter> = {
  X: Letter.X,
  O: Letter.O,
  ".": Letter.Empty,
}

const cellForLetter: Record<Letter, Cell> = {
  [Letter.X]: "X",
  [Letter.O]: "O",
  [Letter.Empty]: ".",
}

export function testSettings(overrides: Partial<Settings> = {}): Settings {
  return {...DEFAULT_SETTINGS, ...overrides}
}

export function newGame(settings: Settings = testSettings()): Game {
  return new Game({settings})
}

export function setGrid(game: Game, rows: [string, string, string]): void {
  rows.forEach((row, rowIndex) => {
    row.split("").forEach((cell, colIndex) => {
      game.board.grid[rowIndex][colIndex].letter = letterForCell[cell as Cell]
    })
  })
}

export function gridRows(game: Game): string[] {
  return game.board.grid.map((row) => row.map((piece) => cellForLetter[piece.letter]).join(""))
}

interface GamePrivates {
  aiTurn(letter: Letter): void
  waitAiTurn(letter: Letter): void
  recordCompletedGame(): boolean
  startLaunchSimulation(): void
  advanceLaunchSimulation(): void
  resetSimulationState(): void
  clearLaunchInterval(): void
}

export function privates(game: Game): GamePrivates {
  return game as unknown as GamePrivates
}

export function stubRandom(...values: number[]): jest.SpyInstance<number, []> {
  const spy = jest.spyOn(Math, "random")
  values.forEach((value) => spy.mockReturnValueOnce(value))
  return spy
}

export function randomForIndex(index: number, outOf: number): number {
  return (index + 0.5) / outOf
}
