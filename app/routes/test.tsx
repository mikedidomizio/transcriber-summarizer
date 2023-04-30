import type {V2_MetaFunction} from "@remix-run/node";
import {AudioRecorder} from "react-audio-voice-recorder";

import React, {useEffect, useState} from "react";
import type {UploadResponse} from "~/routes/upload";
import type {TranscribeResponse} from "~/routes/transcribe";
import type {GetTranscriptionJobResponse} from "@aws-sdk/client-transcribe";
import {separateBySpeaker} from "~/lib/transcribeBySpeaker";

export const meta: V2_MetaFunction = () => {
    return [{ title: "New Remix App" }];
};

export default function Test() {
    const [pollingState, setTranscribeState] = useState<"uploading" | "transcribing" | "polling" | "getText" | "summarizing" | "done" | "error" | null>(null)
    const [audioFiles, setAudioFiles] = useState<HTMLAudioElement[]>([])
    const [transcribeJob, setTranscribeJob] = useState<string | null>(null)
    const [transcribeText, setTranscribeText] = useState("")
    const [summary, setSummary] = useState("")


    useEffect(() => {
        if (pollingState === "polling" && transcribeJob) {
            let interval  = setInterval(async() => {
                await pollTranscribeJob(transcribeJob)
            }, 3000)

            return () => {
                clearInterval(interval)
            }
        }
    }, [pollingState])

    const upload = async(blob: Blob) => {
        setTranscribeState("uploading")
        const formDataUpload  = new FormData();
        formDataUpload.set("audioBlob", blob, "audio.wav");

        try {
            const uploadRes = await fetch('./upload', {
                method: 'POST',
                body: formDataUpload
            });

            const uploadResponse: UploadResponse = await uploadRes.json()

            if (!uploadResponse.filename) {
                setTranscribeState("error")
                return
            }

            return transcribe(uploadResponse.filename)
        } catch(e) {
            setTranscribeState("error")
        }
    }

    const transcribe = async(filename: string) => {
        setTranscribeState("transcribing")

        const formDataTranscribe = new FormData()
        formDataTranscribe.set("s3Filename", filename)

        const transcribeRes = await fetch('./transcribe', {
            method: 'POST',
            body: formDataTranscribe,
        })

        const transcribeResponse: TranscribeResponse = await transcribeRes.json()

        if (transcribeResponse.TranscriptionJob?.TranscriptionJobName) {
            setTranscribeJob(transcribeResponse.TranscriptionJob?.TranscriptionJobName)
            setTranscribeState("polling")
        } else {
            setTranscribeState("error")
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
                setTranscribeState("error")
            }
        }
    }

    const getText = async(transcriptionJobFileUri: string) => {
        setTranscribeState("getText")
        const formDataGetText = new FormData()
        formDataGetText.set("transcriptionJobFileUri", transcriptionJobFileUri)

        const res = await fetch('./getText', {
            method: 'POST',
            body: formDataGetText
        });

        const json = await res.json()

        const summarizedText = separateBySpeaker(json)

        setTranscribeText(summarizedText)

        await summarizing(summarizedText)
    }

    const summarizing = async(summarizedTextForOpenAI: string) => {
        setTranscribeState("summarizing")

        const formDataSummarizing = new FormData()
        formDataSummarizing.set("summarizedTextForOpenAI", summarizedTextForOpenAI)

        const res = await fetch('./chatgpt', {
            method: 'POST',
            body: formDataSummarizing
        });

        const json = await res.json()

        setSummary(json as string)
        setTranscribeState("done")
    }

    //     const url = URL.createObjectURL(blob);
    //     const audio = document.createElement("audio");
    //     audio.src = url;
    //     audio.controls = true;
    //
    //     setAudioFiles((existingAudioFiles) => [
    //         // ...existingAudioFiles,
    //         audio
    //     ])

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
            <AudioRecorder onRecordingComplete={upload} />
            <>{audioFiles.map(i => document.body.append(i))}</>
            {pollingState}

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
