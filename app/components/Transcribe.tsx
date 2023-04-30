import React, {useEffect, useRef, useState} from "react";

export const Transcribe = () => {
    const [numberOfTimes, setNumberOfTimes] = useState(-1)
    const ref = useRef(false)

    useEffect(() => {
        const fetchNumberOfTimes = async () => {
            const response = await fetch('./numberOfTimes')
            const json = await response.json()
            console.log(json)

            setNumberOfTimes(json.numberOfTimes)
        }

        if (!ref.current) {
            ref.current = true
            fetchNumberOfTimes()
        }
    }, [])

    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">Transcribing</h1>
                <p>
                    This can take anywhere from 5 seconds or more depending on the length of the recording
                </p>

                <div className="stats stats-vertical shadow mt-4">
                <div className="stat">
                    <div className="stat-title">I've done this</div>
                    <div className="stat-value">{numberOfTimes > -1 ? numberOfTimes : '...' }</div>
                    <div className="stat-desc">times</div>
                </div>
            </div>
        </div>
    </div>
    </div>
}
