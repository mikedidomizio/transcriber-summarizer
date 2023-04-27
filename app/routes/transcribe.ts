import { TranscribeClient, StartTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import {ActionArgs} from "@remix-run/node";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS environment variables not set up correctly')
}

export const action = async ({request}: ActionArgs) => {
    const config = {
        region: 'us-east-1',
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string
        }
    }

    const client = new TranscribeClient(config);

    const input = {
        LanguageCode: 'en-US',
        TranscriptionJobName: 'test-transcriber-summarizer-job',
        Media: { // Media
            MediaFileUri: `s3://${AWS_S3_BUCKET}/hello-s3.webm`,
        },
    }

    const command = new StartTranscriptionJobCommand(input);
    const response = await client.send(command);

    console.log(response)
    return null
}
