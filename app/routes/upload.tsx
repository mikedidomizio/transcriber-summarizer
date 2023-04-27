import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import type {ActionArgs} from "@remix-run/node";
import { json, unstable_createFileUploadHandler, unstable_parseMultipartFormData} from "@remix-run/node";
import * as fs from "fs";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS S3 environment variables not set up correctly')
}

export const action = async ({request}: ActionArgs) => {
    const uploadHandler = unstable_createFileUploadHandler({
        file: ({ filename }) => filename })

    // get the form data from the POST
    const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler
    );

    // todo prefer not to cast as
    const audioBlob = formData.get('audioBlob') as FormDataEntryValue

    const client = new S3Client({
        region: 'us-east-1',
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string
        }
    });

    const readableStream = fs.createReadStream((audioBlob as any).filepath);

    const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: "hello-s3.webm",
        Body: readableStream,
        ContentType: 'audio/webm',
    });

    // todo these status codes aren't working correctly
    try {
        await client.send(command);
        return json(
            {
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
