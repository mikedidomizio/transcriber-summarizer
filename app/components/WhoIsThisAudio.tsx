import React, {useRef} from "react";

type WhoIsThisAudioProps = {
    blobUrl: string,
    onChange: (oldName: string, name: string) => void,
    startTime: number,
    speakerLabel: string,
}

export const WhoIsThisAudio = ({ blobUrl, onChange, startTime = 0, speakerLabel }: WhoIsThisAudioProps) => {
    const ref = useRef<HTMLAudioElement>(null)

    const setCurrentTime = () => {
        if (ref.current) {
            ref.current.currentTime = startTime
        }
    }

    return <tr data-testid="whoIsThisRow">
        <td>
            <audio ref={ref}
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
