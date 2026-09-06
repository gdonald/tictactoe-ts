## tictactoe-ts

TicTacToe written in Typescript using React.

![TicTacToe](https://raw.githubusercontent.com/gdonald/tictactoe-ts/main/ss.png "TicTacToe")

#### Install

``
npm install
``

#### Run

``
npm start
``

#### Test

Everything at once, unit tests with coverage followed by the browser tests:

``
./test.sh
``

``
./test.sh --unit
``

Jest covers the board, the computer's move selection, the React components, and the
entry point. It runs in jsdom, with `Math.random` and the game's timers under test
control.

``
npm test
``

The same suite with a coverage report. The run fails if statements, branches,
functions, or lines drop below 100%.

``
npm run test:coverage
``

Playwright drives the built app in Chromium against the dev server on port 9876,
which it starts and stops itself. Download the browser once before the first run.

``
npx playwright install chromium
``

``
npm run test:e2e
``

#### Timings

The game's four timings are read from the query string, so a browser can ask for a
faster game than the one the demo ships with. The end to end tests use this to watch
the computer play itself out in a couple of seconds instead of a couple of minutes.

| Parameter | Default | Controls |
| --- | --- | --- |
| `games` | 80 | games the computer plays itself before it gives up and decodes the launch code |
| `aiSpeed` | 130 | milliseconds between moves while the computer plays itself, shortened by 5 after each game |
| `aiDelay` | 200 | milliseconds the computer takes to answer a person's move |
| `decodeSpeed` | 150 | milliseconds between guesses at the launch code |

A value that is missing, negative, or not a number falls back to the default.

[http://localhost:9876/?games=3&aiSpeed=1&aiDelay=1&decodeSpeed=1](http://localhost:9876/?games=3&aiSpeed=1&aiDelay=1&decodeSpeed=1)

#### Lint and Types

``
npm run lint
``

``
npx tsc --noEmit
``

#### Play Locally

[http://localhost:9876/](http://localhost:9876/)

#### Play Online / Demo

[https://gdonald.github.io/tictactoe-ts/](https://gdonald.github.io/tictactoe-ts/)
