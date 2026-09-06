import {expect, Locator, Page, test} from "@playwright/test"

function squares(page: Page): Locator {
  return page.locator("td.piece img")
}

function squaresShowing(page: Page, image: string): Locator {
  return page.locator(`td.piece img[src="img/${image}.png"]`)
}

function playerCountOption(page: Page, count: string): Locator {
  return page.locator(`input[name="numberPlayers"][value="${count}"]`)
}

test.beforeEach(async ({page}) => {
  await page.goto("/")
})

test("draws an empty three by three board", async ({page}) => {
  await expect(squaresShowing(page, "empty")).toHaveCount(9)
})

test("offers a choice of zero, one, or two players", async ({page}) => {
  await expect(page.locator("input[name=\"numberPlayers\"]")).toHaveCount(3)
})

test("starts in one player mode", async ({page}) => {
  await expect(playerCountOption(page, "1")).toBeChecked()
})

test("marks the square the player clicks", async ({page}) => {
  await squares(page).first().click()

  await expect(squaresShowing(page, "x")).toHaveCount(1)
})

test("lets the computer answer the player's move", async ({page}) => {
  await squares(page).first().click()

  await expect(squaresShowing(page, "o")).toHaveCount(1)
})

test("ignores a click on a square that is already taken", async ({page}) => {
  await squares(page).first().click()
  await expect(squaresShowing(page, "o")).toHaveCount(1)

  await squares(page).first().click()

  await expect(squaresShowing(page, "x")).toHaveCount(1)
})

test("leaves the computer out of a two player game", async ({page}) => {
  await playerCountOption(page, "2").click()

  await squares(page).first().click()

  await expect(squaresShowing(page, "empty")).toHaveCount(8)
})

test("alternates letters between the two people playing", async ({page}) => {
  await playerCountOption(page, "2").click()

  await squares(page).first().click()
  await squares(page).nth(1).click()

  await expect(squaresShowing(page, "o")).toHaveCount(1)
})

test("clears the board when the number of players changes", async ({page}) => {
  await squares(page).first().click()
  await expect(squaresShowing(page, "o")).toHaveCount(1)

  await playerCountOption(page, "2").click()

  await expect(squaresShowing(page, "empty")).toHaveCount(9)
})

test("plays itself when no players are selected", async ({page}) => {
  await playerCountOption(page, "0").click()

  await expect(squaresShowing(page, "empty")).not.toHaveCount(9)
})

test("decodes the launch code once it has played out its games", async ({page}) => {
  await page.goto("/?games=3&aiSpeed=1&aiDelay=1&decodeSpeed=1")

  await playerCountOption(page, "0").click()

  await expect(page.locator(".launch-simulation")).toBeVisible()
  await expect(page.locator(".simulation-result")).toContainText("nice game of chess")
})

test("keeps playing while it still has games left", async ({page}) => {
  await page.goto("/?games=500&aiSpeed=1&aiDelay=1")

  await playerCountOption(page, "0").click()
  await expect(squaresShowing(page, "empty")).not.toHaveCount(9)

  await expect(page.locator(".launch-simulation")).toHaveCount(0)
})
