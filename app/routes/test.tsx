import type {V2_MetaFunction} from "@remix-run/node";
import {AudioRecorder} from "react-audio-voice-recorder";

import React, {useState} from "react";
import type {UploadResponse} from "~/routes/upload";
import type {TranscribeResponse} from "~/routes/transcribe";

export const meta: V2_MetaFunction = () => {
    return [{ title: "New Remix App" }];
};

export default function Test() {
    const [audioFiles, setAudioFiles] = useState<HTMLAudioElement[]>([])

    const addAudioElement = async(blob: Blob) => {
        const formDataUpload  = new FormData();
        formDataUpload.set("audioBlob", blob, "audio.wav");

        const uploadRes = await fetch('./upload', {
            method: 'POST',
            body: formDataUpload
        });

        const uploadResponse: UploadResponse = await uploadRes.json()

        console.log(uploadResponse)

        if (!uploadResponse.filename) {
            throw new Error('File upload failure')
        }

        const formDataTranscribe = new FormData()
        formDataTranscribe.set("s3Filename", uploadResponse.filename)

        const transcribeRes = await fetch('./transcribe', {
            method: 'POST',
            body: formDataTranscribe,
        })

        const transcribeResponse: TranscribeResponse = await transcribeRes.json()

        console.log(transcribeResponse)

        return null

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
