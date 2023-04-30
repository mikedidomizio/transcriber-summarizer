import React, {useEffect, useState} from "react";
import {WhoIsThisAudio} from "~/components/WhoIsThisAudio";

export type Speaker = { blobUrl: string, startTime: string, speakerLabel: string }

export type Replacement = { oldValue: string, newValue: string }

type IdentifySpeakersProps = {
    onFinish: (replacements: Replacement[]) => void
    speakers: Speaker[]
}

export const IdentifySpeakers = ({ onFinish, speakers }: IdentifySpeakersProps) => {
    const [speakersState, setSpeakersState] = useState<Replacement[]>([])

    useEffect(() => {
        const replaceState: Replacement[] = speakers.map(i => ({ oldValue: i.speakerLabel, newValue: i.speakerLabel }))
        setSpeakersState(replaceState)
    }, [speakers])

    const handleChange = (oldValue: string, newValue: string) => {
        const speaker = speakersState.find(i => i.oldValue === oldValue)

        if (speaker) {
            speaker.newValue = newValue
            setSpeakersState(speakersState)
        }
    }

    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-lg">
                <h1 className="text-4xl font-bold">Cool we're almost done!</h1>
                {speakers.length > 0 ? <>
                    <p>Let's give names to these awesome people</p>
                    <p className="mt-4">
                        <div className="overflow-x-auto my-4">
                            <table className="table w-full">
                                <thead>
                                <tr>
                                    <th>Audio</th>
                                    <th>Name</th>
                                </tr>
                                </thead>
                                <tbody>
                                {speakers.map(({ blobUrl, speakerLabel, startTime }) => (
                                    <WhoIsThisAudio blobUrl={blobUrl} key={speakerLabel} onChange={handleChange} speakerLabel={speakerLabel} startTime={parseInt(startTime, 10)} />
                                ))}
                                </tbody>
                            </table>
                            <button className="btn btn-primary mt-4" onClick={() => onFinish(speakersState)} >Click here when finished identifying speakers</button>
                        </div>
                    </p>
                </> : null}

                {speakers.length === 0 ? <div className="my-4">Woah no speakers?  Did anyone speak?</div> : null}
            </div>
        </div>
    </div>
}
