import {render, screen} from "@testing-library/react"
import LaunchSimulation from "../LaunchSimulation"

describe("LaunchSimulation", () => {
  it("shows underscores in the progress string as bullets", () => {
    render(<LaunchSimulation progress="C__-1___-___" decoded={false} />)

    expect(screen.getByText("C••-1•••-•••")).toBeDefined()
  })

  it("stays silent about the result while the code is undecoded", () => {
    render(<LaunchSimulation progress="___-____-___" decoded={false} />)

    expect(screen.queryByText(/Just kidding/)).toBeNull()
  })

  it("announces the result once the code is decoded", () => {
    render(<LaunchSimulation progress="CPE-1704-TKS" decoded={true} />)

    expect(screen.getByText(/Just kidding/)).toBeDefined()
  })
})
