import type {V2_MetaFunction} from "@remix-run/node";
import {AudioRecorder} from "react-audio-voice-recorder";

import React, {useEffect, useState} from "react";
import type {UploadResponse} from "~/routes/upload";
import type {TranscribeResponse} from "~/routes/transcribe";

export const meta: V2_MetaFunction = () => {
    return [{ title: "New Remix App" }];
};

export default function Test() {
    const [pollingState, setTranscribeState] = useState<"uploading" | "transcribing" | "polling" | "summarizing" | "error" | null>(null)
    const [audioFiles, setAudioFiles] = useState<HTMLAudioElement[]>([])
    const [transcribeJob, setTranscribeJob] = useState<string | null>(null)

    useEffect(() => {
        if (pollingState === "polling" && transcribeJob) {
            let interval  = setInterval(async() => {
                await pollTranscribeJon(transcribeJob)
            }, 5000)

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

    const pollTranscribeJon = async(jobName: string) => {
        const formDataPollingTranscribeJob = new FormData()
        formDataPollingTranscribeJob.set("jobName", jobName)

        const pollTranscribePollRes = await fetch('./pollTranscribeJob', {
            method: 'POST',
            body: formDataPollingTranscribeJob
        });

        const pollTranscribePollResponse = await pollTranscribePollRes.json()

        // todo I'm not sure what to find here for actual status
        console.log('status', pollTranscribePollResponse)

        // ensures that the interval is cleared
        setTranscribeJob(null)
        setTranscribeState("summarizing")
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
        </div>
    );
}
