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
