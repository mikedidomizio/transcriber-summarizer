import type {ActionArgs, LoaderArgs, V2_MetaFunction} from "@remix-run/node";
import {AudioRecorder} from "react-audio-voice-recorder";

import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

export const meta: V2_MetaFunction = () => {
    return [{ title: "New Remix App" }];
};

export default function Test() {
    const addAudioElement = async(blob: Blob) => {
        console.log(blob)

        const formData  = new FormData();
        formData.append("audioBlob", blob, "audio.wav");

        const res = await fetch('./upload', {
            method: 'POST',
            body: formData
        });

        const res2 = await fetch('./transcribe', {
            method: 'POST',
            body: '',
        })

        const url = URL.createObjectURL(blob);
        const audio = document.createElement("audio");
        audio.src = url;
        audio.controls = true;
        document.body.appendChild(audio);
    }

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
            <AudioRecorder onRecordingComplete={addAudioElement} />
        </div>
    );
}
