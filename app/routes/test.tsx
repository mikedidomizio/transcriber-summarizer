import type {V2_MetaFunction} from "@remix-run/node";

import React, {useEffect, useState} from "react";
import type {TranscribeResponse} from "~/routes/transcribe";
import type {GetTranscriptionJobResponse} from "@aws-sdk/client-transcribe";
import {separateBySpeaker} from "~/lib/transcribeBySpeaker";
import type {AwsTranscribeJobJson} from "~/lib/aws-transcribe.types";
import {GettingStarted} from "~/components/GettingStarted";
import {Error} from "~/components/Error";
import {Uploading} from "~/components/Uploading";
import {Transcribe} from "~/components/Transcribe";
import type { Replacement, Speaker} from "~/components/IdentifySpeakers";
import {IdentifySpeakers, Replacements} from "~/components/IdentifySpeakers";
import {Segment} from "~/lib/aws-transcribe.types";

export const meta: V2_MetaFunction = () => {
    return [{ title: "Transcriber Summarizer" }];
};

export default function Test() {
    const [blob, setBlob] = useState<{ blob: Blob, blobUrl: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [processState, setProcessState] = useState<"start" | "uploading" | "transcribing" | "polling" | "getText" | "identify" | "summarizing" | "done" | null>("start")
    const [audioFiles, setAudioFiles] = useState<string[]>([])
    const [speakersToIdentify, setSpeakersToIdentify] = useState<Speaker[]>([])
    const [transcribeJob, setTranscribeJob] = useState<string | null>(null)
    const [transcribeJobJSON, setTranscribeJobJSON] = useState<AwsTranscribeJobJson | null>(null)
    const [transcribeText, setTranscribeText] = useState("")
    const [summary, setSummary] = useState("")

    useEffect(() => {
        if (processState === "polling" && transcribeJob) {
            let interval  = setInterval(async() => {
                await pollTranscribeJob(transcribeJob)
            }, 3000)

            return () => {
                clearInterval(interval)
            }
        }
    }, [processState])

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

    const transcribe = async(filename: string) => {
        setProcessState("transcribing")

        const formDataTranscribe = new FormData()
        formDataTranscribe.set("s3Filename", filename)

        const transcribeRes = await fetch('./transcribe', {
            method: 'POST',
            body: formDataTranscribe,
        })

        const transcribeResponse: TranscribeResponse = await transcribeRes.json()

        if (transcribeResponse.TranscriptionJob?.TranscriptionJobName) {
            setTranscribeJob(transcribeResponse.TranscriptionJob?.TranscriptionJobName)
            setProcessState("polling")
        } else {
            setError("Failed on transcribing the file")
        }
    }

    const pollTranscribeJob = async(jobName: string) => {
        const formDataPollingTranscribeJob = new FormData()
        formDataPollingTranscribeJob.set("jobName", jobName)

        const pollTranscribePollRes = await fetch('./pollTranscribeJob', {
            method: 'POST',
            body: formDataPollingTranscribeJob
        });

        const pollTranscribePollResponse: GetTranscriptionJobResponse = await pollTranscribePollRes.json()

        if (pollTranscribePollResponse.TranscriptionJob?.TranscriptionJobStatus === "COMPLETED") {
            if (pollTranscribePollResponse.TranscriptionJob.Transcript?.TranscriptFileUri) {
                setTranscribeJob(null)
                await getText(pollTranscribePollResponse.TranscriptionJob.Transcript?.TranscriptFileUri)
            } else {
                setError("Failed polling the transcribe job")
            }
        }
    }

    const getText = async(transcriptionJobFileUri: string) => {
        setProcessState("getText")
        const formDataGetText = new FormData()
        formDataGetText.set("transcriptionJobFileUri", transcriptionJobFileUri)

        const res = await fetch('./getText', {
            method: 'POST',
            body: formDataGetText
        });

        const json = await res.json()

        setTranscribeJobJSON(json)

        const peopleToIdentity: Speaker[] = json.results.speaker_labels.segments.map((i: Segment) => {
            return {
                blobUrl: blob?.blobUrl || "",
                speakerLabel: i.speaker_label,
                startTime: i.start_time
            }
        })

        setSpeakersToIdentify(peopleToIdentity)
        setProcessState("identify")
    }

    const summarizing = async(summarizedTextForOpenAI: string) => {
        setProcessState("summarizing")

        const formDataSummarizing = new FormData()
        formDataSummarizing.set("summarizedTextForOpenAI", summarizedTextForOpenAI)

        const res = await fetch('./chatgpt', {
            method: 'POST',
            body: formDataSummarizing
        });

        const json = await res.json()

        setSummary(json as string)
        setProcessState("done")
    }

    const handleFinishIdentifying = (replacementSpeakers: Replacement[]) => {
        if (transcribeJobJSON) {
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
        return (
            <GettingStarted onFinishRecording={upload} />
        )
    }

    if (processState === "uploading" && blob) {
        return <Uploading blob={blob.blob} onComplete={transcribe} onError={setError} />
    }

    if (processState === "transcribing" || processState === "polling") {
        return <Transcribe />
    }

    if (processState === "identify") {
        return <IdentifySpeakers onFinish={handleFinishIdentifying} speakers={speakersToIdentify} />
    }

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
            <div className="flex columns-2">
                <div>
                    {transcribeText}
                </div>
                <div>
                    {summary}
                </div>
            </div>
        </div>
    );
}
