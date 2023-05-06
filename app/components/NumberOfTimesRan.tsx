import React, {useCallback, useEffect, useState} from "react";

export const NumberOfTimesRan = () => {
  const [numberOfTimes, setNumberOfTimes] = useState(-1)

  const fetchNumberOfResults = useCallback(async() => {
    const response = await fetch('/numberOfTimes')
    const json = await response.json()
    setNumberOfTimes(json.numberOfTimes)
  }, [])

  useEffect(() => {
    void fetchNumberOfResults()
  }, [fetchNumberOfResults])

  return <div className="stats stats-vertical shadow mt-4">
    <div className="stat">
      <div className="stat-title">I've done this</div>
      <div className="stat-value">{numberOfTimes > -1 ? numberOfTimes : '...' }</div>
      <div className="stat-desc">times</div>
    </div>
  </div>
}
