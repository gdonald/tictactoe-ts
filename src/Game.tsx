import React from "react"
import Board from "./Board"
import LaunchSimulation from "./LaunchSimulation"
import Piece, {Letter} from "./Piece"

export enum Turn { Player, Ai }

interface GameProps {}

interface GameState {
  waitIsActive: boolean
  gamesPlayed: number
  simulationActive: boolean
  decodingProgress: string
  displayProgress: string
  decoded: boolean
  currentIndex: number
}

class Game extends React.Component<GameProps, GameState> {

  private static readonly LAUNCH_CODE = "CPE-1704-TKS"
  private static readonly SIMULATION_THRESHOLD = 80
  private static readonly LAUNCH_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  public board: Board
  public mounted: boolean = false
  public aiThinking: boolean = false
  public numberPlayers: string = "1"
  public aiSpeed: number = 130
  private launchInterval: ReturnType<typeof setInterval> | null = null

  constructor(props: GameProps) {
    super(props)

    this.board = new Board({game: this})
    this.board.initalize()

    const initialProgress = Game.createPlaceholder(Game.LAUNCH_CODE)
    const firstIndex = Game.pickRandomUnresolvedIndex(initialProgress)
    this.state = {
      waitIsActive: false,
      gamesPlayed: 0,
      simulationActive: false,
      decodingProgress: initialProgress,
      displayProgress: initialProgress,
      decoded: false,
      currentIndex: firstIndex,
    }
  }

  public render(): React.ReactNode {
    return (
      <>
        {this.board.render()}
        {this.renderLaunchSimulation()}
      </>
    )
  }

  private renderLaunchSimulation(): React.ReactNode {
    if (!this.state.simulationActive) {
      return null
    }

    return (
      <LaunchSimulation
        progress={this.state.displayProgress}
        decoded={this.state.decoded}
      />
    )
  }

  public componentDidMount(): void {
    this.mounted = true
    this.setState({waitIsActive: false})
  }

  public componentWillMount(): void {
    this.mounted = false
  }

  public componentWillUnmount(): void {
    this.clearLaunchInterval()
  }

  public forceUpdateIfMounted(): void {
    if (this.mounted) {
      this.forceUpdate()
    }
  }

  public numberPlayersZero(): boolean {
    return this.numberPlayers === "0"
  }

  public recalculateAiSpeed(): void {
    this.aiSpeed = this.aiSpeed - 5

    if (this.aiSpeed < 0) {
      this.aiSpeed = 0
    }
  }

  public delayedAiTurnLoop(letter: Letter): void {
    if (!this.numberPlayersZero() || this.state.simulationActive) {
      return
    }

    setTimeout(() => {
      if (this.state.simulationActive || !this.numberPlayersZero()) {
        return
      }

      this.waitAiTurn(letter)
      this.forceUpdateIfMounted()

      if (this.board.isGameOver()) {
        setTimeout(() => {
          if (this.state.simulationActive || !this.numberPlayersZero()) {
            return
          }

          const shouldContinue = this.recordCompletedGame()
          if (!shouldContinue) {
            return
          }

          this.recalculateAiSpeed()
          this.board.initalize()
          this.forceUpdateIfMounted()
          this.delayedAiTurnLoop(letter)
        }, this.aiSpeed)
        return
      }

      const nextLetter = this.otherLetter(letter)
      this.delayedAiTurnLoop(nextLetter)
    }, this.aiSpeed)
  }

  public handleNumberPlayersClick(numberPlayers: string): void {
    const previousMode = this.numberPlayers
    this.numberPlayers = numberPlayers

    if (numberPlayers === "0") {
      if (previousMode !== "0") {
        this.resetSimulationState()
      }

      this.board.initalize()
      this.board.turn = Turn.Player
      this.aiThinking = false
      this.forceUpdateIfMounted()
      this.delayedAiTurnLoop(this.board.playerLetter)
      return
    }

    this.resetSimulationState()
    this.board.initalize()
    this.board.turn = Turn.Player
    this.aiThinking = false
    this.forceUpdateIfMounted()
  }

