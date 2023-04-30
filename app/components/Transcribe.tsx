import React, {useCallback, useEffect, useRef, useState} from "react";
import type {GetTranscriptionJobResponse} from "@aws-sdk/client-transcribe";
import type {Speaker} from "~/components/IdentifySpeakers";
import type {Segment} from "~/lib/aws-transcribe.types";
import type {TranscribeResponse} from "~/routes/transcribe";

type TranscribeProps = {
    blobUrl: string,
    filename: string,
    onComplete: ({ peopleToIdentify, json }: {peopleToIdentify: Speaker[], json: any}) => void
}

export const Transcribe = ({ blobUrl, filename, onComplete }: TranscribeProps) => {
    const [numberOfTimesPolled, setNumberOfTimesPolled] = useState(0)
    const [isPolling, setIsPolling] = useState(false)
    const [transcribeJob, setTranscribeJob] = useState<string | null>(null)
    const [numberOfTimes, setNumberOfTimes] = useState(-1)
    const ref = useRef(false)

    const fetchNumberOfResults = useCallback(async() => {
        const response = await fetch('./numberOfTimes')
        const json = await response.json()

        setNumberOfTimes(json.numberOfTimes)
    }, [])

    const transcribe = async() => {
        const formDataTranscribe = new FormData()
        formDataTranscribe.set("s3Filename", filename)

        const transcribeRes = await fetch('./transcribe', {
            method: 'POST',
            body: formDataTranscribe,
        })

        const transcribeResponse: TranscribeResponse = await transcribeRes.json()

        if (transcribeResponse.TranscriptionJob?.TranscriptionJobName) {
            setTranscribeJob(transcribeResponse.TranscriptionJob?.TranscriptionJobName)
        }

        setIsPolling(true)
    }


    useEffect(() => {
        if (!ref.current) {
            ref.current = true
            fetchNumberOfResults()
            transcribe()
        }
    }, [fetchNumberOfResults])


    const getText = async(transcriptionJobFileUri: string) => {
        const formDataGetText = new FormData()
        formDataGetText.set("transcriptionJobFileUri", transcriptionJobFileUri)

        const res = await fetch('./getText', {
            method: 'POST',
            body: formDataGetText
        });

        const json = await res.json()

        const peopleToIdentity: Speaker[] = json.results.speaker_labels.segments.map((i: Segment) => {
            return {
                blobUrl: blobUrl,
                speakerLabel: i.speaker_label,
                startTime: i.start_time
            }
        })

        onComplete({
            json,
            peopleToIdentify: peopleToIdentity
        })
    }


    const pollTranscribeJob = async(jobName: string) => {
        const formDataPollingTranscribeJob = new FormData()
        formDataPollingTranscribeJob.set("jobName", jobName)

        const pollTranscribePollRes = await fetch('./pollTranscribeJob', {
            method: 'POST',
            body: formDataPollingTranscribeJob
        });

        const pollTranscribePollResponse: GetTranscriptionJobResponse = await pollTranscribePollRes.json()

        if (pollTranscribePollResponse.TranscriptionJob?.TranscriptionJobStatus === "COMPLETED") {
            if (pollTranscribePollResponse.TranscriptionJob.Transcript?.TranscriptFileUri) {
                setTranscribeJob(null)
                await getText(pollTranscribePollResponse.TranscriptionJob.Transcript?.TranscriptFileUri)
            }
        }
    }

    useEffect(() => {
        if (isPolling && transcribeJob) {
            let interval  = setInterval(async() => {
                await pollTranscribeJob(transcribeJob)
            }, 3000)

            return () => {
                clearInterval(interval)
            }
        }
    }, [isPolling, transcribeJob])

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
                {new Array().fill(numberOfTimesPolled).map(i => '.')}
            </div>
        </div>
    </div>
    </div>
}
