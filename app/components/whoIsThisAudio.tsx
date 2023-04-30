import React from "react";
import {Form} from "@remix-run/react";

type WhoIsThisAudioProps = {
    blobUrl: string,
    onChange: (oldName: string, name: string) => void,
    startTime: number,
    speakerLabel: string,
}

export const WhoIsThisAudio = ({ blobUrl, onChange, startTime = 0, speakerLabel }: WhoIsThisAudioProps) => {
    const setCurrentTime = () => {
        const audioElement = document.getElementById(blobUrl)

        if (audioElement) {
            (audioElement as HTMLAudioElement).currentTime = startTime
        }
    }

    return <>
        <audio id={blobUrl}
               controls
               preload="auto"
               onPlay={setCurrentTime}
               src={blobUrl}
        >
        </audio>
        <input placeholder="Speaker name" type="text" max="20" defaultValue={speakerLabel} onBlur={(e) => onChange(speakerLabel, e.target.value)} />
    </>
}
