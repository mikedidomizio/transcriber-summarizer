import {AudioRecorder} from "react-audio-voice-recorder";
import React, {useEffect} from "react";
import {UploadResponse} from "~/routes/upload";

type UploadingProps = {
    blob: Blob,
    onComplete: (filename: string) => void
    onError: (errorText: string) => void
}

export const Uploading = ({ blob, onComplete, onError }: UploadingProps) => {

    const upload = async(blob: Blob) => {
        const formDataUpload  = new FormData();
        formDataUpload.set("audioBlob", blob, "audio.wav");

        try {
            const uploadRes = await fetch('./upload', {
                method: 'POST',
                body: formDataUpload
            });

            const uploadResponse: UploadResponse = await uploadRes.json()

            if (!uploadResponse.filename) {
                onError("Failed on getting a filename for the S3 file")
                return
            }

            onComplete(uploadResponse.filename)
        } catch(e) {
            onError("Failed on uploading to AWS")
        }
    }

    useEffect(() => {
        upload(blob)
    }, [blob])

    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">Uploading your file</h1>
            </div>
        </div>
    </div>
}
