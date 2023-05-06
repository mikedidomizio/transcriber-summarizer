import React, {useCallback, useEffect, useRef, useState} from "react";
import {useTranscribeJob} from "~/hooks/useTranscribeJob";
import type {Speaker} from "~/components/IdentifySpeakers";

type TranscribeProps = {
    blobUrl: string,
    filename: string,
    onComplete: ({ peopleToIdentify, json }: {peopleToIdentify: Speaker[], json: any}) => void
}

export const Transcribe = ({ blobUrl, filename, onComplete }: TranscribeProps) => {
    const [transcribeJob, setTranscribeJob] = useState<string | null>(null)
    const [numberOfTimes, setNumberOfTimes] = useState(-1)
    const ref = useRef(false)
    // const navigate = useNavigate();
    const { speakers, numberOfTimesPolled, getAWSResponse } = useTranscribeJob(transcribeJob || '')

    const fetchNumberOfResults = useCallback(async() => {
        const response = await fetch('./numberOfTimes')
        const json = await response.json()
        setNumberOfTimes(json.numberOfTimes)
    }, [])

    const createTranscribeJob = useCallback(async() => {
        const formDataTranscribe = new FormData()
        formDataTranscribe.set("s3Filename", filename)

        const transcribeRes = await fetch('./transcribe', {
            method: 'POST',
            body: formDataTranscribe,
        })

        const transcribeResponse = await transcribeRes.json()

        if (transcribeResponse.TranscriptionJob?.TranscriptionJobName) {
            setTranscribeJob(transcribeResponse.TranscriptionJob?.TranscriptionJobName)
            // navigate(`/identify/${transcribeResponse.TranscriptionJob?.TranscriptionJobName}`)
        }
    }, [filename])

    useEffect(() => {
        if (speakers !== null) {
            onComplete({
                    peopleToIdentify: speakers,
                    json: getAWSResponse
                })
        }
    }, [speakers, transcribeJob])

    useEffect(() => {
        if (!ref.current) {
            ref.current = true
            fetchNumberOfResults()
            createTranscribeJob()
        }
    }, [fetchNumberOfResults, createTranscribeJob])

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

            {numberOfTimesPolled > 0 ?<div>
                {new Array(numberOfTimesPolled).fill(5).map((i, index) => <span key={index}>.</span>)}
            </div> : null}
        </div>
    </div>
    </div>
}
