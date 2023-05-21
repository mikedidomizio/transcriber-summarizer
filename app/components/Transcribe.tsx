import React, {useCallback, useEffect, useRef, useState} from "react";
import {useTranscribeJob} from "~/hooks/useTranscribeJob";
import type {Speaker} from "~/components/IdentifySpeakers";
import {NumberOfTimesRan} from "~/components/NumberOfTimesRan";
import {TranscribeOptions} from "~/components/TranscribeOptions";
import {TranscribeFormData} from "~/routes/transcribe";
import {useTranscribeOptions} from "~/providers/TranscribeOptionsProvider";

type TranscribeProps = {
    filename: string,
    onComplete: ({ peopleToIdentify, json }: {peopleToIdentify: Speaker[], json: any}) => void
}

export const Transcribe = ({ filename, onComplete }: TranscribeProps) => {
    const [transcribeJob, setTranscribeJob] = useState<string | null>(null)
    const ref = useRef(false)
    const { speakers, numberOfTimesPolled, getAWSResponse } = useTranscribeJob(transcribeJob || '')
    const { options, hasSubmitted } = useTranscribeOptions()

    const createTranscribeJob = useCallback(async() => {
        const formDataTranscribe = new FormData()
        formDataTranscribe.set(TranscribeFormData.s3Filename, filename)
        formDataTranscribe.set(TranscribeFormData.maxNumberOfSpeakers, String(options.maxNumberOfSpeakers))

        const transcribeRes = await fetch('/transcribe', {
            method: 'POST',
            body: formDataTranscribe,
        })

        const transcribeResponse = await transcribeRes.json()

        if (transcribeResponse.TranscriptionJob?.TranscriptionJobName) {
            setTranscribeJob(transcribeResponse.TranscriptionJob?.TranscriptionJobName)
        }
    }, [filename, options.maxNumberOfSpeakers])

    useEffect(() => {
        if (speakers !== null) {
            onComplete({
                    peopleToIdentify: speakers,
                    json: getAWSResponse
                })
        }
    }, [getAWSResponse, onComplete, speakers, transcribeJob])

    useEffect(() => {
        if (!ref.current && hasSubmitted) {
            ref.current = true
            void createTranscribeJob()
        }
    }, [createTranscribeJob, hasSubmitted])

    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">Transcribing</h1>
                <p>
                    This can take anywhere from 5 seconds or more depending on the length of the recording
                </p>
                <NumberOfTimesRan />
                {numberOfTimesPolled > 0 ?<div>
                    {new Array(numberOfTimesPolled).fill(5).map((i, index) => <span key={index}>.</span>)}
                </div> : null}

                {!hasSubmitted ? <div className="flex place-content-center"><TranscribeOptions label="Almost ready to transcribe your audio but first, What is the max number of speakers in this audio?" /></div> : null}
        </div>
    </div>
    </div>
}
