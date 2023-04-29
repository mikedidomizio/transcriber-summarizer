import { TranscribeClient, StartTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import type {ActionArgs} from "@remix-run/node";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS environment variables not set up correctly')
}

export type TranscribeResponse = {

}

export const action = async ({request}: ActionArgs): Promise<TranscribeResponse> => {
    const config = {
        region: 'us-east-1',
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string
        }
    }

    const formData = await request.formData();
    const s3Filename = formData.get('s3Filename') as FormDataEntryValue

    const client = new TranscribeClient(config);
    const s3Location = `s3://${AWS_S3_BUCKET}/${s3Filename}`

    console.log('Attempt to transcribe S3 file:', s3Location)

    const input = {
        LanguageCode: 'en-US',
        // todo it should be more unique to avoid conflicts
        TranscriptionJobName: `test-transcriber-summarizer-job-${s3Filename}`,
        Media: {
            MediaFileUri: s3Location,
        },
    }

    const command = new StartTranscriptionJobCommand(input);
    return client.send(command);
}
