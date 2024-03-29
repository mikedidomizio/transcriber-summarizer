import React, {useCallback, useEffect, useRef} from "react";
import type {UploadResponse} from "~/routes/upload";
import {TranscribeOptions} from "~/components/TranscribeOptions";
import {UploadFormData} from "~/routes/upload";
import {useTranscribeOptions} from "~/providers/TranscribeOptionsProvider";

type Filename = { filename: string }
type CallbackObject = Filename

type UploadingProps = {
    blob: Blob,
    onComplete: (callbackObject: CallbackObject) => void
    onError: (errorText: string) => void
}

export const Uploading = ({ blob, onComplete, onError }: UploadingProps) => {
    const ref = useRef(false)
    const {options} = useTranscribeOptions()

    const upload = useCallback(async(blob: Blob) => {
        const formDataUpload  = new FormData();
        formDataUpload.set(UploadFormData.audioBlob, blob, "audio.wav");

        try {
            const uploadRes = await fetch('/upload', {
                method: 'POST',
                body: formDataUpload
            });

            const uploadResponse: UploadResponse = await uploadRes.json()

            if (!uploadResponse.filename) {
                onError("Failed on getting a filename for the S3 file")
                return
            }

            if (options) {
                onComplete({
                    ...{ filename: uploadResponse.filename },
                    ...options
                })
                return
            }

            onComplete({
                ...{ filename: uploadResponse.filename },
            })

        } catch(e) {
            onError("Failed on uploading to AWS")
        }
    },[onComplete, onError, options])

    useEffect(() => {
        if (!ref.current) {
            ref.current = true
            void upload(blob)
        }
    }, [upload, blob])

    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">Uploading your file</h1>
                <div className="flex place-content-center">
                    <TranscribeOptions />
                </div>
            </div>
        </div>
    </div>
}
