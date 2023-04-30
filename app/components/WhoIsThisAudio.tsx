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

    return <tr>
        <td>
            <audio id={blobUrl}
                   controls
                   preload="auto"
                   onPlay={setCurrentTime}
                   src={blobUrl}
            >
            </audio>
        </td>
        <td>
            <input type="text" placeholder="Speaker name" className="input input-bordered w-full max-w-xs"
                   defaultValue={speakerLabel} onBlur={(e) => onChange(speakerLabel, e.target.value)}/>
        </td>
    </tr>
}
