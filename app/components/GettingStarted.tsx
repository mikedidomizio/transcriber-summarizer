import {AudioRecorder} from "react-audio-voice-recorder";
import React from "react";

type GettingStartedProps = {
    onFinishRecording: (blob: Blob) => void
}

export const GettingStarted = ({ onFinishRecording }: GettingStartedProps) => {
    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">Transcriber Summarizer</h1>
                <p className="py-6">I have the ability to take audio and summarize it for you
                    <br/>
                    Click the record button below to get started!
                </p>
                <div className="flex place-content-center">
                    <AudioRecorder onRecordingComplete={onFinishRecording} />
                </div>
            </div>
        </div>
    </div>
}
