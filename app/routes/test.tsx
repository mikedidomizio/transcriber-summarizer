import type {V2_MetaFunction} from "@remix-run/node";
import {AudioRecorder} from "react-audio-voice-recorder";

import React, {useState} from "react";
import type {UploadResponse} from "~/routes/upload";

export const meta: V2_MetaFunction = () => {
    return [{ title: "New Remix App" }];
};

export default function Test() {
    const [audioFiles, setAudioFiles] = useState<HTMLAudioElement[]>([])

    const addAudioElement = async(blob: Blob) => {
        const timestamp = "" + new Date().getTime()

        const formData  = new FormData();
        formData.set("audioBlob", blob, "audio.wav");
        formData.set("timestamp", timestamp)

        const res = await fetch('./upload', {
            method: 'POST',
            body: formData
        });

        const uploadResponse: UploadResponse = await res.json()

        return null

        const res2 = await fetch('./transcribe', {
            method: 'POST',
            body: {
                timestamp,
            },
        })

        const res3 = await fetch('./chatgpt', {
            method: 'POST',
            body: '',
        })

        const url = URL.createObjectURL(blob);
        const audio = document.createElement("audio");
        audio.src = url;
        audio.controls = true;

        setAudioFiles((existingAudioFiles) => [
            // ...existingAudioFiles,
            audio
        ])
    }

    console.log(audioFiles)

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
            <AudioRecorder onRecordingComplete={addAudioElement} />
            <>{audioFiles.map(i => document.body.append(i))}</>
        </div>
    );
}
