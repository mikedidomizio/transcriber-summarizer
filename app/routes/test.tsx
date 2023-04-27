import type { V2_MetaFunction } from "@remix-run/node";
import {AudioRecorder} from "react-audio-voice-recorder";

export const meta: V2_MetaFunction = () => {
    return [{ title: "New Remix App" }];
};

export default function Test() {
    const addAudioElement = (blob: Blob) => {
        console.log(blob)
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
