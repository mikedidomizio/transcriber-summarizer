import {AudioRecorder} from "react-audio-voice-recorder";
import type {ChangeEvent} from "react";
import React, {useState} from "react";
import {ErrorAlert} from "~/components/ErrorAlert";

type GettingStartedProps = {
    maxAudioDurationInSeconds: number
    onFinishRecording: (blob: Blob) => void
}

const getDurationInSecondsOfAudioFile = async (blob: Blob): Promise<{ duration: number}> => {
    return new Promise((resolve) => {
        const objectURL = URL.createObjectURL(blob);
        const audio = new Audio(objectURL);

        const listener = () => {
            URL.revokeObjectURL(objectURL);
            audio.removeEventListener("canplaythrough", listener, false)
            return resolve({
                duration: parseInt(audio.duration as unknown as string, 10),
            })
        }

        audio.addEventListener(
          "canplaythrough",
          listener,
          false,
        );
    })
}

export const GettingStarted = ({ maxAudioDurationInSeconds, onFinishRecording }: GettingStartedProps) => {
    const [error, setError] = useState<string | null>(null)
    const handleUpload = async(e: ChangeEvent<HTMLInputElement>) => {
        setError(null)
        if (e && e.target?.files) {
            const {duration} = await getDurationInSecondsOfAudioFile(e.target.files[0])

            if (duration > maxAudioDurationInSeconds) {
                setError(`Audio cannot be longer than ${maxAudioDurationInSeconds} seconds`)
                return
            }

            onFinishRecording(e.target.files[0])
        }
    }

    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">Transcriber Summarizer</h1>
                <h2 className="text-2xl font-bold pt-2">By Mike DiDomizio</h2>
                <p className="py-6">I have the ability to take audio and summarize it for you
                    <br/>
                    Click the record button below to get started!
                </p>
                <div className="flex flex-col">
                    {error ? <div className="mb-4"><ErrorAlert text={error} /></div> : null}
                    <div className="flex place-content-center"><AudioRecorder onRecordingComplete={onFinishRecording} /></div>
                    <div className="my-4">- or -</div>
                    <div className="flex place-content-center">
                    <input type="file" className="file-input w-full max-w-xs" onChange={handleUpload} accept=".mp3,audio/*"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
