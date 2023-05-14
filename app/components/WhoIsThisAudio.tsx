import React, {useRef} from "react";

type WhoIsThisAudioProps = {
    blobUrl: string,
    onChange: (oldName: string, name: string) => void,
    startTime: number,
    speakerLabel: string,
}

export const WhoIsThisAudio = ({ blobUrl, onChange, startTime = 0, speakerLabel }: WhoIsThisAudioProps) => {
    const ref = useRef<HTMLAudioElement>(null)
    const initialLoadRef = useRef(false)

    const setCurrentTimeToStartTime = () => {
        if (ref.current) {
            ref.current.currentTime = startTime
        }
    }

    // this is a separate function call to avoid re-rendering
    const setCurrentTimeOnLoad = () => {
        if (!initialLoadRef.current) {
            initialLoadRef.current = true
            setCurrentTimeToStartTime()
        }
    }

    return <tr data-testid="whoIsThisRow">
        <td>
            <audio ref={ref}
                   controls
                   preload="auto"
                   onCanPlay={setCurrentTimeOnLoad}
                   onPlay={setCurrentTimeToStartTime}
                   src={blobUrl}
            >
            </audio>
        </td>
        <td>
            <input type="text" placeholder="Speaker name" className="input input-bordered w-full max-w-xs" onBlur={(e) => onChange(speakerLabel, e.target.value)}/>
        </td>
    </tr>
}
