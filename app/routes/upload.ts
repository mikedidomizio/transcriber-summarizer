import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import type {ActionArgs} from "@remix-run/node";
import {
    json,
    unstable_composeUploadHandlers,
    unstable_createFileUploadHandler, unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData
} from "@remix-run/node";
import * as fs from "fs";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS environment variables not set up correctly')
}

export type UploadResponse = { filename?: string, status: number }

export const action = async ({request}: ActionArgs): Promise<UploadResponse> => {
    const uploadHandler = unstable_composeUploadHandlers(
        unstable_createFileUploadHandler({
            // directory: './public/uploads',
            file: ({ filename }) => filename,
        }),
        unstable_createMemoryUploadHandler()
    )

    const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler
    );

    const audioBlob  = formData.get('audioBlob')

    const client = new S3Client({
        region: 'us-east-1',
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string
        }
    });

    const readableStream = fs.createReadStream((audioBlob as any).filepath);
    const newFileNameWithTimestamp = `hello-s3-${new Date().getTime()}.webm`

    const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: newFileNameWithTimestamp,
        Body: readableStream,
        ContentType: 'audio/webm',
    });

    try {
        await client.send(command);

        return json(
            {
                "filename": newFileNameWithTimestamp,
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
