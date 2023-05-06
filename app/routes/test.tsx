import type {V2_MetaFunction} from "@remix-run/node";

import React, {useEffect, useState} from "react";
import {separateBySpeaker} from "~/lib/transcribeBySpeaker";
import type {AwsTranscribeJobJson} from "~/lib/aws-transcribe.types";
import {GettingStarted} from "~/components/GettingStarted";
import {Error} from "~/components/Error";
import {Uploading} from "~/components/Uploading";
import {Transcribe} from "~/components/Transcribe";
import type { Replacement, Speaker} from "~/components/IdentifySpeakers";
import {IdentifySpeakers} from "~/components/IdentifySpeakers";
import {Summarize} from "~/components/Summarize";
import {redirect} from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Transcriber Summarizer" }];
};

export default function Test() {
    const [blob, setBlob] = useState<{ blob: Blob, blobUrl: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [processState, setProcessState] = useState<"start" | "uploading" | "transcribing" | "identify" | "summarizing" | "done">("start")
    const [audioFiles, setAudioFiles] = useState<string[]>([])
    const [speakersToIdentify, setSpeakersToIdentify] = useState<Speaker[]>([])
    const [transcribeJob, setTranscribeJob] = useState<string | null>(null)
    const [transcribeJobJSON, setTranscribeJobJSON] = useState<AwsTranscribeJobJson | null>(null)
    const [transcribeText, setTranscribeText] = useState("")

    useEffect(() => {
        return () => {
            // release the resources
            audioFiles.forEach(i => URL.revokeObjectURL(i))
        }
    }, [audioFiles])

    const upload = (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob)
        setBlob({
            blob, blobUrl
        })
        setProcessState("uploading")
    }

    const summarizing = async(textforOpenAi: string) => {
        setTranscribeText(textforOpenAi)
        setProcessState("summarizing")
    }

    const handleCompleteSummarizing = (openAiResponse: string) => {
        setProcessState("done")
    }

    const handleCompleteTranscribing = ({ json, peopleToIdentify }: { json: AwsTranscribeJobJson, peopleToIdentify: Speaker[]}) => {
        setTranscribeJobJSON(json)
        setSpeakersToIdentify(peopleToIdentify)
        setProcessState("identify")
    }

    const handleFinishIdentifying = (replacementSpeakers: Replacement[]) => {

        if (transcribeJobJSON) {
            // todo setting the state, while also updating the state right after?
            setTranscribeJobJSON((json) => {
                if (json) {
                    json.results.items.forEach((i ,index) => {
                        // todo not very optimized
                        const replacement = replacementSpeakers.find(replacement => replacement.oldValue === i.speaker_label)

                        if (replacement) {
                            json.results.items[index] = {
                                ...i,
                                speaker_label: replacement.newValue
                            }
                        }
                    })

                    return json
                }

                return null
            })

            const summarizedText = separateBySpeaker(transcribeJobJSON)
            setTranscribeText(summarizedText)
            return summarizing(summarizedText)
        } else {
            setError("Somehow I don't have the transcribe JSON")
        }
    }

    if (error !== null) {
        return <Error error={error} />
    }

    if (processState === "start") {
        return <GettingStarted onFinishRecording={upload} />
    }

    if (processState === "uploading" && blob) {
        return <Uploading blob={blob.blob} onComplete={(filename) => {
            setTranscribeJob(filename)
            setProcessState("transcribing")
        }} onError={setError} />
    }

    if (processState === "transcribing" && transcribeJob) {
        return <Transcribe blobUrl={blob?.blobUrl || ''} filename={transcribeJob} onComplete={handleCompleteTranscribing} />
    }

    if (processState === "identify") {
        return <IdentifySpeakers blobUrl={blob?.blobUrl || ''} onFinish={handleFinishIdentifying} speakers={speakersToIdentify} />
    }

    if (processState === "summarizing" || processState === "done") {
        return <Summarize textToSummarize={transcribeText} onComplete={handleCompleteSummarizing} />
    }

    return `Woah am I missing a state? ${processState}`
}
