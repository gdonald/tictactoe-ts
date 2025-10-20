import React from "react"

interface LaunchSimulationProps {
  progress: string
  decoded: boolean
}

const LaunchSimulation: React.FC<LaunchSimulationProps> = ({progress, decoded}) => {
  const visibleProgress = progress.replace(/_/g, "•")

  return (
    <div className="launch-simulation">
      <p className="simulation-progress">{visibleProgress}</p>
      {decoded && <p className="simulation-result">Just kidding!<br /><br />How about a nice game of chess?</p>}
    </div>
  )
}

export default LaunchSimulation
