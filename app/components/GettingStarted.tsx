import {AudioRecorder} from "react-audio-voice-recorder";
import type {ChangeEvent} from "react";
import React from "react";

type GettingStartedProps = {
    onFinishRecording: (blob: Blob) => void
}

export const GettingStarted = ({ onFinishRecording }: GettingStartedProps) => {
    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e && e.target?.files) {
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
                    <div className="flex place-content-center"><AudioRecorder onRecordingComplete={onFinishRecording} /></div>
                    <div className="my-4">- or -</div>
                    <div className="flex place-content-center">
                    <input type="file" className="file-input w-full max-w-xs" onChange={(e) => handleUpload(e)} accept=".mp3,audio/*"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
