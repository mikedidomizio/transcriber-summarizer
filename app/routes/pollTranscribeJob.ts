import {
    ActionArgs, json,
    unstable_composeUploadHandlers,
    unstable_createFileUploadHandler,
    unstable_createMemoryUploadHandler, unstable_parseMultipartFormData
} from "@remix-run/node";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import fs from "fs";
import {UploadResponse} from "~/routes/upload";
import {ListTranscriptionJobsCommand, StartTranscriptionJobCommand, TranscribeClient} from "@aws-sdk/client-transcribe";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS environment variables not set up correctly')
}

export const action = async ({request}: ActionArgs): Promise<any> => {
    const config = {
        region: 'us-east-1',
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string
        }
    }

    const client = new TranscribeClient(config);
    const params = {
        JobNameContains: "KEYWORD", // Not required. Returns only transcription
        // job names containing this string
    };

    try {
        const data = await client.send(
            new ListTranscriptionJobsCommand(params)
        );
        console.log("Success", data.TranscriptionJobSummaries);
        return data; // For unit tests.
    } catch (err) {
        console.log("Error", err);
    }
}