  public handlePieceClick(piece: Piece): void {
    if (this.state.simulationActive) {
      return
    }

    const isTwoPlayer = this.numberPlayers === "2"

    if (!isTwoPlayer && this.board.turn !== Turn.Player) {
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
    if (isTwoPlayer) {
      this.forceUpdateIfMounted()
      return
    }

    if (this.numberPlayers !== "1") {
      this.forceUpdateIfMounted()
      return
    }

    this.aiThinking = true
    this.forceUpdateIfMounted()
    this.waitAiTurn(this.board.aiLetter)
  }

  private waitAiTurn(letter: Letter): void {
    if (this.state.simulationActive || this.board.isGameOver()) {
      return
    }

    setTimeout(() => {
      if (this.state.simulationActive || this.board.isGameOver()) {
        return
      }

      this.aiTurn(letter)
      this.board.changeTurn()
      this.aiThinking = false
      this.forceUpdateIfMounted()
    }, 200)
  }

  private aiTurn(letter: Letter): void {
    if (this.state.simulationActive) {
      return
    }

    const aiLetter = letter
    const playerLetter = this.otherLetter(letter)

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

      if (grid[1][1].letter == aiLetter
        && grid[1][2].letter == playerLetter
        && grid[2][0].letter == playerLetter) {
        grid[2][1].letter = aiLetter
        return
      }

      if (grid[1][1].letter == aiLetter
        && grid[2][1].letter == playerLetter
        && grid[0][0].letter == playerLetter) {
        grid[1][0].letter = aiLetter
        return
      }
    }

    if (this.board.movesCount() == 5) {

      if (grid[0][0].letter == playerLetter
        && grid[2][1].letter == playerLetter
        && grid[0][1].letter == aiLetter
        && grid[1][1].letter == aiLetter) {
        grid[2][0].letter = aiLetter
        return
      }
    }

    if (this.board.movesCount() == 4) {

      if (grid[1][1].letter == aiLetter
        && grid[1][0].letter == aiLetter
        && grid[0][0].letter == playerLetter
        && grid[2][1].letter == playerLetter
        && grid[1][2].letter == playerLetter) {
        grid[2][2].letter = aiLetter
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

    if ([8, 9].includes(this.board.movesCount())) {
      const r = Math.floor(Math.random() * Math.floor(9))

      if (r == 0 && grid[0][0].letter == Letter.Empty) {
        grid[0][0].letter = aiLetter
        return
      } else if (r == 1 && grid[0][1].letter == Letter.Empty) {
        grid[0][1].letter = aiLetter
        return
      } else if (r == 2 && grid[0][2].letter == Letter.Empty) {
        grid[0][2].letter = aiLetter
        return
      } else if (r == 3 && grid[1][0].letter == Letter.Empty) {
        grid[1][0].letter = aiLetter
        return
      } else if (r == 4 && grid[1][1].letter == Letter.Empty) {
        grid[1][1].letter = aiLetter
        return
      } else if (r == 5 && grid[1][2].letter == Letter.Empty) {
        grid[1][2].letter = aiLetter
        return
      } else if (r == 6 && grid[2][0].letter == Letter.Empty) {
        grid[2][0].letter = aiLetter
        return
      } else if (r == 7 && grid[2][1].letter == Letter.Empty) {
        grid[2][1].letter = aiLetter
        return
      } else if (r == 8 && grid[2][2].letter == Letter.Empty) {
        grid[2][2].letter = aiLetter
        return
      }
    }

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

  private recordCompletedGame(): boolean {
    if (this.state.simulationActive) {
      return false
    }

    const nextGamesPlayed = this.state.gamesPlayed + 1
    const shouldStartSimulation = nextGamesPlayed >= Game.SIMULATION_THRESHOLD

    this.setState({gamesPlayed: nextGamesPlayed}, () => {
      if (shouldStartSimulation) {
        this.startLaunchSimulation()
      }
    })

    return !shouldStartSimulation
  }

  private startLaunchSimulation(): void {
    this.clearLaunchInterval()
    this.aiThinking = false

    const placeholder = Game.createPlaceholder(Game.LAUNCH_CODE)
    const firstIndex = Game.pickRandomUnresolvedIndex(placeholder)

    this.setState({
      simulationActive: true,
      decodingProgress: placeholder,
      displayProgress: placeholder,
      decoded: false,
      currentIndex: firstIndex,
    })

    this.launchInterval = setInterval(() => {
      this.advanceLaunchSimulation()
    }, 150)
  }

  private advanceLaunchSimulation(): void {
    this.setState((prevState) => {
      if (prevState.decoded) {
        return null
      }

      const target = Game.LAUNCH_CODE
      const progressChars = prevState.decodingProgress.split("")
      const displayChars = prevState.displayProgress.split("")

      let currentIndex: number = prevState.currentIndex
      let updatedProgress = prevState.decodingProgress
      let updatedDisplay = prevState.displayProgress
      let decoded: boolean = prevState.decoded

      const unresolved = Game.unresolvedIndices(prevState.decodingProgress)

      if (unresolved.length === 0) {
        decoded = true
        updatedProgress = target
        updatedDisplay = target
        currentIndex = -1
      } else {
        if (currentIndex === -1 || progressChars[currentIndex] === target[currentIndex]) {
          currentIndex = Game.pickRandomUnresolvedIndex(prevState.decodingProgress)
        }

        if (currentIndex !== -1) {
          const guess =
            Game.LAUNCH_CHARSET[Math.floor(Math.random() * Game.LAUNCH_CHARSET.length)]
          displayChars[currentIndex] = guess

          if (guess === target[currentIndex]) {
            progressChars[currentIndex] = target[currentIndex]
            displayChars[currentIndex] = target[currentIndex]
            updatedProgress = progressChars.join("")
            const remaining = Game.unresolvedIndices(updatedProgress)
            decoded = remaining.length === 0
            updatedDisplay = decoded ? target : displayChars.join("")
            currentIndex = decoded ? -1 : Game.pickRandomUnresolvedIndex(updatedProgress)
          } else {
            updatedProgress = progressChars.join("")
            updatedDisplay = displayChars.join("")
            decoded = false
          }
        }
      }

      return {
        decodingProgress: updatedProgress,
        displayProgress: updatedDisplay,
        decoded,
        currentIndex,
      }
    }, () => {
      if (this.state.decoded) {
        this.concludeLaunchSimulation()
      }
    })
  }

  private concludeLaunchSimulation(): void {
    this.clearLaunchInterval()
    this.setState({
      decodingProgress: Game.LAUNCH_CODE,
      displayProgress: Game.LAUNCH_CODE,
      currentIndex: -1,
    })
  }

  private clearLaunchInterval(): void {
    if (this.launchInterval !== null) {
      clearInterval(this.launchInterval)
      this.launchInterval = null
    }
  }

  private resetSimulationState(): void {
    this.clearLaunchInterval()
    this.aiSpeed = 130
    this.aiThinking = false
    const placeholder = Game.createPlaceholder(Game.LAUNCH_CODE)
    const firstIndex = Game.pickRandomUnresolvedIndex(placeholder)

    this.setState({
      simulationActive: false,
      decoded: false,
      decodingProgress: placeholder,
      displayProgress: placeholder,
      currentIndex: firstIndex,
      gamesPlayed: 0,
    })
  }

  private static createPlaceholder(code: string): string {
    return code.split("").map((char) => (char === "-" ? "-" : "_")).join("")
  }

  private static unresolvedIndices(progress: string): number[] {
    const indices: number[] = []
    for (let i = 0; i < Game.LAUNCH_CODE.length; i++) {
      if (Game.LAUNCH_CODE[i] === "-") {
        continue
      }

      if (progress[i] !== Game.LAUNCH_CODE[i]) {
        indices.push(i)
      }
    }
    return indices
  }

  private static pickRandomUnresolvedIndex(progress: string): number {
    const remaining = Game.unresolvedIndices(progress)
    if (remaining.length === 0) {
      return -1
    }

    const choice = Math.floor(Math.random() * remaining.length)
    return remaining[choice]
  }

  otherLetter(letter: Letter): Letter {
    return letter === Letter.X ? Letter.O : Letter.X
  }
}

export default Game
