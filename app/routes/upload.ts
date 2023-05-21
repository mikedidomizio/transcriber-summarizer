import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import type {ActionArgs} from "@remix-run/node";
import {
    json,
    unstable_composeUploadHandlers,
    unstable_createFileUploadHandler, unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData
} from "@remix-run/node";
import * as fs from "fs";
import { v4 as uuidv4 } from 'uuid';

const { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_TAGGING } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_REGION || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET || !AWS_TAGGING) {
    throw new Error('AWS environment variables not set up correctly')
}

const { MAX_AUDIO_FILE_SIZE } = process.env

if (!MAX_AUDIO_FILE_SIZE) {
    throw new Error("Could not get max audio file size")
}

export type UploadResponse = { filename?: string, status: number }

export enum UploadFormData {
    audioBlob = 'audioBlob'
}

export const action = async ({request}: ActionArgs): Promise<UploadResponse> => {
    const uploadHandler = unstable_composeUploadHandlers(
        unstable_createFileUploadHandler({
            // directory: './public/uploads',
            maxPartSize: MAX_AUDIO_FILE_SIZE as string as unknown as number,
            file: ({ filename }) => filename,
        }),
        unstable_createMemoryUploadHandler()
    )

    const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler
    );

    const audioBlob  = formData.get(UploadFormData.audioBlob)

    const client = new S3Client({
        region: AWS_REGION,
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
    });

    const readableStream = fs.createReadStream((audioBlob as any).filepath);
    const newFilenameWithUuid = `audio-${uuidv4()}.webm`

    const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: newFilenameWithUuid,
        Body: readableStream,
        ContentType: 'audio/webm',
        Tagging: AWS_TAGGING
    });

    try {
        await client.send(command);
        client.destroy()

        return json(
            {
                "filename": newFilenameWithUuid,
                status: 201,
            }
        );
    } catch (err) {
        return json(
            {
                status: 520,
            }
        );
    }
}
